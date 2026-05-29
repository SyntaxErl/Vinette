import { create } from 'zustand'
import { getDashboardStats, getAnalytics } from '../services/taskService'

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

  // ── Analytics ────────────────────────────────────────────────────────────────
  // analyticsRange — date-range window in days, driven by the navbar picker.
  // analyticsStats is tagged with { version, range } so a task mutation OR a
  // range change invalidates it (like boardCache/tasksCache).
  analyticsRange: 30,
  setAnalyticsRange: (days) => set({ analyticsRange: days }),

  analyticsStats: null, // { version, range, data }
  analyticsLoading: false,

  fetchAnalytics: async () => {
    const { analyticsStats, taskVersion, analyticsRange } = get()
    if (
      analyticsStats &&
      analyticsStats.version === taskVersion &&
      analyticsStats.range === analyticsRange
    )
      return // fresh — skip
    set({ analyticsLoading: true })
    try {
      const res = await getAnalytics(analyticsRange)
      set({
        analyticsStats: { version: get().taskVersion, range: get().analyticsRange, data: res.data },
        analyticsLoading: false,
      })
    } catch {
      set({ analyticsLoading: false })
    }
  },

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

  // ── Reset ────────────────────────────────────────────────────────────────
  // Clear all cached/per-user state. Called on logout so the next account
  // never seeds a page from the previous user's cached data.
  reset: () =>
    set({
      dashboardStats: null,
      dashboardLoading: false,
      analyticsStats: null,
      analyticsLoading: false,
      analyticsRange: 30,
      taskVersion: 0,
      boardCache: null,
      tasksCache: null,
      calendarCache: null,
      isNewTaskModalOpen: false,
      newTaskDefaults: null,
      selectedTaskId: null,
    }),

}))

export default useTaskStore