import { create } from 'zustand'

// Live presence statuses keyed by userId: { [userId]: 'online' | 'away' | 'offline' }
const usePresenceStore = create((set) => ({
  statuses: {},

  setSnapshot: (map) => set({ statuses: { ...map } }),

  setStatus: (userId, status) =>
    set((state) => ({ statuses: { ...state.statuses, [userId]: status } })),

  reset: () => set({ statuses: {} }),
}))

export default usePresenceStore
