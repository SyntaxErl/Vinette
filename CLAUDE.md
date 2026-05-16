# TaskFlow — CLAUDE.md

## Project Overview

**TaskFlow** is a full-stack task management web application built as a learning project by Erl. Inspired by Notion and Trello, it features a Kanban board, calendar view, analytics, team collaboration, and in-app notifications.

The repo is a monorepo with two independent packages — no root-level `package.json` ties them together. Run each separately.

---

## Tech Stack

### Frontend (`client/`)
| Layer | Library |
|---|---|
| Framework | React 19 via Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand v5 |
| Routing | React Router DOM v7 |
| HTTP | Axios |
| Charts | Recharts |
| Drag & Drop | @hello-pangea/dnd |
| Calendar | react-big-calendar |
| Toasts | react-hot-toast |
| Icons | react-icons |

### Backend (`server/`)
| Layer | Library |
|---|---|
| Runtime | Node.js (CommonJS) |
| Framework | Express 5 |
| Database | MySQL via mysql2 |
| Auth | jsonwebtoken + bcryptjs |
| File Uploads | Multer |
| Dev | nodemon |

---

## Running the Project

```bash
# Backend (http://localhost:5000)
cd server
npm run dev

# Frontend (http://localhost:5173)
cd client
npm run dev
```

### Required: `.env` in `server/`
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=taskflow_db
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRES_IN=7d
```

### Database
MariaDB via XAMPP. The actual schema in use is **`vinette_db`** (the `.env` example still
says `taskflow_db` — `DB_NAME` must match the real database name). Tables:
`users`, `tasks`, `subtasks`, `comments`, `activity_log`, `notifications`, `team_members`.

### Database Schema (key columns — verified against the live DB)

> ⚠️ The DB column names do **not** match the names the API/frontend use. Controllers
> bridge this with SQL aliases — keep these mappings intact when editing queries.

| Table | Notable columns | API/frontend name | Notes |
|---|---|---|---|
| `comments` | `body` (TEXT) | `content` | `SELECT c.body AS content`; INSERT into `body`. No `content` column exists. |
| `subtasks` | `is_done` (TINYINT) | `is_completed` | `SELECT *, is_done AS is_completed`; INSERT/UPDATE `is_done`. Also has `assigned_to`, `due_date` (unused by code). |
| `activity_log` | `action` (VARCHAR 100), `detail` (TEXT, nullable) | `action` | Controllers only write `action`; `detail` left null. |
| `tasks` | `is_repeated` (enum) | `repeat` | `SELECT ... is_repeated AS \`repeat\``; INSERT/UPDATE `is_repeated`. Renamed from `repeat` to dodge the reserved word. |

All `comments`/`subtasks`/`activity_log` rows cascade-delete with their parent task (FKs).

---

## Project Structure

```
Vinette/
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance (base URL + interceptors)
│   │   ├── assets/images/         # logo.png, login.png, register.png
│   │   ├── components/
│   │   │   ├── navbar/            # Navbar, NavbarButtons, NavbarWidgets, navbarConfig
│   │   │   ├── tasks/             # BulkActionBar, EmptyState, LoadingState,
│   │   │   │                      #   Pagination, TaskCard, TaskDropdown,
│   │   │   │                      #   TaskFilters, TaskTable, TaskTableRow
│   │   │   ├── DashboardSkeleton.jsx
│   │   │   ├── NewTaskModal.jsx
│   │   │   ├── NotificationModal.jsx
│   │   │   ├── ProtectedRoute.jsx # Redirects unauthenticated users to /login
│   │   │   └── Sidebar.jsx
│   │   ├── constants/
│   │   │   └── taskOptions.js     # Shared status/priority/category option arrays
│   │   ├── hooks/
│   │   │   └── useTasks.jsx       # Fetches paginated + filtered tasks
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx     # Shell with Sidebar + Navbar wrapping all protected pages
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx      # Stats cards, weekly activity chart, category donut
│   │   │   ├── MyTasks.jsx        # Table view with filters, search, pagination, bulk actions
│   │   │   ├── BoardView.jsx      # Kanban drag-and-drop board
│   │   │   ├── Calendar.jsx       # Monthly calendar with tasks by due date
│   │   │   ├── Analytics.jsx      # Completion rate, priority/category charts, trends
│   │   │   ├── Notifications.jsx
│   │   │   ├── Profile.jsx        # User settings, avatar, theme preference
│   │   │   └── Team.jsx           # Team members, roles, task assignment
│   │   ├── services/
│   │   │   ├── authService.js     # register, login, getMe API calls
│   │   │   └── taskService.js     # CRUD + bulk + dashboard API calls
│   │   ├── store/
│   │   │   ├── authStore.js       # user, token, isAuthenticated — persisted in localStorage
│   │   │   └── taskStore.js       # dashboardStats, taskVersion counter, modal open state
│   │   ├── utils/
│   │   │   └── taskHelpers.jsx    # Shared helper functions for tasks
│   │   ├── App.jsx                # Router setup, session restore on mount
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── public/favicon.ico
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── vercel.json                # Frontend deployment config
│
└── server/                        # Express backend
    └── src/
        ├── config/
        │   └── db.js              # mysql2 connection pool
        ├── controllers/
        │   ├── auth.controller.js # register, login, getMe
        │   └── task.controller.js # getTasks, createTask, updateTask,
        │                          #   deleteTask, bulkAction, getDashboard
        ├── middleware/
        │   └── authMiddleware.js  # Verifies JWT, attaches req.user
        └── routes/
            ├── auth.routes.js     # POST /auth/register, POST /auth/login, GET /auth/me
            └── task.routes.js     # CRUD + bulk + dashboard stats
```

---

## API Routes

### Auth (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Get JWT token |
| GET | `/auth/me` | Yes | Get current user |

### Tasks (`/api/tasks`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tasks` | Yes | List tasks — supports `status`, `priority`, `category`, `search`, `sort`, `due_date`, `page`, `limit` |
| POST | `/tasks` | Yes | Create task (also logs "created this task" to activity_log) |
| PATCH | `/tasks/bulk` | Yes | Bulk action: `delete`, `done`, or `priority` |
| GET | `/tasks/dashboard/stats` | Yes | Dashboard aggregates |
| GET | `/tasks/:id` | Yes | Get single task by ID |
| PUT | `/tasks/:id` | Yes | Update task (diffs & logs field changes to activity_log) |
| DELETE | `/tasks/:id` | Yes | Delete task |

### Subtasks (`/api/tasks/:taskId/subtasks`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tasks/:taskId/subtasks` | Yes | List subtasks |
| POST | `/tasks/:taskId/subtasks` | Yes | Create subtask |
| PATCH | `/tasks/:taskId/subtasks/:subtaskId/toggle` | Yes | Toggle is_completed |
| DELETE | `/tasks/:taskId/subtasks/:subtaskId` | Yes | Delete subtask |

### Comments (`/api/tasks/:taskId/comments`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tasks/:taskId/comments` | Yes | List comments (JOINs users for author_name/avatar) |
| POST | `/tasks/:taskId/comments` | Yes | Post a comment |

### Activity (`/api/tasks/:taskId/activity`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tasks/:taskId/activity` | Yes | List activity log entries (JOINs users for actor_name/avatar) |

---

## State Management Patterns

- **authStore** — holds `user`, `token`, `isAuthenticated`. Token is persisted to `localStorage` on login and cleared on logout. App restores session on mount by calling `GET /auth/me`.
- **taskStore** — holds:
  - `dashboardStats` — cached; cleared (`clearDashboardStats`) after any task mutation so Dashboard re-fetches on next visit.
  - `taskVersion` — integer counter; `MyTasks` watches it and re-fetches when incremented. Call `incrementTaskVersion()` after any task mutation.
  - `isNewTaskModalOpen` / `selectedTaskId` — modal visibility state.

---

## Feature Progress

Built feature by feature. Update this list whenever a feature ships.

- [x] User Authentication (register, login, JWT session restore)
- [x] Protected Routes
- [x] Sidebar + Navbar layout
- [x] Dashboard (stats cards, weekly activity chart, category donut chart)
- [x] My Tasks — table view with filters, search, sorting, pagination
- [x] Bulk Actions (mark done, change priority, delete)
- [x] New Task Modal
- [x] Kanban Board (drag-and-drop across Todo / In Progress / Done columns)
- [x] Task Detail Modal (inline-editable title/description, status dropdown, progress bar, subtasks, comments, **Details sidebar with single Edit → Apply/Cancel flow**, activity log — opens from Kanban cards and MyTasks rows)
- [ ] Calendar View
- [ ] Analytics page (completion rate, priority/category charts, trends)
- [ ] Notifications system
- [ ] User Profile & Settings (avatar, theme, notification preferences)
- [ ] Team page (invite members, assign tasks, manage roles)

---

## Session Log

### 2026-05-16 — Task Detail Modal fixes + Details Edit/Apply

**Done:**
- Diagnosed why comments/subtasks "did nothing": silent failures. Backend `catch`
  blocks didn't log; frontend `catch {}` blocks were empty. Root cause was
  DB column-name mismatches (see the Database Schema table above):
  `comments.body` vs code's `content`, `subtasks.is_done` vs `is_completed`,
  and `tasks.is_repeated` (user renamed from `repeat`).
- Fixed by aligning controllers to the real columns + SQL aliases so the
  API/frontend contract (`content`, `is_completed`, `repeat`) is unchanged.
  Files: `comment.controller.js`, `subtask.controller.js`, `task.controller.js`.
- Added `console.error('[handler]', error)` to every catch in the
  comment/subtask/activity controllers.
- Wired `react-hot-toast`: `<Toaster/>` in `main.jsx`; replaced all silent
  `catch {}` in `TaskDetailModal.jsx` with error toasts (`errMsg` helper).
- Converted the Details sidebar from per-field click-to-edit to a single
  **Edit** button → all fields editable → **Apply** (one batched `updateTask`)
  / **Cancel**. Removed the old `EditHint`/`EditActions`/`editingField` machinery.

**Verify next session (needs backend restart + manual test):**
- Add/toggle/delete a subtask, post a comment, and run Details Edit → Apply.
  Confirm no toast errors and the server terminal is clean.

**Next task:** Calendar View (next unchecked item in Feature Progress).

---

## Key Conventions

- All task queries are scoped to `req.user.userId` — no task is accessible across users.
- `PATCH /tasks/bulk` must be registered before `PUT /tasks/:id` in the router to avoid Express matching `bulk` as an `:id` parameter.
- The Axios base URL is configured in `client/src/api/axios.js` — update it there if the backend port changes.
- Tailwind CSS v4 is used (configured via `@tailwindcss/vite` plugin — there is no `tailwind.config.js`).
- The server uses CommonJS (`require`/`module.exports`); the client uses ESM (`import`/`export`).
