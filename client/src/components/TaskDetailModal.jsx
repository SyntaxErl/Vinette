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
import { getCategoryColor, getPriorityColor, getStatusStyle, getDaysLeft } from '@/utils/taskHelpers'
import { errMsg } from './taskDetail/utils'
import TaskDetailSkeleton from './taskDetail/Skeleton'
import TaskDetailHeader   from './taskDetail/Header'
import OverviewTab        from './taskDetail/OverviewTab'
import DetailsPanel       from './taskDetail/DetailsPanel'
import ActivityPanel      from './taskDetail/ActivityPanel'

export default function TaskDetailModal() {
  const { selectedTaskId, closeTaskDetail, incrementTaskVersion, clearDashboardStats } = useTaskStore()
  const user = useAuthStore((s) => s.user)

  const [task,     setTask]     = useState(null)
  const [subtasks, setSubtasks] = useState([])
  const [comments, setComments] = useState([])
  const [activity, setActivity] = useState([])
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft,   setTitleDraft]   = useState('')
  const [editingDesc,  setEditingDesc]  = useState(false)
  const [descDraft,    setDescDraft]    = useState('')

  const [editingDetails,    setEditingDetails]    = useState(false)
  const [savingDetails,     setSavingDetails]     = useState(false)
  const [dueDateDraft,      setDueDateDraft]      = useState('')
  const [priorityDraft,     setPriorityDraft]     = useState('none')
  const [categoryDraft,     setCategoryDraft]     = useState('others')
  const [assignedToDraft,   setAssignedToDraft]   = useState('')
  const [repeatDraft,       setRepeatDraft]       = useState('none')
  const [tagEditArr,        setTagEditArr]        = useState([])
  const [tagEditInput,      setTagEditInput]      = useState('')
  const [reminderDateDraft, setReminderDateDraft] = useState('')
  const [reminderTimeDraft, setReminderTimeDraft] = useState('')

  const [addingSubtask,   setAddingSubtask]   = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [savingSubtask,   setSavingSubtask]   = useState(false)

  const [commentText,    setCommentText]    = useState('')
  const [postingComment, setPostingComment] = useState(false)

  const [statusOpen, setStatusOpen] = useState(false)

  const titleInputRef   = useRef(null)
  const subtaskInputRef = useRef(null)
  const statusDropRef   = useRef(null)

  const completedCount = subtasks.filter((s) => s.is_completed).length
  const progress       = subtasks.length === 0 ? 0 : Math.round((completedCount / subtasks.length) * 100)
  const daysLeft       = task ? getDaysLeft(task.due_date, task.status) : null
  const isOverdue      = daysLeft?.label === 'Overdue'
  const statusStyle    = task ? getStatusStyle(task.status)     : {}
  const priColor       = task ? getPriorityColor(task.priority) : {}
  const catColor       = task ? getCategoryColor(task.category) : {}
  const tags           = task?.tags ? task.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

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

  useEffect(() => {
    const h = (e) => {
      if (e.key !== 'Escape') return
      if (statusOpen)     { setStatusOpen(false);    return }
      if (editingDetails) { setEditingDetails(false); return }
      if (editingTitle)   { setEditingTitle(false);  setTitleDraft(task?.title || ''); return }
      if (editingDesc)    { setEditingDesc(false);   setDescDraft(task?.description || ''); return }
      if (addingSubtask)  { setAddingSubtask(false); setNewSubtaskTitle(''); return }
      closeTaskDetail()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [closeTaskDetail, statusOpen, editingDetails, editingTitle, editingDesc, addingSubtask, task])

  useEffect(() => { if (editingTitle)  titleInputRef.current?.focus()   }, [editingTitle])
  useEffect(() => { if (addingSubtask) subtaskInputRef.current?.focus() }, [addingSubtask])

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

  const cancelEditDetails = () => { setEditingDetails(false); setTagEditInput('') }

  const applyDetails = async () => {
    const newTags     = tagEditArr.length > 0 ? tagEditArr.join(',') : null
    const curTags     = tags.length > 0 ? tags.join(',') : null
    const newReminder = reminderDateDraft ? `${reminderDateDraft} ${reminderTimeDraft || '09:00'}:00` : null
    const curReminder = task.reminder_at
      ? `${String(task.reminder_at).slice(0, 10)} ${String(task.reminder_at).length > 10 ? String(task.reminder_at).slice(11, 16) : '09:00'}:00`
      : null

    const payload = {}
    if ((dueDateDraft || null) !== (task.due_date ? String(task.due_date).slice(0, 10) : null)) payload.due_date    = dueDateDraft || null
    if (priorityDraft !== (task.priority || 'none'))                                              payload.priority   = priorityDraft
    if (categoryDraft !== (task.category || 'others'))                                            payload.category   = categoryDraft
    if ((assignedToDraft || null) !== (task.assigned_to ? String(task.assigned_to) : null))      payload.assigned_to = assignedToDraft || null
    if (repeatDraft !== (task.repeat || 'none'))                                                  payload.repeat     = repeatDraft
    if (newTags !== curTags)                                                                      payload.tags       = newTags
    if (newReminder !== curReminder)                                                              payload.reminder_at = newReminder

    if (Object.keys(payload).length === 0) { setEditingDetails(false); return }

    setSavingDetails(true)
    try {
      const res = await updateTask(task.id, payload)
      setTask(res.data.task)
      refreshActivity(task.id)
      incrementTaskVersion(); clearDashboardStats()
      setEditingDetails(false)
      toast.success('Details updated')
    } catch (e) {
      toast.error(errMsg(e, 'Failed to update details'))
    } finally { setSavingDetails(false) }
  }

  const handleToggleSubtask = async (subtask) => {
    setSubtasks((prev) => prev.map((s) => s.id === subtask.id ? { ...s, is_completed: s.is_completed ? 0 : 1 } : s))
    try {
      await apiToggleSubtask(task.id, subtask.id); refreshActivity(task.id)
    } catch (e) {
      setSubtasks((prev) => prev.map((s) => s.id === subtask.id ? { ...s, is_completed: subtask.is_completed } : s))
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
    } catch (e) { toast.error(errMsg(e, 'Failed to add subtask')) }
    finally { setSavingSubtask(false) }
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
    } catch (e) { toast.error(errMsg(e, 'Failed to post comment')) }
    finally { setPostingComment(false) }
  }

  const accentColor = task?.priority === 'high' ? '#5b4fcf' : task?.priority === 'medium' ? '#f97316' : task?.priority === 'low' ? '#22c55e' : '#e5e7eb'

  // ── Shared props for OverviewTab (rendered in both mobile + desktop) ──────────
  const overviewProps = {
    task, user,
    editingDesc, descDraft, setDescDraft, saveDesc, setEditingDesc,
    subtasks, completedCount, progress,
    addingSubtask, setAddingSubtask, newSubtaskTitle, setNewSubtaskTitle,
    savingSubtask, handleAddSubtask, handleToggleSubtask, handleDeleteSubtask, subtaskInputRef,
    comments, commentText, setCommentText, postingComment, handlePostComment,
  }

  const detailsProps = {
    task, tags, daysLeft, isOverdue, priColor, catColor,
    editingDetails, startEditDetails, cancelEditDetails, applyDetails, savingDetails,
    dueDateDraft, setDueDateDraft, priorityDraft, setPriorityDraft,
    categoryDraft, setCategoryDraft, assignedToDraft, setAssignedToDraft,
    repeatDraft, setRepeatDraft, tagEditArr, setTagEditArr,
    tagEditInput, setTagEditInput, addTagChip,
    reminderDateDraft, setReminderDateDraft, reminderTimeDraft, setReminderTimeDraft,
    users,
  }

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
        {loading && <TaskDetailSkeleton onClose={closeTaskDetail} />}

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

        {!loading && !error && task && (
          <>
            <div className="h-1 flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl" style={{ backgroundColor: accentColor }} />

            <TaskDetailHeader
              task={task}
              editingTitle={editingTitle} titleDraft={titleDraft}
              setTitleDraft={setTitleDraft} saveTitle={saveTitle}
              setEditingTitle={setEditingTitle} titleInputRef={titleInputRef}
              statusOpen={statusOpen} setStatusOpen={setStatusOpen}
              statusDropRef={statusDropRef} changeStatus={changeStatus}
              closeTaskDetail={closeTaskDetail}
              statusStyle={statusStyle} priColor={priColor} catColor={catColor}
              daysLeft={daysLeft} isOverdue={isOverdue}
              activeTab={activeTab} setActiveTab={setActiveTab}
            />

            <div className="flex flex-1 overflow-hidden">
              {/* Mobile: single tab */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 lg:hidden">
                {activeTab === 'overview' && <OverviewTab {...overviewProps} />}
                {activeTab === 'details'  && <DetailsPanel {...detailsProps} />}
                {activeTab === 'activity' && <ActivityPanel activity={activity} />}
              </div>

              {/* Desktop: two columns */}
              <div className="hidden lg:flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-5 min-w-0">
                  <OverviewTab {...overviewProps} />
                </div>
                <div
                  className="overflow-y-auto px-5 py-5 space-y-6 flex-shrink-0 border-l border-gray-100 bg-gray-50/40"
                  style={{ width: 288 }}
                >
                  <DetailsPanel {...detailsProps} />
                  <div className="border-t border-gray-200" />
                  <ActivityPanel activity={activity} />
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
