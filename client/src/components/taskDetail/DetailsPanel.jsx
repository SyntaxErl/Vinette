import { useRef } from 'react'
import { MetaRow, Avatar, timeAgo } from './utils'
import { formatDate } from '@/utils/taskHelpers'
import { PRIORITY_CHIPS, CATEGORY_CHIPS } from '@/constants/taskOptions'

const PRIORITY_ALL = [
  ...PRIORITY_CHIPS,
  { value: 'none', label: 'None', dot: '#9ca3af', bg: '#f3f4f6', text: '#9ca3af' },
]
const REPEAT_OPTIONS = [
  { value: 'none',    label: 'Does not repeat' },
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

const inlineInput   = 'w-full text-sm border border-purple-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 bg-white transition'
const inlineSelect  = 'w-full text-sm border border-purple-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-400 bg-white appearance-none transition cursor-pointer'

export default function DetailsPanel({
  task, tags, daysLeft, isOverdue, priColor, catColor,
  editingDetails, startEditDetails, cancelEditDetails, applyDetails, savingDetails,
  dueDateDraft, setDueDateDraft,
  priorityDraft, setPriorityDraft,
  categoryDraft, setCategoryDraft,
  assignedToDraft, setAssignedToDraft,
  repeatDraft, setRepeatDraft,
  tagEditArr, setTagEditArr, tagEditInput, setTagEditInput, addTagChip,
  reminderDateDraft, setReminderDateDraft, reminderTimeDraft, setReminderTimeDraft,
  users,
}) {
  const tagEditRef = useRef(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Details</p>
        {!editingDetails && (
          <button
            onClick={startEditDetails}
            className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium transition"
          >
            <span className="material-icons" style={{ fontSize: 13 }}>edit</span>Edit
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">

        {/* Due Date */}
        <MetaRow icon="calendar_today" label="Due Date">
          {editingDetails ? (
            <input type="date" value={dueDateDraft} onChange={(e) => setDueDateDraft(e.target.value)} className={inlineInput} />
          ) : task.due_date ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium ${isOverdue ? 'text-red-500' : 'text-gray-700'}`}>
                {formatDate(task.due_date)}
              </span>
              {daysLeft && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: isOverdue ? '#fef2f2' : '#f3f4f6', color: daysLeft.color }}
                >{daysLeft.label}</span>
              )}
            </div>
          ) : <span className="text-sm text-gray-400 italic">Not set</span>}
        </MetaRow>

        {/* Priority */}
        <MetaRow icon="flag" label="Priority">
          {editingDetails ? (
            <div className="flex flex-wrap gap-1.5">
              {PRIORITY_ALL.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriorityDraft(p.value)}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border-2 transition"
                  style={{ backgroundColor: p.bg, color: p.text, borderColor: priorityDraft === p.value ? p.text : 'transparent' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.dot }} />
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: priColor.bg, color: priColor.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priColor.dot }} />
              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'None'}
            </span>
          )}
        </MetaRow>

        {/* Category */}
        <MetaRow icon="sell" label="Category">
          {editingDetails ? (
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_CHIPS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategoryDraft(c.value)}
                  className="text-xs px-2.5 py-1 rounded-full font-medium border-2 transition"
                  style={{ backgroundColor: c.bg, color: c.text, borderColor: categoryDraft === c.value ? c.text : 'transparent' }}
                >{c.label}</button>
              ))}
            </div>
          ) : (
            <span
              className="inline-block text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: catColor.bg, color: catColor.text }}
            >
              {task.category?.charAt(0).toUpperCase() + task.category?.slice(1)}
            </span>
          )}
        </MetaRow>

        {/* Assignee */}
        <MetaRow icon="person_outline" label="Assignee">
          {editingDetails ? (
            <select className={inlineSelect} value={assignedToDraft} onChange={(e) => setAssignedToDraft(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          ) : task.assignee_name ? (
            <div className="flex items-center gap-2">
              <Avatar name={task.assignee_name} size={20} />
              <span className="text-sm text-gray-700 font-medium">{task.assignee_name}</span>
            </div>
          ) : <span className="text-sm text-gray-400 italic">Unassigned</span>}
        </MetaRow>

        {/* Tags */}
        <MetaRow icon="label" label="Tags">
          {editingDetails ? (
            <div
              className="flex flex-wrap gap-1 border border-purple-200 rounded-lg px-2.5 py-2 min-h-[36px] bg-white cursor-text focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-50 transition"
              onClick={() => tagEditRef.current?.focus()}
            >
              {tagEditArr.map((t) => (
                <span key={t} className="flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ede9fe', color: '#5b4fcf' }}>
                  {t}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setTagEditArr((prev) => prev.filter((x) => x !== t)) }}
                    className="ml-0.5 hover:opacity-70 transition"
                  >
                    <span className="material-icons" style={{ fontSize: 11 }}>close</span>
                  </button>
                </span>
              ))}
              <input
                ref={tagEditRef}
                value={tagEditInput}
                onChange={(e) => setTagEditInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTagChip() }
                  if (e.key === 'Backspace' && !tagEditInput && tagEditArr.length > 0)
                    setTagEditArr((prev) => prev.slice(0, -1))
                }}
                onBlur={addTagChip}
                placeholder={tagEditArr.length === 0 ? 'Add tags…' : ''}
                className="flex-1 min-w-[80px] text-sm outline-none bg-transparent py-0.5"
              />
            </div>
          ) : tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <span key={t} className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ede9fe', color: '#5b4fcf' }}>{t}</span>
              ))}
            </div>
          ) : <span className="text-sm text-gray-400 italic">None</span>}
        </MetaRow>

        {/* Repeat */}
        <MetaRow icon="repeat" label="Repeat">
          {editingDetails ? (
            <select className={inlineSelect} value={repeatDraft} onChange={(e) => setRepeatDraft(e.target.value)}>
              {REPEAT_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          ) : (
            <span className="text-sm text-gray-700 capitalize">
              {task.repeat && task.repeat !== 'none'
                ? task.repeat
                : <span className="text-gray-400 italic">Does not repeat</span>
              }
            </span>
          )}
        </MetaRow>

        {/* Reminder */}
        <MetaRow icon="notifications_none" label="Reminder">
          {editingDetails ? (
            <div className="space-y-1.5">
              <input type="date" value={reminderDateDraft} onChange={(e) => setReminderDateDraft(e.target.value)} className={inlineInput} />
              <input type="time" value={reminderTimeDraft} onChange={(e) => setReminderTimeDraft(e.target.value)} className={inlineInput} />
            </div>
          ) : task.reminder_at ? (
            <span className="text-sm text-gray-700">
              {formatDate(task.reminder_at)}
              {String(task.reminder_at).length > 10 && (
                <span className="text-gray-400 ml-1.5">at {String(task.reminder_at).slice(11, 16)}</span>
              )}
            </span>
          ) : <span className="text-sm text-gray-400 italic">Not set</span>}
        </MetaRow>

        {/* Created */}
        <MetaRow icon="schedule" label="Created">
          <span className="text-sm text-gray-600">{formatDate(task.created_at)}</span>
        </MetaRow>

        {/* Updated */}
        {task.updated_at && task.updated_at !== task.created_at && (
          <MetaRow icon="update" label="Last updated">
            <span className="text-sm text-gray-600">{timeAgo(task.updated_at)}</span>
          </MetaRow>
        )}
      </div>

      {editingDetails && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={applyDetails}
            disabled={savingDetails}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
            style={{ backgroundColor: '#5b4fcf' }}
          >{savingDetails ? 'Applying…' : 'Apply'}</button>
          <button
            onClick={cancelEditDetails}
            disabled={savingDetails}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition"
          >Cancel</button>
        </div>
      )}
    </div>
  )
}
