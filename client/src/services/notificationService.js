import api from '../api/axios'

export const getNotifications = (unreadOnly = false) =>
  api.get('/notifications', { params: unreadOnly ? { unread: true } : {} })

export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`)

export const markAllNotificationsRead = () =>
  api.patch('/notifications/read-all')

export const clearNotifications = () =>
  api.delete('/notifications')
