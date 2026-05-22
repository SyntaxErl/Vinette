import { create } from 'zustand'
import { getDashboardStats } from '../services/taskService'

const useTaskStore = create((set, get) => ({

  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboardStats: null,
  dashboardLoading: false,

  fetchDashboardStats: async () => {
    if (get().dashboardStats) return // already loaded — skip fetch
    set({ dashboardLoading: true })
    try {
      const res = await getDashboardStats()
      set({ dashboardStats: res.data, dashboardLoading: false })
    } catch {
      set({ dashboardLoading: false })
    }
  },

  // Call this after creating / editing / deleting a task
  // so Dashboard re-fetches fresh stats next time it mounts
  clearDashboardStats: () => set({ dashboardStats: null }),

  // ── Task version counter ───────────────────────────────────────────────────
  // MyTasks watches this — incrementing it triggers a re-fetch
  taskVersion: 0,
  incrementTaskVersion: () =>
    set((state) => ({ taskVersion: state.taskVersion + 1 })),

  // ── View caches ────────────────────────────────────────────────────────────
  // Same idea as dashboardStats: keep the last fetched result in the store so
  // the page can skip the network call when revisited. Each cache is tagged
  // with { key, version }:
  //   key     — JSON of the filter/sort/page params it was fetched with
  //   version — taskVersion at fetch time
  // A revisit reuses the cache only when both still match (same filters AND no
  // task mutation since). Any incrementTaskVersion() invalidates it implicitly.
  boardCache: null, // { key, version, columns }
  setBoardCache: (cache) => set({ boardCache: cache }),

  tasksCache: null, // { key, version, tasks, total }
  setTasksCache: (cache) => set({ tasksCache: cache }),

  calendarCache: null, // { key, version, tasks } — Calendar fetches every task once
  setCalendarCache: (cache) => set({ calendarCache: cache }),

  // ── New Task Modal ─────────────────────────────────────────────────────────
  // newTaskDefaults — optional field prefills (e.g. Calendar passes the date of
  // the clicked day). Guarded to a plain object so callers that wire this action
  // straight to onClick (BoardView, NavbarButtons) never leak a click event in.
  isNewTaskModalOpen: false,
  newTaskDefaults: null,
  openNewTaskModal: (defaults = null) =>
    set({
      isNewTaskModalOpen: true,
      newTaskDefaults:
        defaults && Object.getPrototypeOf(defaults) === Object.prototype ? defaults : null,
    }),
  closeNewTaskModal: () => set({ isNewTaskModalOpen: false, newTaskDefaults: null }),

  // ── Task Detail Modal ──────────────────────────────────────────────────────
  // selectedTaskId — the task whose details are shown
  // When Task Details modal is built, it reads this ID and fetches the task
  selectedTaskId: null,
  openTaskDetail: (id) => set({ selectedTaskId: id }),
  closeTaskDetail: () => set({ selectedTaskId: null }),

}))

export default useTaskStore