import TaskDropdown from '@/components/tasks/TaskDropdown'
import { getCategoryColor, getPriorityColor, getStatusStyle, getStatusLabel, formatDate, getDaysLeft } from '@/utils/taskHelpers'
import useTaskStore from '@/store/taskStore'

export default function TaskCard({
  task, isSelected, toggleOne,
  openDropdownId, openDropdown,
  dropdownPos, dropdownRef,
  onStatusChange, onPriorityChange, onDelete,
}) {
  const catColor      = getCategoryColor(task.category)
  const priColor      = getPriorityColor(task.priority)
  const statusStyle   = getStatusStyle(task.status)
  const daysLeft      = getDaysLeft(task.due_date, task.status)
  const openTaskDetail = useTaskStore((s) => s.openTaskDetail)

  return (
    <div
      className={`bg-white rounded-2xl border p-4 transition cursor-pointer ${isSelected ? 'border-purple-300 bg-purple-50/30' : 'border-gray-100 hover:border-purple-200'}`}
      onClick={() => openTaskDetail(task.id)}
    >

      {/* Top row: checkbox + title + ⋯ */}
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(task.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 mt-0.5 rounded accent-purple-600 cursor-pointer flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate hover:text-purple-700 transition">{task.title}</p>
          {task.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
          )}
        </div>
        <button onClick={(e) => { e.stopPropagation(); openDropdown(e, task.id); }}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
          <span className="material-icons" style={{ fontSize: '18px' }}>more_horiz</span>
        </button>
        {openDropdownId === task.id && (
          <TaskDropdown
            task={task}
            dropdownPos={dropdownPos}
            dropdownRef={dropdownRef}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onDelete={onDelete}
          />
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap mt-3">
        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ backgroundColor: catColor.bg, color: catColor.text }}>
          {task.category?.charAt(0).toUpperCase() + task.category?.slice(1)}
        </span>
        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ backgroundColor: priColor.bg, color: priColor.text }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priColor.dot }} />
          {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-lg font-medium border"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
          {getStatusLabel(task.status)}
        </span>
      </div>

      {/* Bottom row: due date + created on */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        {task.due_date ? (
          <div className="flex items-center gap-1.5">
            <span className="material-icons" style={{ fontSize: '14px', color: daysLeft?.color || '#9ca3af' }}>calendar_today</span>
            <span className="text-xs text-gray-500">{formatDate(task.due_date)}</span>
            {daysLeft && <span className="text-xs font-medium" style={{ color: daysLeft.color }}>· {daysLeft.label}</span>}
          </div>
        ) : (
          <span className="text-xs text-gray-300">No due date</span>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span className="material-icons" style={{ fontSize: '12px' }}>schedule</span>
          {formatDate(task.created_at)}
        </div>
      </div>
    </div>
  )
}