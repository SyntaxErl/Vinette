import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import useTaskStore from '@/store/taskStore'
import useAuthStore from '@/store/authStore'
import {
  getTaskById, updateTask, getUsers,
  getSubtasks, createSubtask as apiCreateSubtask,
  toggleSubtask as apiToggleSubtask, deleteSubtask as apiDeleteSubtask,
  getComments, createComment as apiCreateComment,
  getActivity,
} from '@/services/taskService'
import {
  getCategoryColor, getPriorityColor, getStatusStyle,
  getStatusLabel, formatDate, getDaysLeft,
} from '@/utils/taskHelpers'
import {
  STATUS_CHIPS, PRIORITY_CHIPS, CATEGORY_CHIPS,
} from '@/constants/taskOptions'

// ── Constants ────────────────────────────────────────────────────────────────
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

// ── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7)  return `${days}d ago`
  return formatDate(dateStr)
}

const PALETTE = ['#5b4fcf', '#3b82f6', '#22c55e', '#f97316', '#db2777', '#0891b2']

// Pull the most useful message out of an Axios error
const errMsg = (e, fallback) =>
  e?.response?.data?.error || e?.response?.data?.message || e?.message || fallback

// ── Sub-components (outside main to keep stable references) ──────────────────
function Avatar({ name, size = 28 }) {
  const initials = name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const color    = PALETTE[(name?.charCodeAt(0) || 0) % PALETTE.length]
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0 select-none"
      style={{ width: size, height: size, backgroundColor: color, fontSize: Math.round(size * 0.38) }}
    >{initials}</div>
  )
}

function MetaRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5 px-3 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="material-icons text-gray-400" style={{ fontSize: 14 }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
        {children}
      </div>
    </div>
  )
}

function SubtaskRow({ subtask, onToggle, onDelete }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition group"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <button onClick={onToggle} className="flex-shrink-0 hover:scale-110 active:scale-95 transition-transform">
        <span className="material-icons transition-colors" style={{ fontSize: 20, color: subtask.is_completed ? '#22c55e' : '#d1d5db' }}>
          {subtask.is_completed ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      </button>
      <span className={`flex-1 text-sm leading-snug min-w-0 transition-all ${subtask.is_completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {subtask.title}
      </span>
      <button
        onClick={onDelete}
        className={`flex-shrink-0 transition-all text-gray-300 hover:text-red-400 ${hov ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="material-icons" style={{ fontSize: 16 }}>delete_outline</span>
      </button>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TaskDetailSkeleton({ onClose }) {
  const p = 'bg-gray-200 rounded-lg animate-pulse'
  const metaRow = (
    <div className="flex items-start gap-3 py-2.5 px-3 border-b border-gray-50 last:border-0">
      <div className={`w-7 h-7 rounded-lg flex-shrink-0 ${p}`} />
      <div className="flex-1 space-y-1.5 py-0.5">
        <div className={`h-2.5 w-16 ${p}`} />
        <div className={`h-4 w-28 ${p}`} />
      </div>
    </div>
  )
  const activityRow = (
    <div className="flex gap-3">
      <div className={`w-[26px] h-[26px] rounded-full flex-shrink-0 ${p}`} />
      <div className="flex-1 space-y-1.5 pb-3">
        <div className={`h-3.5 w-4/5 ${p}`} />
        <div className={`h-2.5 w-16 ${p}`} />
      </div>
    </div>
  )

  const leftPane = (
    <div className="space-y-6">
      {/* Description */}
      <section className="space-y-2">
        <div className={`h-2.5 w-24 ${p}`} />
        <div className={`h-20 w-full rounded-xl ${p}`} />
      </section>
      {/* Subtasks */}
      <section className="space-y-3">
        <div className={`h-2.5 w-20 ${p}`} />
        <div className={`h-1.5 w-full rounded-full ${p}`} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 ${p}`} />
            <div className={`h-3.5 rounded ${p}`} style={{ width: `${55 + i * 12}%` }} />
          </div>
        ))}
      </section>
      {/* Comments */}
      <section className="space-y-4">
        <div className={`h-2.5 w-20 ${p}`} />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 ${p}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-28 ${p}`} />
              <div className={`h-12 w-full rounded-2xl ${p}`} />
            </div>
          </div>
        ))}
      </section>
    </div>
  )

  const rightPane = (
    <div className="space-y-6">
      {/* Details */}
      <div>
        <div className={`h-2.5 w-16 mb-3 ${p}`} />
        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
          {[...Array(6)].map((_, i) => <div key={i}>{metaRow}</div>)}
        </div>
      </div>
      <div className="border-t border-gray-200" />
      {/* Activity */}
      <div>
        <div className={`h-2.5 w-16 mb-3 ${p}`} />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i}>{activityRow}</div>)}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Priority accent bar */}
      <div className={`h-1 flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl ${p}`} />

      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-3">
            <div className={`h-6 w-2/3 ${p}`} />
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`h-6 w-20 ${p}`} />
              <div className={`h-6 w-16 ${p}`} />
              <div className={`h-6 w-14 ${p}`} />
              <div className={`h-6 w-24 hidden sm:block ${p}`} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition flex-shrink-0 mt-0.5"
          >
            <span className="material-icons" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        {/* Mobile tab bar placeholder */}
        <div className="flex lg:hidden gap-1 mt-3 bg-gray-50 p-1 rounded-xl">
          {[...Array(3)].map((_, i) => <div key={i} className={`flex-1 h-8 rounded-lg ${p}`} />)}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile: single column */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 lg:hidden">
          {leftPane}
        </div>
        {/* Desktop: two columns */}
        <div className="hidden lg:flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 min-w-0">{leftPane}</div>
          <div
            className="overflow-y-auto px-5 py-5 flex-shrink-0 border-l border-gray-100 bg-gray-50/40"
            style={{ width: 288 }}
          >{rightPane}</div>
        </div>
      </div>
    </>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TaskDetailModal() {
  const { selectedTaskId, closeTaskDetail, incrementTaskVersion, clearDashboardStats } = useTaskStore()
  const user = useAuthStore((s) => s.user)

  // ── Core state ──
  const [task,     setTask]     = useState(null)
  const [subtasks, setSubtasks] = useState([])
  const [comments, setComments] = useState([])
  const [activity, setActivity] = useState([])
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  // ── Title / desc editing ──
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft,   setTitleDraft]   = useState('')
  const [editingDesc,  setEditingDesc]  = useState(false)
  const [descDraft,    setDescDraft]    = useState('')

  // ── Details editing (whole-panel Edit / Apply) ──
  const [editingDetails,  setEditingDetails]  = useState(false)
  const [savingDetails,   setSavingDetails]   = useState(false)
  const [dueDateDraft,    setDueDateDraft]    = useState('')
  const [priorityDraft,   setPriorityDraft]   = useState('none')
  const [categoryDraft,   setCategoryDraft]   = useState('others')
  const [assignedToDraft, setAssignedToDraft] = useState('')
  const [repeatDraft,     setRepeatDraft]     = useState('none')
  const [tagEditArr,      setTagEditArr]      = useState([])
  const [tagEditInput,    setTagEditInput]    = useState('')
  const [reminderDateDraft, setReminderDateDraft] = useState('')
  const [reminderTimeDraft, setReminderTimeDraft] = useState('')

  // ── Subtasks ──
  const [addingSubtask,   setAddingSubtask]   = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [savingSubtask,   setSavingSubtask]   = useState(false)

  // ── Comments ──
  const [commentText,    setCommentText]    = useState('')
  const [postingComment, setPostingComment] = useState(false)

  // ── Status dropdown ──
  const [statusOpen, setStatusOpen] = useState(false)

  // ── Refs ──
  const titleInputRef   = useRef(null)
  const subtaskInputRef = useRef(null)
  const statusDropRef   = useRef(null)
  const tagEditRef      = useRef(null)

  // ── Derived ──────────────────────────────────────────────────────────────────
  const completedCount = subtasks.filter((s) => s.is_completed).length
  const progress       = subtasks.length === 0 ? 0 : Math.round((completedCount / subtasks.length) * 100)
  const daysLeft       = task ? getDaysLeft(task.due_date, task.status) : null
  const isOverdue      = daysLeft?.label === 'Overdue'
  const statusStyle    = task ? getStatusStyle(task.status)    : {}
  const priColor       = task ? getPriorityColor(task.priority) : {}
  const catColor       = task ? getCategoryColor(task.category) : {}
  const tags           = task?.tags ? task.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  // ── Data fetching ─────────────────────────────────────────────────────────────
  const refreshActivity = useCallback(async (id) => {
    const res = await getActivity(id)
    setActivity(res.data.activity || [])
  }, [])

  const fetchAll = useCallback(async (id) => {
    setLoading(true); setError('')
    try {
      const [taskRes, subRes, comRes, actRes] = await Promise.all([
        getTaskById(id), getSubtasks(id), getComments(id), getActivity(id),
      ])
      const t = taskRes.data.task
      setTask(t); setTitleDraft(t.title); setDescDraft(t.description || '')
      setSubtasks(subRes.data.subtasks || [])
      setComments(comRes.data.comments  || [])
      setActivity(actRes.data.activity  || [])
    } catch { setError('Failed to load task details.') }
    finally  { setLoading(false) }
  }, [])

  useEffect(() => {
    if (selectedTaskId) {
      setActiveTab('overview')
      setEditingDetails(false)
      fetchAll(selectedTaskId)
      getUsers().then((r) => setUsers(r.data.users || [])).catch(() => {})
    } else {
      setTask(null); setSubtasks([]); setComments([]); setActivity([])
      setEditingTitle(false); setEditingDesc(false)
      setAddingSubtask(false); setStatusOpen(false); setCommentText('')
    }
  }, [selectedTaskId, fetchAll])

  // Escape key
  useEffect(() => {
    const h = (e) => {
      if (e.key !== 'Escape') return
      if (statusOpen)    { setStatusOpen(false);    return }
      if (editingDetails) { setEditingDetails(false); return }
      if (editingTitle)  { setEditingTitle(false);  setTitleDraft(task?.title || ''); return }
      if (editingDesc)   { setEditingDesc(false);   setDescDraft(task?.description || ''); return }
      if (addingSubtask) { setAddingSubtask(false); setNewSubtaskTitle(''); return }
      closeTaskDetail()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [closeTaskDetail, statusOpen, editingDetails, editingTitle, editingDesc, addingSubtask, task])

  useEffect(() => { if (editingTitle)  titleInputRef.current?.focus()   }, [editingTitle])
  useEffect(() => { if (addingSubtask) subtaskInputRef.current?.focus() }, [addingSubtask])

  // Close status dropdown on outside click
  useEffect(() => {
    if (!statusOpen) return
    const h = (e) => { if (statusDropRef.current && !statusDropRef.current.contains(e.target)) setStatusOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [statusOpen])

  if (!selectedTaskId) return null

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const saveTitle = async () => {
    setEditingTitle(false)
    if (!titleDraft.trim() || titleDraft.trim() === task.title) { setTitleDraft(task.title); return }
    try {
      const res = await updateTask(task.id, { title: titleDraft.trim() })
      setTask(res.data.task); setTitleDraft(res.data.task.title)
      incrementTaskVersion(); clearDashboardStats(); refreshActivity(task.id)
    } catch (e) {
      setTitleDraft(task.title)
      toast.error(errMsg(e, 'Failed to rename task'))
    }
  }

  const saveDesc = async () => {
    setEditingDesc(false)
    if (descDraft.trim() === (task.description || '')) return
    try {
      const res = await updateTask(task.id, { description: descDraft.trim() || null })
      setTask(res.data.task); refreshActivity(task.id)
    } catch (e) { toast.error(errMsg(e, 'Failed to save description')) }
  }

  const changeStatus = async (newStatus) => {
    setStatusOpen(false)
    if (newStatus === task.status) return
    const prev = task.status
    setTask((t) => ({ ...t, status: newStatus }))
    try {
      const res = await updateTask(task.id, { status: newStatus })
      setTask(res.data.task)
      incrementTaskVersion(); clearDashboardStats(); refreshActivity(task.id)
    } catch (e) {
      setTask((t) => ({ ...t, status: prev }))
      toast.error(errMsg(e, 'Failed to change status'))
    }
  }

  const addTagChip = () => {
    const t = tagEditInput.trim()
    if (t && !tagEditArr.includes(t)) setTagEditArr((prev) => [...prev, t])
    setTagEditInput('')
  }

  // ── Details whole-panel edit ──
  const startEditDetails = () => {
    const r = task.reminder_at || ''
    setDueDateDraft(task.due_date ? String(task.due_date).slice(0, 10) : '')
    setPriorityDraft(task.priority || 'none')
    setCategoryDraft(task.category || 'others')
    setAssignedToDraft(task.assigned_to ? String(task.assigned_to) : '')
    setRepeatDraft(task.repeat || 'none')
    setTagEditArr(tags)
    setTagEditInput('')
    setReminderDateDraft(r ? String(r).slice(0, 10) : '')
    setReminderTimeDraft(String(r).length > 10 ? String(r).slice(11, 16) : '')
    setEditingDetails(true)
  }

  const cancelEditDetails = () => {
    setEditingDetails(false)
    setTagEditInput('')
  }

  const applyDetails = async () => {
    const newTags     = tagEditArr.length > 0 ? tagEditArr.join(',') : null
    const curTags     = tags.length > 0 ? tags.join(',') : null
    const newReminder = reminderDateDraft
      ? `${reminderDateDraft} ${reminderTimeDraft || '09:00'}:00`
      : null
    const curReminder = task.reminder_at
      ? `${String(task.reminder_at).slice(0, 10)} ${String(task.reminder_at).length > 10 ? String(task.reminder_at).slice(11, 16) : '09:00'}:00`
      : null

    const payload = {}
    if ((dueDateDraft || null) !== (task.due_date ? String(task.due_date).slice(0, 10) : null))
      payload.due_date = dueDateDraft || null
    if (priorityDraft !== (task.priority || 'none'))   payload.priority = priorityDraft
    if (categoryDraft !== (task.category || 'others')) payload.category = categoryDraft
    if ((assignedToDraft || null) !== (task.assigned_to ? String(task.assigned_to) : null))
      payload.assigned_to = assignedToDraft || null
    if (repeatDraft !== (task.repeat || 'none'))       payload.repeat = repeatDraft
    if (newTags !== curTags)                           payload.tags = newTags
    if (newReminder !== curReminder)                   payload.reminder_at = newReminder

    if (Object.keys(payload).length === 0) { setEditingDetails(false); return }

    setSavingDetails(true)
    try {
      const res = await updateTask(task.id, payload)
      setTask(res.data.task)
      refreshActivity(task.id)
      incrementTaskVersion()
      clearDashboardStats()
      setEditingDetails(false)
      toast.success('Details updated')
    } catch (e) {
      toast.error(errMsg(e, 'Failed to update details'))
    } finally { setSavingDetails(false) }
  }

  const handleToggleSubtask = async (subtask) => {
    setSubtasks((prev) =>
      prev.map((s) => s.id === subtask.id ? { ...s, is_completed: s.is_completed ? 0 : 1 } : s)
    )
    try {
      await apiToggleSubtask(task.id, subtask.id)
      refreshActivity(task.id)
    } catch (e) {
      setSubtasks((prev) =>
        prev.map((s) => s.id === subtask.id ? { ...s, is_completed: subtask.is_completed } : s)
      )
      toast.error(errMsg(e, 'Failed to update subtask'))
    }
  }

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return
    setSavingSubtask(true)
    try {
      const res = await apiCreateSubtask(task.id, newSubtaskTitle.trim())
      setSubtasks((prev) => [...prev, res.data.subtask])
      setNewSubtaskTitle(''); setAddingSubtask(false)
      refreshActivity(task.id)
    } catch (e) {
      toast.error(errMsg(e, 'Failed to add subtask'))
    } finally { setSavingSubtask(false) }
  }

  const handleDeleteSubtask = async (subtask) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subtask.id))
    try {
      await apiDeleteSubtask(task.id, subtask.id); refreshActivity(task.id)
    } catch (e) {
      setSubtasks((prev) => [...prev, subtask].sort((a, b) => a.id - b.id))
      toast.error(errMsg(e, 'Failed to delete subtask'))
    }
  }

  const handlePostComment = async () => {
    if (!commentText.trim() || postingComment) return
    setPostingComment(true)
    try {
      const res = await apiCreateComment(task.id, commentText.trim())
      setComments((prev) => [...prev, res.data.comment])
      setCommentText(''); refreshActivity(task.id)
    } catch (e) {
      toast.error(errMsg(e, 'Failed to post comment'))
    } finally { setPostingComment(false) }
  }

  // ── Inline shared styles ──────────────────────────────────────────────────────
  const inlineInput = 'w-full text-sm border border-purple-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 bg-white transition'
  const inlineSelect = 'w-full text-sm border border-purple-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-purple-400 bg-white appearance-none transition cursor-pointer'

  // ── Details panel content (inlined — NOT a sub-component) ────────────────────
  const detailsContent = task && (
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
            <input
              type="date"
              value={dueDateDraft}
              onChange={(e) => setDueDateDraft(e.target.value)}
              className={inlineInput}
            />
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
                  style={{
                    backgroundColor: p.bg,
                    color: p.text,
                    borderColor: priorityDraft === p.value ? p.text : 'transparent',
                  }}
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
                  style={{
                    backgroundColor: c.bg,
                    color: c.text,
                    borderColor: categoryDraft === c.value ? c.text : 'transparent',
                  }}
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
            <select
              className={inlineSelect}
              value={assignedToDraft}
              onChange={(e) => setAssignedToDraft(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
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
            <select
              className={inlineSelect}
              value={repeatDraft}
              onChange={(e) => setRepeatDraft(e.target.value)}
            >
              {REPEAT_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
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
              <input
                type="date"
                value={reminderDateDraft}
                onChange={(e) => setReminderDateDraft(e.target.value)}
                className={inlineInput}
              />
              <input
                type="time"
                value={reminderTimeDraft}
                onChange={(e) => setReminderTimeDraft(e.target.value)}
                className={inlineInput}
              />
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

  // ── Activity content (inlined) ────────────────────────────────────────────────
  const activityContent = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Activity</p>
      {activity.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2">
          <span className="material-icons text-gray-200" style={{ fontSize: 36 }}>history</span>
          <p className="text-xs text-gray-300 italic">No activity yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...activity].reverse().map((a, i) => (
            <div key={a.id ?? i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <Avatar name={a.actor_name} size={26} />
                {i < activity.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-2" />}
              </div>
              <div className="flex-1 min-w-0 pb-3">
                <p className="text-sm text-gray-600 leading-snug">
                  <span className="font-semibold text-gray-800">{a.actor_name} </span>
                  {a.action}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(a.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // ── Overview content (inlined) ────────────────────────────────────────────────
  const overviewContent = task && (
    <div className="space-y-6">

      {/* Description */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</p>
          {!editingDesc && (
            <button
              onClick={() => { setEditingDesc(true); setDescDraft(task.description || '') }}
              className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium transition"
            >
              <span className="material-icons" style={{ fontSize: 13 }}>edit</span>Edit
            </button>
          )}
        </div>
        {editingDesc ? (
          <div>
            <textarea
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              placeholder="Add a description…"
              rows={4}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 resize-none transition bg-white"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button onClick={saveDesc} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: '#5b4fcf' }}>Save</button>
              <button onClick={() => { setEditingDesc(false); setDescDraft(task.description || '') }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition">Cancel</button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => { setEditingDesc(true); setDescDraft(task.description || '') }}
            className="cursor-text min-h-[44px] rounded-xl px-3.5 py-2.5 hover:bg-gray-50 transition border border-transparent hover:border-gray-200 group"
          >
            {task.description
              ? <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              : <p className="text-sm text-gray-300 italic">Add a description…</p>
            }
          </div>
        )}
      </section>

      {/* Subtasks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Subtasks
            {subtasks.length > 0 && (
              <span className="ml-1.5 normal-case font-normal">({completedCount}/{subtasks.length})</span>
            )}
          </p>
          <button
            onClick={() => setAddingSubtask(true)}
            className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium transition"
          >
            <span className="material-icons" style={{ fontSize: 13 }}>add</span>Add
          </button>
        </div>

        {subtasks.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#22c55e' : '#5b4fcf' }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: progress === 100 ? '#22c55e' : '#5b4fcf' }}>
                {progress}%
              </span>
            </div>
          </div>
        )}

        <div className="space-y-0.5">
          {subtasks.map((subtask) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              onToggle={() => handleToggleSubtask(subtask)}
              onDelete={() => handleDeleteSubtask(subtask)}
            />
          ))}

          {subtasks.length === 0 && !addingSubtask && (
            <p className="text-xs text-gray-300 italic px-3 py-2">No subtasks yet.</p>
          )}

          {addingSubtask && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50/40 mt-1">
              <span className="material-icons text-gray-300 flex-shrink-0" style={{ fontSize: 20 }}>radio_button_unchecked</span>
              <input
                ref={subtaskInputRef}
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Subtask title…"
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-300 min-w-0"
                disabled={savingSubtask}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask()
                  if (e.key === 'Escape') { setAddingSubtask(false); setNewSubtaskTitle('') }
                }}
              />
              <button
                onClick={handleAddSubtask}
                disabled={savingSubtask || !newSubtaskTitle.trim()}
                className="text-xs font-semibold text-white px-2.5 py-1 rounded-lg disabled:opacity-40 transition flex-shrink-0"
                style={{ backgroundColor: '#5b4fcf' }}
              >{savingSubtask ? '…' : 'Add'}</button>
              <button onClick={() => { setAddingSubtask(false); setNewSubtaskTitle('') }} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                <span className="material-icons" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Comments */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Comments {comments.length > 0 && `(${comments.length})`}
        </p>

        <div className="space-y-4 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar name={c.author_name} size={32} />
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{c.author_name}</span>
                    <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="flex flex-col items-center py-6 gap-2">
              <span className="material-icons text-gray-200" style={{ fontSize: 36 }}>chat_bubble_outline</span>
              <p className="text-xs text-gray-300 italic">No comments yet.</p>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Avatar name={user?.name} size={32} />
          <div className="flex-1 border border-gray-200 rounded-2xl overflow-hidden focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-50 transition bg-white">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              className="w-full px-4 pt-3 pb-1 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment() }
              }}
            />
            <div className="flex items-center justify-end px-3 pb-2.5 gap-2">
              <span className="text-xs text-gray-300 mr-auto hidden sm:block">Enter to send · Shift+Enter newline</span>
              <button
                onClick={handlePostComment}
                disabled={!commentText.trim() || postingComment}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: '#5b4fcf' }}
              >
                <span className="material-icons" style={{ fontSize: 14 }}>send</span>
                {postingComment ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  // ── Mobile tabs ───────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'overview', label: 'Overview', icon: 'article'  },
    { id: 'details',  label: 'Details',  icon: 'info'     },
    { id: 'activity', label: 'Activity', icon: 'history'  },
  ]

  // ── Render ────────────────────────────────────────────────────────────────────
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 tdm-backdrop"
      style={{ backgroundColor: 'rgba(15,15,35,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) closeTaskDetail() }}
    >
      <div
        className="tdm-enter w-full bg-white flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl shadow-2xl h-[92vh] sm:h-auto sm:max-h-[90vh]"
        style={{ maxWidth: 960, fontFamily: 'Inter, sans-serif' }}
      >
        {/* Loading */}
        {loading && <TaskDetailSkeleton onClose={closeTaskDetail} />}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 px-6">
            <span className="material-icons text-red-300" style={{ fontSize: 40 }}>error_outline</span>
            <p className="text-sm text-red-500 text-center">{error}</p>
            <button
              onClick={() => fetchAll(selectedTaskId)}
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition"
              style={{ backgroundColor: '#5b4fcf' }}
            >Retry</button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && task && (
          <>
            {/* Priority accent bar */}
            <div
              className="h-1 flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl"
              style={{
                backgroundColor:
                  task.priority === 'high'   ? '#5b4fcf'
                  : task.priority === 'medium' ? '#f97316'
                  : task.priority === 'low'    ? '#22c55e'
                  : '#e5e7eb',
              }}
            />

            {/* ── Header ── */}
            <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {/* Title */}
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

                  {/* Badges */}
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

                {/* Close */}
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

            {/* ── Body ── */}
            <div className="flex flex-1 overflow-hidden">

              {/* Mobile: single tab */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 lg:hidden">
                {activeTab === 'overview' && overviewContent}
                {activeTab === 'details'  && detailsContent}
                {activeTab === 'activity' && activityContent}
              </div>

              {/* Desktop: two columns */}
              <div className="hidden lg:flex flex-1 overflow-hidden">
                {/* Left — overview */}
                <div className="flex-1 overflow-y-auto px-6 py-5 min-w-0">
                  {overviewContent}
                </div>
                {/* Right — details + activity */}
                <div className="overflow-y-auto px-5 py-5 space-y-6 flex-shrink-0 border-l border-gray-100 bg-gray-50/40" style={{ width: 288 }}>
                  {detailsContent}
                  <div className="border-t border-gray-200" />
                  {activityContent}
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
