import { createPortal } from 'react-dom'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/constants/taskOptions'

export default function TaskDropdown({ task, dropdownPos, dropdownRef, onStatusChange, onPriorityChange, onDelete }) {
  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[999] bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
      style={{ top: dropdownPos.top, right: dropdownPos.right, minWidth: '190px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Change Status */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Change Status</p>
        {STATUS_OPTIONS.filter((s) => s.value !== task.status).map((s) => (
          <button key={s.value} onClick={() => onStatusChange(task.id, s.value)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition text-left">
            <span className="material-icons" style={{ fontSize: '15px', color: s.color }}>{s.icon}</span>
            <span className="text-sm text-gray-700">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Change Priority */}
      <div className="border-t border-gray-100 px-3 pt-2 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Change Priority</p>
        {PRIORITY_OPTIONS.map((p) => {
          const isCurrent = (task.priority || 'none') === p.value
          return (
            <button key={p.value} onClick={() => onPriorityChange(task.id, p.value)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-sm flex-1" style={{ color: isCurrent ? p.color : '#374151', fontWeight: isCurrent ? 600 : 400 }}>
                {p.label}
              </span>
              {isCurrent && <span className="material-icons" style={{ fontSize: '14px', color: p.color }}>check</span>}
            </button>
          )
        })}
      </div>

      {/* Delete */}
      <div className="border-t border-gray-100 px-3 py-1.5">
        <button onClick={() => onDelete(task.id)}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-red-50 transition text-left">
          <span className="material-icons" style={{ fontSize: '15px', color: '#ef4444' }}>delete_outline</span>
          <span className="text-sm text-red-500">Delete Task</span>
        </button>
      </div>
    </div>,
    document.body
  )
}