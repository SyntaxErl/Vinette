import { create } from 'zustand'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} from '@/services/notificationService'

// Centralized notification state + cache.
//   notifications — cached list (null = never loaded). Shared by the navbar
//     modal and the Notifications page so revisiting either skips the network
//     call. The real-time socket prepends new items, so the cache stays fresh
//     without an invalidation counter.
//   unreadCount   — single source of truth for the navbar bell + sidebar badge,
//     always derived from the cached list once it's loaded.
const countUnread = (list) => list.filter((n) => !n.is_read).length

const useNotificationStore = create((set, get) => ({
  unreadCount: 0,
  notifications: null,
  notificationsLoading: false,

  // Fetch once and cache. Skips the call when the list is already loaded unless
  // `force` is passed (e.g. an explicit refresh).
  fetchNotifications: async (force = false) => {
    if (!force && get().notifications) return // cache hit
    set({ notificationsLoading: true })
    try {
      const res = await getNotifications()
      const list = res.data.notifications || []
      set({ notifications: list, unreadCount: countUnread(list), notificationsLoading: false })
    } catch {
      set({ notificationsLoading: false })
    }
  },

  // Prepend a live notification (from the socket) and bump the count. If the
  // list hasn't been loaded yet we only track the count — the full list will be
  // fetched fresh (including this item) on next open.
  addNotification: (notif) =>
    set((s) => {
      const unreadCount = s.unreadCount + 1
      if (!s.notifications) return { unreadCount }
      if (notif?.id && s.notifications.some((n) => n.id === notif.id)) return s
      return { unreadCount, notifications: [notif, ...s.notifications] }
    }),

  // Mark one read — optimistic cache update, then persist.
  markRead: (id) => {
    set((s) => {
      if (!s.notifications) return s
      const notifications = s.notifications.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
      return { notifications, unreadCount: countUnread(notifications) }
    })
    markNotificationRead(id).catch(() => {})
  },

  markAllRead: () => {
    set((s) => ({
      notifications: s.notifications ? s.notifications.map((n) => ({ ...n, is_read: 1 })) : s.notifications,
      unreadCount: 0,
    }))
    markAllNotificationsRead().catch(() => {})
  },

  clearAll: () => {
    set({ notifications: [], unreadCount: 0 })
    clearNotifications().catch(() => {})
  },

  // Kept for the socket seed and any direct count writes.
  setUnreadCount: (n) => set({ unreadCount: Math.max(0, n) }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),

  reset: () => set({ unreadCount: 0, notifications: null, notificationsLoading: false }),
}))

export default useNotificationStore
