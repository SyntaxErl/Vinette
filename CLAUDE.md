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

# Team feature — email invites + Socket.IO CORS origin
CLIENT_URL=http://localhost:5173      # invite accept links + Socket.IO CORS origin
RESEND_API_KEY=                        # if unset, invites fall back to a nodemailer Ethereal preview (logged URL)
EMAIL_FROM=TaskFlow <onboarding@resend.dev>
# VITE_SOCKET_URL on the client defaults to the API origin minus /api
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
| `team_members` | `owner_id`, `member_id` (nullable), `role` enum, `status` enum(`pending`/`active`), `invite_email`, `invite_token`, `token_expires`, `joined_at` | — | One row per (owner→invitee). `member_id` is NULL until the invite is accepted. The owner is **not** a row — the API synthesizes the owner as the top admin. Schema lives in `server/sql/team_members.sql`. |
| `users` | `last_active` (DATETIME), `team_invite_token` (VARCHAR 64) | — | `last_active` = "last seen" label (stamped on socket disconnect). `team_invite_token` = the owner's reusable invite link token. |
| `notifications` | `user_id` (recipient), `actor_id`, `type` (`task`/`comment`/`mention`), `title`, `message`, `related_task_id`, `is_read`, `created_at` | — | Created by `server/src/utils/notify.js` (insert + Socket.IO push to `user:<id>` room). Schema in `server/sql/notifications.sql`. Cascade-deletes with the recipient or the related task. |

All `comments`/`subtasks`/`activity_log` rows cascade-delete with their parent task (FKs).
`team_members` cascade-deletes with either the `owner` or `member` user (FKs).

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
│   │   │   ├── CalendarSkeleton.jsx # Loading placeholder for Calendar (toolbar + month grid)
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
| GET | `/tasks/analytics/stats` | Yes | Analytics aggregates (summary, completion trend, priority/category, weekly performance, best day) — `?days=N` scopes the window to the selected date range |
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

### Team (`/api/team`)
All scoped to `req.user.userId` as the team **owner**. Specific routes registered before `:id` routes.
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/team/members` | Yes | `{ members, pending, stats, viewerIsOwner }` — owner synthesized as top admin; shows the team you own, else the team you joined (read-only). Status seeded from the live presence registry |
| GET | `/team/assignable` | Yes | `{ users }` = owner + active members of your team — powers the New Task / Task Detail assignee pickers |
| GET | `/team/invite-link` | Yes | Get (or lazily create) the owner's reusable invite link (`users.team_invite_token`) |
| POST | `/team/invite-link/regenerate` | Yes | New token → invalidates the previous link |
| POST | `/team/join` | Yes | Join a team via `{ token }` (the shareable link) — adds the current user as an active `member` |
| POST | `/team/invite` | Yes | **Legacy** email invite (`email`, `role`) + send email — kept for compatibility, not used by the UI |
| POST | `/team/accept` | Yes | **Legacy** per-email accept via `{ token }` |
| POST | `/team/resend/:id` | Yes | **Legacy** regenerate token + re-send (`:id` = membership row id) |
| GET | `/team/members/:userId/tasks` | Yes | Tasks assigned to that member (`assigned_to = :userId AND user_id = me` — only ever returns your own tasks) |
| GET | `/team/members/:userId/activity` | Yes | That member's `activity_log` entries on your tasks |
| PUT | `/team/members/:id/role` | Yes | Change role (`:id` = membership row id) |
| DELETE | `/team/members/:id` | Yes | Remove member / cancel invite (`:id` = membership row id) |

> ⚠️ Param convention: `:userId` = a **user id** (tasks/activity, safe because scoped to your tasks);
> `:id` = a **membership row id** (mutations).

### Notifications (`/api/notifications`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | List own notifications (`?unread=true` to filter); returns `{ notifications, count }` (count = unread) |
| PATCH | `/notifications/read-all` | Yes | Mark all read |
| PATCH | `/notifications/:id/read` | Yes | Mark one read |
| DELETE | `/notifications` | Yes | Clear all |

Created via `createNotification()` on: task **assign**/​**reassign** (→ assignee), task **completion** (→ owner), and **new comment** (→ owner + assignee, minus the actor). Pushed live over Socket.IO (`notification:new`) to the recipient's `user:<id>` room; the client increments the navbar bell + toasts. Assignee pickers (New Task / Task Detail) use `GET /team/assignable` (owner + active members of your team).

### WebSocket — presence (`Socket.IO`, same origin as the API)
Handshake auth uses the JWT (`socket.handshake.auth.token`). Server keeps an in-memory, ref-counted
registry (`server/src/realtime/presence.js`). Events: `presence:snapshot` (full map on connect),
`presence:update` (`{ userId, status }`). Client emits `presence:away` / `presence:active` from idle +
tab-visibility detection. `online` = ≥1 live socket, `away` = client-emitted idle/hidden, `offline` = none.

---

## State Management Patterns

- **authStore** — holds `user`, `token`, `isAuthenticated`. Token is persisted to `localStorage` on login and cleared on logout. App restores session on mount by calling `GET /auth/me`.
- **taskStore** — holds:
  - `dashboardStats` — cached; cleared (`clearDashboardStats`) after any task mutation so Dashboard re-fetches on next visit.
  - `taskVersion` — integer counter; `MyTasks` **and** `BoardView` watch it and re-fetch when incremented. Call `incrementTaskVersion()` after **any** task mutation (create, edit, delete, bulk, **and Kanban drag**) — it is the single cross-view invalidation signal.
  - `boardCache` / `tasksCache` / `calendarCache` — last fetched result for `BoardView` / `MyTasks` / `Calendar`, tagged `{ key, version }` (`key` = JSON of filter/sort/page params, `version` = `taskVersion` at fetch time). The page seeds its state from the cache on mount and **skips the network call** when both still match (same filters AND no mutation since) — same idea as `dashboardStats`. Any `incrementTaskVersion()` implicitly invalidates them (version mismatch); no explicit clear needed. Read imperatively via `useTaskStore.getState()` so the cache never becomes a hook dep / refetch trigger. `calendarCache` fetches every task once (`limit: 200`, RBC slices by month client-side), so its `key` is the constant `"calendar"` — only a task mutation invalidates it.
  - `isNewTaskModalOpen` / `selectedTaskId` — modal visibility state. `newTaskDefaults` — optional field prefills passed to `openNewTaskModal(defaults)` (Calendar passes the clicked day's `due_date`); guarded to a plain object so callers wiring the action straight to `onClick` don't leak a click event in.
- **teamStore** — `isInviteModalOpen` + `open/closeInviteModal` (the global `InviteMemberModal` in `MainLayout`, opened by the navbar button or the Team page button), `canManage` (gates invite/manage UI; set by `fetchTeam` from `viewerIsOwner`), and `teamVersion` + `incrementTeamVersion()` — the Team page watches it and refetches after any mutation (invite/remove/role), mirroring `taskVersion`. **Directory cache:** `fetchTeam(force?)` caches the `{ members, pending, stats, viewerIsOwner }` response tagged with `teamCacheVersion` (= `teamVersion` at fetch time). A revisit with no mutation since is a cache hit (no network call, but `canManage` is still synced); any `incrementTeamVersion()` invalidates it. Cleared on logout via `reset()`. Live presence still overlays on top, so dots stay fresh; only roster membership is cached (a newly-joined member appears after a mutation or full reload).
- **presenceStore** — `statuses` map keyed by `userId` (`online`/`away`/`offline`). Fed by `usePresenceSocket` from Socket.IO events (`presence:snapshot`, `presence:update`). The Team page overlays it onto the server-seeded status so dots update live. Reset is handled by re-snapshot on reconnect.
- **notificationStore** — owns both the `unreadCount` (single source of truth for the navbar bell **and** sidebar badge) **and** a cached `notifications` list (shared by `NotificationModal` and the Notifications page). `fetchNotifications(force?)` fetches once and caches (`null` = never loaded); reopening the modal or revisiting the page is a cache hit (no network call). `useNotificationSocket` seeds the count on auth and, on `notification:new`, calls `addNotification(notif)` which prepends to the cached list (if loaded) and bumps the count — so the cache stays fresh with no invalidation counter. `markRead` / `markAllRead` / `clearAll` update the cache optimistically then persist, and recompute `unreadCount` from the list. On a `type:'task'` notification the hook also bumps `taskVersion` + clears dashboard stats so the recipient's Board/MyTasks/Calendar/Dashboard refetch live (no reload). Cleared on logout via `reset()`.

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
- [x] Calendar View (monthly grid + agenda via react-big-calendar; tasks placed by `due_date`, colored by category. The day cell is the only click target: an **empty** day → New Task Modal pre-filled with that date; a day that **has** tasks — clicked anywhere, including a task chip, or via its "+N more" → a popover **at the click point** listing that day's tasks — click a task to open its Task Detail modal, or use the "Add task" button)
- [x] Analytics page (completion rate, priority/category charts, completion-rate-over-time, productivity score, avg completion time, weekly performance, insights & trends)
- [x] Notifications system (real-time bell via Socket.IO; triggered on task assign/reassign, completion, and new comments)
- [ ] User Profile & Settings (avatar, theme, notification preferences)
- [x] Team page (member directory + stat cards, **real-time presence via Socket.IO**, **real email invites (Resend) + token accept flow**, role management, per-member assigned-tasks/activity sidebar, Send Message via `mailto:`)

---

## Session Log

### 2026-05-31 — Notification + Team directory caching

**Done:**
- **notificationStore is now the cache.** Moved the notification list off per-component
  `useState` into the store: `notifications` (cached, `null` = unloaded) + `notificationsLoading` +
  `fetchNotifications(force?)` (skips the call on cache hit). `addNotification` (socket),
  `markRead` / `markAllRead` / `clearAll` mutate the cache optimistically then persist, and recompute
  `unreadCount` from the list. `NotificationModal` **and** the Notifications page now both read the same
  cache — reopening the bell / revisiting the page is a cache hit (no refetch). The socket prepends new
  items so the cache stays fresh without an invalidation counter.
  - `useNotificationSocket` switched from `incrementUnread` to `addNotification(notif)` (count + list).
  - Kept `NotificationModal`'s original markup + `onClose` prop contract (Navbar mounts it conditionally);
    only the data layer changed. Dropped the now-unused `onCountChange` wiring (store is the source of truth).
- **teamStore caches the directory.** Added `fetchTeam(force?)` caching the
  `{ members, pending, stats, viewerIsOwner }` response, tagged with `teamCacheVersion` (= `teamVersion`
  at fetch time). The Team page now reads `teamData` / `teamLoading` from the store; revisiting with no
  mutation is a cache hit (still syncs `canManage`). Any `incrementTeamVersion()` (invite/remove/role)
  invalidates it. `canManage` moved into the store (set by `fetchTeam`); the page no longer manages it.
  Live presence still overlays on top, so only roster membership is cached.
- Both stores added to the logout `reset()` chain (`authStore.clearUserState` now also resets `teamStore`).

**Verify next session (needs MySQL + both servers):** open the bell → list loads; reopen → no refetch;
new socket notification prepends + badge bumps; mark-read/clear reflect in both the modal and the page.
Team: visit → loads; revisit → cache hit (no network); invite/remove/role → refetches; logout/login →
fresh (no previous user's roster).

**Lint/build:** ESLint clean on the changed files; client production build passes.

### 2026-05-29 — Analytics date range + Export Report (made functional)

**Done:**
- **Date-range picker works.** `AnalyticsDateRange` (navbar) is now a dropdown (Last 7 / 30 / 90 days)
  bound to `taskStore.analyticsRange` (+ `setAnalyticsRange`). `getAnalytics(days)` passes `?days=N`;
  `fetchAnalytics` keys its cache on `{ version, range }` so changing the range (or any task mutation)
  refetches, and the Analytics page effect now also depends on `analyticsRange`. The picker shows the
  live date span for the selection.
- **Backend is range-aware.** `getAnalytics` reads `?days` (sanitised int, clamped ≤366) and scopes
  everything to that window: totals + distributions = tasks **created** in the window; completed / avg
  time / best day = done-events in the window; the period-vs-previous deltas compare equal back-to-back
  windows. Completion-trend granularity is **adaptive** — daily buckets for ranges ≤10 days, weekly
  otherwise. `weeklyPerformance` stays fixed 7-day windows (independent of range). Completion rate is
  capped at 100%. Response now includes `range: { days, label }`; summary fields renamed
  `completedThis30/Prev30` → `completedThisPeriod/PrevPeriod`.
- **Export Report works.** `ExportReportButton` builds a CSV from the cached analytics payload
  (`components/analytics/exportReport.js`) and downloads `taskflow-analytics-<date>.csv` (summary,
  completion trend, priority/category, weekly performance). Toasts on success / if data isn't loaded yet.
- Summary card labels + insight text now reflect the selected range (e.g. "vs last 7 days").

**Verify next session (needs MySQL + both servers):** switch the range → numbers + trend update
(daily points for 7d, weekly for 30/90d); cache hit on revisit with same range; Export downloads a CSV
that matches the on-screen numbers.

**Next task:** User Profile & Settings — next unchecked item in Feature Progress
(`client/src/pages/Profile.jsx`: avatar, theme, notification preferences).

### 2026-05-29 — Analytics page

**Done:**
- Built `client/src/pages/Analytics.jsx` (was a stub mis-named `TaskCard`) — kept the page thin and
  split everything into `client/src/components/analytics/`:
  - `analyticsUtils.js` — color/label maps (mirror the Dashboard hexes), formatters (`formatDuration`,
    `pct`, `capitalize`), and `deriveInsights()` (builds the bottom cards from the payload). **No JSX**
    so it doesn't trip `react-refresh/only-export-components`.
  - `tooltips.jsx` — the three shared recharts tooltips (kept separate from the constants for the same
    fast-refresh reason).
  - `ChartCard.jsx` — shared white-card wrapper (title/subtitle/right slot + empty state) so each chart
    only owns its chart.
  - `StatCard.jsx` / `SummaryCards.jsx` — the 4 top cards (Completion Rate w/ inline SVG sparkline,
    Tasks Completed, Productivity Score w/ `ScoreRing`, Avg. Completion Time).
  - `ScoreRing.jsx` — reusable SVG gauge.
  - `CompletionTrendChart.jsx` (area), `PriorityChart.jsx` (bar + legend), `CategoryDonut.jsx` (donut +
    legend), `WeeklyPerformance.jsx`, `InsightsTrends.jsx`.
  - `components/AnalyticsSkeleton.jsx` (matches the layout, styled like `DashboardSkeleton`).
- **Backend:** new `getAnalytics` controller + `GET /tasks/analytics/stats` route. Scoped owner-OR-assignee
  like the dashboard. Returns `summary` (total/completed/overdue, completionRate, completedThis30/Prev30,
  avgCompletionDays/Prev, productivityScore), `completionTrend` (5 rolling weeks), `byPriority`,
  `byCategory`, `weeklyPerformance` (this vs last week completed), and `bestDay`.
  - **Completion timing** has no `completed_at`/`updated_at` column to read, so it's derived from the
    `activity_log` row written on completion — `action = 'changed status to "Done"'` (the exact string
    `updateTask` writes; keep them in sync). First done-event per task = its "completed at".
  - Productivity score is a transparent blend: `0.6·completionRate + 0.25·onTimeRate + 0.15·recentActivityRate`.
- **Store:** `analyticsStats` (tagged `{ version, data }`) + `analyticsLoading` + `fetchAnalytics` in
  `taskStore`. Uses the **taskVersion-tag** pattern (like `boardCache`/`tasksCache`) so any task mutation
  implicitly invalidates it — no manual clear needed across all the mutation sites. Added to `reset()`.
  Service: `getAnalytics()` in `taskService.js`. Page watches `taskVersion` to refetch.
- Navbar already wired `AnalyticsDateRange` + `ExportReportButton` for `/analytics` — decorative when
  first built; **made functional in the follow-up entry above.**

**Verify next session (needs MySQL + both servers + manual test — NOT runnable in the sandbox):**
- Page loads with summary cards, charts, weekly performance, insights. Numbers sane vs the DB.
- Completion-rate-over-time line populates only if tasks were marked Done (relies on the activity_log
  done events — tasks created directly as `done` won't have one, so avg-time/trend ignore them).
- Edit a task / mark done → revisit Analytics → numbers refresh (taskVersion invalidation); revisit with
  no changes → cache hit, no refetch.

**Lint/build:** `client` production build passes; ESLint clean on the new files; server controller/routes
parse (`node -c`). DB connection still can't be exercised in the sandbox (expected).

**Next task:** User Profile & Settings — next unchecked item in Feature Progress
(`client/src/pages/Profile.jsx`: avatar, theme, notification preferences).

### 2026-05-23 — Team collaboration + Notifications (deployed to prod)

Built on top of the Team page across several PRs (all merged into the **`Erl`** branch, which is
what Railway/Vercel deploy — **not `main`**). Production: backend on Railway
(`taskflow-production-4c8b.up.railway.app`), frontend on Vercel (`vinette.vercel.app`).

**Shipped:**
- **Invite flow restructured** to a **reusable shareable link** (replaces email-typed invite + resend).
  `users.team_invite_token`; `GET /team/invite-link`, `POST /team/invite-link/regenerate`, `POST /team/join`.
  Invite modal shows a copyable link; opening it → Create Account (or login) → `joinTeam` on auth
  (`App.jsx` consumes the stashed `pendingInviteToken`). Legacy email endpoints kept but unused.
- **Members see the team read-only.** `getTeam` resolves *whose* team to show: your own if you own one,
  else the team you joined; returns `viewerIsOwner`. Non-owners: invite/resend/remove/role/Settings hidden
  (gated on `canManage`, mirrored into `teamStore` so the navbar button hides too). `isYou` flags the viewer's row.
- **Assignees see & work their tasks.** Task **read** queries + `updateTask` broadened to
  `(user_id = ? OR assigned_to = ?)`; the subtask/comment/activity parent-task guards too. `deleteTask`/`bulkAction`
  stay owner-only. (Without the nested-guard fix, opening an assigned task "failed to load details".)
- **Notifications system** (real-time): `notifications` table + controller/routes; `utils/notify.js` inserts
  and pushes `notification:new` to the recipient's `user:<id>` Socket.IO room (`emitToUser` in `realtime/socket.js`).
  Triggers: assign/reassign (→ assignee), completion (→ owner), new comment (→ owner+assignee−actor).
  Client: `notificationStore` + `useNotificationSocket` (bell badge + toast); navbar **and** sidebar badges read
  the shared count; clicking a notification opens the task detail. Notifications page built out (was a stub).
- **Live task refresh:** a `type:'task'` notification bumps `taskVersion` so the recipient's board/list/etc.
  refetch without a manual reload.
- **Assignee picker scoped to team** via `GET /team/assignable`.

**Migrations run on the prod DB this session (already applied):**
`team_members` table; `users.last_active`; `users.team_invite_token`; `notifications` table
(note: the table must include **`actor_id`** — a hand-created version missing it caused silent insert failures).

**Deploy gotchas hit (for reference):** PRs merge into **`Erl`**; Railway lost its GitHub link once
("repo not found" → reconnect); `VITE_API_URL` on Vercel must be the bare value (not `VITE_API_URL=...`)
and needs a redeploy (Vite bakes env at build time); `CLIENT_URL` on Railway = `https://vinette.vercel.app`
(no trailing slash) for Socket.IO CORS. Real-time (presence, notifications, live refresh) only fires while
the user is online; otherwise state catches up on next load.

**Next task (collaboration roadmap, in order):** Team task board (admin sees *all* members' tasks, filter by
member) → In-app messaging (replace `mailto:` over Socket.IO) → smaller polish (comment @mentions,
promoted-admins-can-manage, member "leave team"). Analytics + Profile/Settings explicitly deferred.

### 2026-05-22 — Team / Members page

**Done:**
- Rebuilt `client/src/pages/Team.jsx` (was a stub mis-named `TaskCard`): stat cards
  (Total = Active + Pending), filter bar (search + status + role), member directory
  table (xl+) / card list (below xl), Pending Invites section, client-side pagination,
  and a contextual right-drawer `MemberSidebar`. Components live in `client/src/components/team/`
  (`TeamStats`, `TeamFilters`, `TeamTable`+`TeamMemberRow`, `TeamMemberCard`, `PendingInviteRow`,
  `MemberAvatar`, `RoleBadge`, `StatusDot`, `MemberSidebar`, `InviteMemberModal`, `teamUtils.memberKey`).
- **Backend**: `team.controller.js` + `team.routes.js` mounted at `/api/team` (see API Routes).
  The logged-in user is the team **owner**; rows scoped by `owner_id`. New `server/sql/team_members.sql`
  schema (`member_id` nullable — pending invites to non-registered emails have no user id yet).
- **Real email invites (Resend)**: `server/src/utils/email.js` sends a tokenized accept link
  (`${CLIENT_URL}/invite/accept?token=…`). No `RESEND_API_KEY` → nodemailer **Ethereal** fallback
  logs a preview URL (and returns it as `previewUrl`). Accept flow: `AcceptInvite.jsx` page →
  if unauthenticated, stashes `pendingInviteToken` in localStorage + routes to Register (email prefilled,
  `invited=1` banner); `App.jsx` consumes the stashed token once authenticated (covers register **and** login).
- **Real-time presence (Socket.IO)**: `server/src/realtime/{presence,socket}.js` + `http.createServer`
  wrap in `server.js`. Client: `api/socket.js` singleton, `store/presenceStore.js`, `hooks/usePresenceSocket.jsx`
  (connect on auth, idle/visibility → away/active). `authStore.logout()` calls `disconnectSocket()`.
  Team page overlays `presenceStore` statuses onto the server-seeded ones so dots update live.
- New stores: `store/teamStore.js` (invite-modal visibility + `teamVersion` refetch counter, mirrors
  `taskVersion`) and `store/presenceStore.js`. `InviteMemberModal` rendered globally in `MainLayout`;
  navbar `InviteMemberButton` now opens it. `Send Message` = `mailto:`; `View Profile` is a placeholder toast.

**Verify next session (needs MySQL + both servers + manual test — NOT runnable in the cloud sandbox):**
- Run `server/sql/team_members.sql` against `vinette_db` first.
- Directory loads with you as the top Admin; stats correct. Filters/search/pagination work.
- Invite an email → pending row + stats bump. With `RESEND_API_KEY` the email arrives; without it,
  the **Ethereal preview URL** is logged (server) + in the browser console. Open the accept link →
  logged-in user joins; a fresh email goes through Register then auto-joins → row flips to active.
- Resend / Remove / Cancel invite / Role change behave. Sidebar Tasks lists tasks assigned to the member;
  Activity lists their actions on your tasks; Send Message opens the mail client.
- Presence: open two sessions → each shows the other Online ~instantly; close one → flips Offline live;
  go idle / hide tab → Away; multi-tab keeps you Online until the last tab closes.
- Confirm Socket.IO CORS `origin` (`CLIENT_URL`) matches the frontend.

**Lint note:** new files carry the same accepted `react-hooks/set-state-in-effect` errors as
`NewTaskModal`/`useTasks`/`BoardView` (data-fetch + modal-reset effects) — consistent with house style,
not in scope. `client` production build passes; server boots (Socket.IO wired) — only the DB connection
fails in the sandbox, as expected.

**Caveats / sandbox limits:** live email delivery and two-session WebSocket presence can't be exercised
from the cloud container (no MySQL, no browser, possible outbound-mail blocking) — verify locally.

**Next task:** Analytics page — next unchecked item in Feature Progress.

### 2026-05-22 — Calendar View

**Done:**
- Built `client/src/pages/Calendar.jsx` (was a stub) — monthly grid + agenda
  views via `react-big-calendar` with `dayjsLocalizer(dayjs)`. The localizer
  self-loads its required dayjs plugins, so no manual plugin setup.
- Tasks → all-day events placed by `due_date` (tasks without one are dropped and
  surfaced as a "N without a due date" count). Events are colored by category
  and dimmed/struck when `done`. `parseLocalDate` parses only the Y-M-D so a
  date-only string never shifts a day across timezones.
- Click an event → `openTaskDetail(id)` (existing global modal). Click an empty
  day → `openNewTaskModal({ due_date })` pre-filled with that date.
- Custom toolbar (Today / prev / next / month label + Month·Agenda toggle)
  replaces RBC's default chrome; RBC base CSS imported in the page, restyled via
  `.tf-calendar` overrides appended to `index.css` to match the design system.
  **Controlled `date`/`view`** (owned in `Calendar.jsx` state, passed as
  `date`/`onNavigate`/`view`/`onView`): RBC's uncontrolled mode keeps that state
  in an `uncontrollable` HOC that doesn't re-render under React 19, so the custom
  toolbar's buttons were no-ops until we took ownership. Keep it controlled.
- New `components/CalendarSkeleton.jsx` (toolbar + 7-col month grid, styled like
  `BoardSkeleton`); shown while loading.
- Caching: added `calendarCache` + `setCalendarCache` to `taskStore`, following
  the `boardCache`/`tasksCache` pattern. Key is the constant `"calendar"` (fetch
  is filterless); a `taskVersion` bump invalidates it. Editing a task via the
  detail modal bumps `taskVersion`, so the mounted calendar refetches.
- Store: `openNewTaskModal(defaults)` now takes optional field prefills (guarded
  to a plain object so the BoardView/Navbar `onClick={openNewTaskModal}` callers
  don't leak a click event); `NewTaskModal` seeds its form from them.
- Added `dayjs` to `client/package.json` deps (it was only a hoisted transitive
  dep before; we now import it directly).

**Verify next session (needs backend + frontend running, manual test):**
- Tasks with due dates appear on the right days; categories color-coded; done
  tasks dimmed/struck. Today's cell tinted, today's number is a brand pill.
- Click an event → Task Detail Modal opens. Edit/move the task there → return to
  the calendar → change reflected (taskVersion refetch). Click an empty day →
  New Task Modal opens with Due Date pre-filled; create it → it lands on that day.
- Navigate prev/next/Today and toggle Month↔Agenda. Revisit Calendar with no
  changes → no skeleton, no network call (cache hit). Full reload → fresh fetch.
- Confirm `CalendarSkeleton` matches the real layout (no jump on data swap).

**Lint note:** `Calendar.jsx` carries the same pre-existing
`react-hooks/set-state-in-effect` error + `unnecessary dependency 'taskVersion'`
warning as `BoardView`/`useTasks` — intentional (the `taskVersion` dep is the
cross-view refetch trigger), not in scope.

**Next task:** Analytics page — next unchecked item in Feature Progress
(`client/src/pages/Analytics.jsx`: completion rate, priority/category charts,
trends). Reuse the `taskVersion` + cache-tag pattern when wiring its data.

### 2026-05-16 — Board/MyTasks revisit caching + Kanban skeleton

**Done:**
- Added `boardCache` / `tasksCache` to `taskStore` (tagged `{ key, version }`).
  `BoardView` and `useTasks` now seed state from the cache on mount and skip the
  fetch on revisit when filters + `taskVersion` are unchanged — mirrors the
  existing `dashboardStats` "skip fetch if loaded" pattern. No spinner/skeleton
  flash when navigating back with no changes.
- `BoardView.onDragEnd` now calls `incrementTaskVersion()` (previously only
  `clearDashboardStats()`) and re-writes `boardCache` under the new version, so
  the moved task propagates to MyTasks/Dashboard while the board stays cached.
- `useTasks` mutation handlers (`bulkAction`, status/priority/delete) switched
  from a direct `fetchTasks()` to `incrementTaskVersion()` — required now that
  the cache exists (a direct refetch would hit the still-valid cache and return
  stale rows); the version bump invalidates it and triggers one fresh fetch.
- New `components/BoardSkeleton.jsx` (filter bar + 3 columns of card
  placeholders, `animate-pulse`, styled like `DashboardSkeleton`); `BoardView`
  renders it instead of the spinning `autorenew` icon while loading.

**Note:** pre-existing `react-hooks/set-state-in-effect` lint errors on the
unchanged `useEffect(() => { fetchX() }, [fetchX])` lines remain — not in scope.

**Verify next session (needs backend + frontend running, manual test):**
- Board: load → navigate away → back → **no skeleton, no network call** (check
  Network tab). Change a category/sort filter → it refetches. Drag a card →
  open MyTasks → moved task shows new status. Edit/delete a task in MyTasks →
  revisit Board → change is reflected. Full page reload → fetches fresh (cache
  is in-memory only, by design).
- Confirm `BoardSkeleton` matches the real board layout (no layout jump when
  the real data swaps in).

**Next task:** Calendar View — still the next unchecked item in Feature
Progress. The caching/skeleton work above was an enhancement, not a checklist
feature, so nothing to tick off. Start fresh on `client/src/pages/Calendar.jsx`
(monthly view, tasks placed by `due_date`, `react-big-calendar`). When wiring
its data fetch, reuse the same `taskVersion` + cache-tag pattern (see the
`boardCache`/`tasksCache` notes under State Management Patterns) so Calendar
also skips refetch on revisit.

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

- Task **read** queries (`getTasks`, `getTaskById`, `getDashboard`) and `updateTask` are scoped to **owner OR assignee** (`WHERE (user_id = ? OR assigned_to = ?)`) so a member sees and can update tasks assigned to them. `deleteTask` and `bulkAction` stay **owner-only** (`user_id`). The subtask/comment/activity controllers guard their parent task by **owner OR assignee** before reading/writing, so an assignee can view and add subtasks/comments on a task assigned to them.
- `PATCH /tasks/bulk` must be registered before `PUT /tasks/:id` in the router to avoid Express matching `bulk` as an `:id` parameter.
- The Axios base URL is configured in `client/src/api/axios.js` — update it there if the backend port changes.
- Tailwind CSS v4 is used (configured via `@tailwindcss/vite` plugin — there is no `tailwind.config.js`).
- The server uses CommonJS (`require`/`module.exports`); the client uses ESM (`import`/`export`).
