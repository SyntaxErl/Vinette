import { getStatusLabel } from '@/utils/taskHelpers'
import { STATUS_CHIPS } from '@/constants/taskOptions'
import { formatDate } from '@/utils/taskHelpers'

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'article' },
  { id: 'details',  label: 'Details',  icon: 'info'    },
  { id: 'activity', label: 'Activity', icon: 'history' },
]

export default function TaskDetailHeader({
  task,
  editingTitle, titleDraft, setTitleDraft, saveTitle, setEditingTitle, titleInputRef,
  statusOpen, setStatusOpen, statusDropRef, changeStatus, closeTaskDetail,
  statusStyle, priColor, catColor, daysLeft, isOverdue,
  activeTab, setActiveTab,
}) {
  return (
    <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveTitle()
                if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(task.title) }
              }}
              className="w-full text-base sm:text-lg font-bold text-gray-900 border-b-2 border-purple-400 outline-none bg-transparent pb-0.5 pr-2"
            />
          ) : (
            <h2
              onClick={() => setEditingTitle(true)}
              className="text-base sm:text-lg font-bold text-gray-900 cursor-text hover:text-purple-700 transition pr-2 leading-snug"
              title="Click to edit"
            >{task.title}</h2>
          )}

          <div className="flex items-center gap-2 flex-wrap mt-2">
            {/* Status dropdown */}
            <div ref={statusDropRef} className="relative">
              <button
                onClick={() => setStatusOpen((p) => !p)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold border transition hover:opacity-80"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
              >
                <span className="material-icons" style={{ fontSize: 11 }}>
                  {task.status === 'done' ? 'check_circle' : task.status === 'in_progress' ? 'pending' : 'radio_button_unchecked'}
                </span>
                {getStatusLabel(task.status)}
                <span className="material-icons" style={{ fontSize: 11 }}>expand_more</span>
              </button>
              {statusOpen && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden w-44">
                  {STATUS_CHIPS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => changeStatus(s.value)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 text-sm text-left transition"
                    >
                      <span className="material-icons" style={{ fontSize: 15, color: s.color }}>{s.icon}</span>
                      <span style={{ color: task.status === s.value ? s.color : '#374151', fontWeight: task.status === s.value ? 600 : 400 }}>
                        {s.label}
                      </span>
                      {task.status === s.value && (
                        <span className="material-icons ml-auto" style={{ fontSize: 13, color: s.color }}>check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: catColor.bg, color: catColor.text }}>
              {task.category?.charAt(0).toUpperCase() + task.category?.slice(1)}
            </span>

            {task.priority && task.priority !== 'none' && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: priColor.bg, color: priColor.text }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priColor.dot }} />
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            )}

            {task.due_date && (
              <span
                className="hidden sm:flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ backgroundColor: isOverdue ? '#fef2f2' : '#f3f4f6', color: isOverdue ? '#ef4444' : '#6b7280' }}
              >
                <span className="material-icons" style={{ fontSize: 11 }}>calendar_today</span>
                {formatDate(task.due_date)}
                {daysLeft && <span className="font-bold">· {daysLeft.label}</span>}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={closeTaskDetail}
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition flex-shrink-0 mt-0.5"
        >
          <span className="material-icons" style={{ fontSize: 20 }}>close</span>
        </button>
      </div>

      {/* Mobile tab bar */}
      <div className="flex lg:hidden gap-1 mt-3 bg-gray-50 p-1 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="material-icons" style={{ fontSize: 14 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
