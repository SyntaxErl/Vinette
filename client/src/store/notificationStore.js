import { create } from 'zustand'

// Unread badge count, shared between the navbar bell, the modal, and the
// real-time socket listener.
const useNotificationStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: Math.max(0, n) }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  reset: () => set({ unreadCount: 0 }),
}))

export default useNotificationStore
