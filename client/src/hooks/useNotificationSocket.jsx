import { useEffect } from 'react'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import useNotificationStore from '@/store/notificationStore'
import useTaskStore from '@/store/taskStore'
import { getNotifications } from '@/services/notificationService'
import { getSocket } from '@/api/socket'

// Seeds the unread count and listens for real-time notifications.
export default function useNotificationSocket() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)
  const addNotification = useNotificationStore((s) => s.addNotification)

  // Seed the badge from the server on auth (count only — the full list is
  // fetched lazily and cached the first time the modal/page opens).
  useEffect(() => {
    if (!isAuthenticated) return
    getNotifications(true)
      .then((res) => setUnreadCount(res.data.count ?? res.data.notifications?.length ?? 0))
      .catch(() => {})
  }, [isAuthenticated, setUnreadCount])

  // Live updates over the shared socket.
  useEffect(() => {
    if (!isAuthenticated) return
    const socket = getSocket()
    if (!socket) return

    const onNew = (notif) => {
      // Prepend to the cached list (if loaded) and bump the unread count.
      addNotification(notif)
      toast(notif?.message || notif?.title || 'New notification', { icon: '🔔' })
      // A task was assigned / reassigned / completed for me by someone else →
      // refresh task views (board, list, calendar, dashboard) without a reload.
      if (notif?.type === 'task') {
        const ts = useTaskStore.getState()
        ts.incrementTaskVersion()
        ts.clearDashboardStats()
      }
    }
    socket.on('notification:new', onNew)
    return () => socket.off('notification:new', onNew)
  }, [isAuthenticated, addNotification])
}
