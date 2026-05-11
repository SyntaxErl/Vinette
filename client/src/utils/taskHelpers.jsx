import { CATEGORY_COLORS, PRIORITY_COLORS, STATUS_STYLES } from '@/constants/taskOptions'

export const getCategoryColor = (category) =>
  CATEGORY_COLORS[category] || CATEGORY_COLORS.others

export const getPriorityColor = (priority) =>
  PRIORITY_COLORS[priority] || PRIORITY_COLORS.none

export const getStatusStyle = (status) =>
  STATUS_STYLES[status] || STATUS_STYLES.todo

export const getStatusLabel = (status) =>
  ({ todo: 'Todo', in_progress: 'In Progress', done: 'Done' }[status] || status)

export const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export const getDaysLeft = (dueDate, status) => {
  if (!dueDate) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due   = new Date(dueDate); due.setHours(0, 0, 0, 0)
  const diff  = Math.round((due - today) / (1000 * 60 * 60 * 24))
  if (status === 'done') return null
  if (diff < 0)   return { label: 'Overdue',    color: '#ef4444' }
  if (diff === 0) return { label: 'Due today',  color: '#f97316' }
  if (diff === 1) return { label: '1 day left', color: '#f97316' }
  return { label: `${diff} days left`, color: '#6b7280' }
}