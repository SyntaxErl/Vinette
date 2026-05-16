import TaskDropdown from '@/components/tasks/TaskDropdown'
import { getCategoryColor, getPriorityColor, getStatusStyle, getStatusLabel, formatDate, getDaysLeft } from '@/utils/taskHelpers'
import useTaskStore from '@/store/taskStore'

const COL = '40px minmax(200px,1fr) 120px 120px 160px 130px 110px 40px'

export default function TaskTableRow({
  task, isSelected, toggleOne,
  openDropdownId, openDropdown,
  dropdownPos, dropdownRef,
  onStatusChange, onPriorityChange, onDelete,
}) {
  const catColor       = getCategoryColor(task.category)
  const priColor       = getPriorityColor(task.priority)
  const statusStyle    = getStatusStyle(task.status)
  const daysLeft       = getDaysLeft(task.due_date, task.status)
  const openTaskDetail = useTaskStore((s) => s.openTaskDetail)

  return (
    <div
      className={`grid items-center px-5 py-3.5 border-b border-gray-50 transition cursor-pointer gap-3 ${isSelected ? 'bg-purple-50/50' : 'hover:bg-gray-50'}`}
      style={{ gridTemplateColumns: COL }}
      onClick={() => openTaskDetail(task.id)}
    >
      {/* Checkbox */}
      <div>
        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(task.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded accent-purple-600 cursor-pointer" />
      </div>

      {/* Title + description */}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate hover:text-purple-700 transition">{task.title}</p>
        {task.description && <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>}
      </div>

      {/* Category */}
      <div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ backgroundColor: catColor.bg, color: catColor.text }}>
          {task.category?.charAt(0).toUpperCase() + task.category?.slice(1)}
        </span>
      </div>

      {/* Priority */}
      <div>
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit"
          style={{ backgroundColor: priColor.bg, color: priColor.text }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: priColor.dot }} />
          {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
        </span>
      </div>

      {/* Due Date */}
      <div>
        {task.due_date ? (
          <>
            <p className="text-sm text-gray-700">{formatDate(task.due_date)}</p>
            {daysLeft && <p className="text-xs font-medium mt-0.5" style={{ color: daysLeft.color }}>{daysLeft.label}</p>}
          </>
        ) : <p className="text-sm text-gray-300">—</p>}
      </div>

      {/* Status */}
      <div>
        <span className="text-xs px-3 py-1 rounded-lg font-medium border"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
          {getStatusLabel(task.status)}
        </span>
      </div>

      {/* Created On */}
      <div>
        <p className="text-xs text-gray-400">{formatDate(task.created_at)}</p>
      </div>

      {/* Actions */}
      <div className="flex justify-center">
        <button onClick={(e) => { e.stopPropagation(); openDropdown(e, task.id); }}
          className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
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
    </div>
  )
}