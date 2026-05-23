import { useState, useEffect } from 'react'
import useTaskStore from '@/store/taskStore'
import useNotificationStore from '@/store/notificationStore'
import { timeAgo } from '@/components/taskDetail/utils'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} from '@/services/notificationService'

const TYPE_ICON = {
  task:    { icon: 'check_box',        color: '#5b4fcf' },
  mention: { icon: 'alternate_email',  color: '#0ea5e9' },
  comment: { icon: 'chat_bubble',      color: '#10b981' },
  default: { icon: 'notifications',    color: '#6b7280' },
}

export default function Notifications() {
  const openTaskDetail = useTaskStore((s) => s.openTaskDetail)
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getNotifications()
      .then((res) => { if (active) setItems(res.data.notifications || []) })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  // Keep the navbar badge in sync with this list.
  useEffect(() => {
    setUnreadCount(items.filter((n) => !n.is_read).length)
  }, [items, setUnreadCount])

  const unread = items.filter((n) => !n.is_read).length

  const onClick = (n) => {
    if (!n.is_read) {
      markNotificationRead(n.id).catch(() => {})
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: 1 } : x)))
    }
    if (n.related_task_id) openTaskDetail(n.related_task_id)
  }

  const markAll = () => {
    markAllNotificationsRead().catch(() => {})
    setItems((prev) => prev.map((x) => ({ ...x, is_read: 1 })))
  }

  const clearAll = () => {
    clearNotifications().catch(() => {})
    setItems([])
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-3xl mx-auto w-full space-y-4 px-1 sm:px-2 py-2 animate-fadeInUp">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'You’re all caught up'}
          </p>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={markAll} className="text-xs font-medium text-purple-600 hover:text-purple-800 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition">
                Mark all read
              </button>
            )}
            {items.length > 0 && (
              <button onClick={clearAll} className="text-xs font-medium text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-icons animate-spin text-purple-400" style={{ fontSize: '32px' }}>autorenew</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-icons text-gray-200 mb-3" style={{ fontSize: '48px' }}>notifications_off</span>
              <p className="text-sm font-medium text-gray-400">No notifications yet</p>
              <p className="text-xs text-gray-300 mt-1">You’ll see task assignments, comments and updates here.</p>
            </div>
          ) : (
            <ul>
              {items.map((n) => {
                const { icon, color } = TYPE_ICON[n.type] ?? TYPE_ICON.default
                const isUnread = !n.is_read
                return (
                  <li
                    key={n.id}
                    onClick={() => onClick(n)}
                    className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition border-b border-gray-50 last:border-0 ${isUnread ? 'bg-purple-50/40 hover:bg-purple-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${color}18` }}>
                      <span className="material-icons" style={{ fontSize: '18px', color }}>{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                      {n.message && <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>}
                      <p className="text-xs text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {isUnread && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ backgroundColor: '#5b4fcf' }} />}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
