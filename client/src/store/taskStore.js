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

  // ── New Task Modal ─────────────────────────────────────────────────────────
  isNewTaskModalOpen: false,
  openNewTaskModal: () => set({ isNewTaskModalOpen: true }),
  closeNewTaskModal: () => set({ isNewTaskModalOpen: false }),

  // ── Task Detail Modal ──────────────────────────────────────────────────────
  // selectedTaskId — the task whose details are shown
  // When Task Details modal is built, it reads this ID and fetches the task
  selectedTaskId: null,
  openTaskDetail: (id) => set({ selectedTaskId: id }),
  closeTaskDetail: () => set({ selectedTaskId: null }),

}))

export default useTaskStore