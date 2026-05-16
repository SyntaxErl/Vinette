import { useState, useEffect, useRef } from 'react'
import useTaskStore from '../store/taskStore'
import { createTask, getUsers } from '../services/taskService'

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'high',
  category: '',
  due_date: '',
  due_time: '',
  assigned_to: '',
  tags: [],
  tagInput: '',
  repeat: 'none',
  reminder_date: '',
  reminder_time: '',
  addAnother: false,
}

const priorityOptions = [
  { value: 'high',   label: 'High',   color: '#5b4fcf' },
  { value: 'medium', label: 'Medium', color: '#f97316' },
  { value: 'low',    label: 'Low',    color: '#22c55e' },
  { value: 'none',   label: 'None',   color: '#9ca3af' },
]

const categoryOptions = [
  { value: 'work',     label: '💼 Work' },
  { value: 'personal', label: '🙋 Personal' },
  { value: 'school',   label: '📚 School' },
  { value: 'fitness',  label: '💪 Fitness' },
  { value: 'others',   label: '📌 Others' },
]

const repeatOptions = [
  { value: 'none',    label: 'Does not repeat' },
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function NewTaskModal() {
  const { isNewTaskModalOpen, closeNewTaskModal, incrementTaskVersion, clearDashboardStats } =
    useTaskStore()

  const [form, setForm]     = useState(INITIAL_FORM)
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const titleRef  = useRef(null)
  const tagInputRef = useRef(null)

  useEffect(() => {
    if (isNewTaskModalOpen) {
      setForm(INITIAL_FORM)
      setError('')
      setTimeout(() => titleRef.current?.focus(), 50)
      getUsers().then((res) => setUsers(res.data.users || [])).catch(() => {})
    }
  }, [isNewTaskModalOpen])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeNewTaskModal() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [closeNewTaskModal])

  if (!isNewTaskModalOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  // ── Tags ────────────────────────────────────────────────────────────────────
  const addTag = () => {
    const tag = form.tagInput.trim()
    if (!tag || form.tags.includes(tag)) {
      setForm((prev) => ({ ...prev, tagInput: '' }))
      return
    }
    setForm((prev) => ({ ...prev, tags: [...prev.tags, tag], tagInput: '' }))
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !form.tagInput && form.tags.length > 0) {
      setForm((prev) => ({ ...prev, tags: prev.tags.slice(0, -1) }))
    }
  }

  const removeTag = (tag) =>
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) {
      setError('Task title is required.')
      titleRef.current?.focus()
      return
    }
    setLoading(true)

    // Build reminder_at datetime string if both date and time are set
    let reminder_at = null
    if (form.reminder_date && form.reminder_time) {
      reminder_at = `${form.reminder_date} ${form.reminder_time}:00`
    } else if (form.reminder_date) {
      reminder_at = `${form.reminder_date} 09:00:00`
    }

    try {
      await createTask({
        title:       form.title.trim(),
        description: form.description.trim() || null,
        status:      form.status,
        priority:    form.priority === 'none' ? null : form.priority,
        category:    form.category || 'others',
        due_date:    form.due_date || null,
        due_time:    form.due_time || null,
        assigned_to: form.assigned_to || null,
        tags:        form.tags.length > 0 ? form.tags.join(',') : null,
        repeat:      form.repeat,
        reminder_at,
      })
      incrementTaskVersion()
      clearDashboardStats()
      if (form.addAnother) {
        setForm(INITIAL_FORM)
        setTimeout(() => titleRef.current?.focus(), 50)
      } else {
        closeNewTaskModal()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition bg-white"
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1.5"
  const selectCls = "w-full appearance-none border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition cursor-pointer"

  const selectedUser = users.find((u) => String(u.id) === String(form.assigned_to))

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(15,15,35,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => e.target === e.currentTarget && closeNewTaskModal()}
    >
      <div
        className="w-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif', maxHeight: '92vh', maxWidth: '780px' }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Task</h2>
            <p className="text-sm text-gray-400 mt-0.5">Create a task and stay organized.</p>
          </div>
          <button
            onClick={closeNewTaskModal}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100 mt-0.5"
          >
            <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-gray-100">

              {/* ── Left Column ── */}
              <div className="px-6 py-5 space-y-5">

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                    <span className="material-icons" style={{ fontSize: '16px' }}>error_outline</span>
                    {error}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className={labelCls}>
                    Task Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    ref={titleRef}
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g., Design landing page for marketing site"
                    className={inputCls}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-50 transition">
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Add more details about this task..."
                      rows={4}
                      className="w-full px-3.5 pt-2.5 pb-1 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none bg-white"
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className={labelCls}>Priority</label>
                  <div className="flex items-center gap-5 flex-wrap">
                    {priorityOptions.map((p) => {
                      const isSelected = form.priority === p.value
                      return (
                        <label
                          key={p.value}
                          className="flex items-center gap-2 cursor-pointer select-none"
                          onClick={() => setForm((prev) => ({ ...prev, priority: p.value }))}
                        >
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition"
                            style={{
                              borderColor: isSelected ? p.color : '#d1d5db',
                              backgroundColor: isSelected ? p.color : 'white',
                            }}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span
                            className="text-sm font-medium"
                            style={{ color: isSelected ? p.color : '#6b7280' }}
                          >
                            {p.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className={labelCls}>Category</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>sell</span>
                    <select name="category" value={form.category} onChange={handleChange} className={selectCls}>
                      <option value="">Select a category</option>
                      {categoryOptions.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                  </div>
                </div>

                {/* Due Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Due Date</label>
                    <div className="relative">
                      <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>calendar_today</span>
                      <input
                        type="date" name="due_date" value={form.due_date} onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-2 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Time</label>
                    <div className="relative">
                      <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>schedule</span>
                      <input
                        type="time" name="due_time" value={form.due_time} onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-2 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right Column ── */}
              <div className="px-6 py-5 space-y-5">

                {/* Status */}
                <div>
                  <label className={labelCls}>Status</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>flag</span>
                    <select name="status" value={form.status} onChange={handleChange} className={selectCls}>
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <span className="material-icons absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className={labelCls}>Assignee</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>person_outline</span>
                    <select name="assigned_to" value={form.assigned_to} onChange={handleChange} className={selectCls}>
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                  </div>
                  {selectedUser && (
                    <p className="text-xs text-gray-400 mt-1 ml-1">{selectedUser.email}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className={labelCls}>Tags</label>
                  <div
                    className="flex flex-wrap gap-1.5 border border-gray-200 rounded-xl px-3 py-2 min-h-[42px] focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-50 transition cursor-text bg-white"
                    onClick={() => tagInputRef.current?.focus()}
                  >
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#ede9fe', color: '#5b4fcf' }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
                          className="hover:opacity-70 transition leading-none"
                        >
                          <span className="material-icons" style={{ fontSize: '12px' }}>close</span>
                        </button>
                      </span>
                    ))}
                    <input
                      ref={tagInputRef}
                      type="text"
                      name="tagInput"
                      value={form.tagInput}
                      onChange={handleChange}
                      onKeyDown={handleTagKeyDown}
                      onBlur={addTag}
                      placeholder={form.tags.length === 0 ? 'Add tags — press Enter' : ''}
                      className="flex-1 min-w-[100px] text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent py-0.5"
                    />
                  </div>
                </div>

                {/* Repeat */}
                <div>
                  <label className={labelCls}>Repeat</label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>repeat</span>
                    <select name="repeat" value={form.repeat} onChange={handleChange} className={selectCls}>
                      {repeatOptions.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                  </div>
                </div>

                {/* Reminders */}
                <div>
                  <label className={labelCls}>Reminder</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>notifications_none</span>
                      <input
                        type="date" name="reminder_date" value={form.reminder_date} onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-2 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition"
                      />
                    </div>
                    <div className="relative">
                      <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>schedule</span>
                      <input
                        type="time" name="reminder_time" value={form.reminder_time} onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-2 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition"
                      />
                    </div>
                  </div>
                  {form.reminder_date && (
                    <p className="text-xs text-purple-500 mt-1 ml-1 flex items-center gap-1">
                      <span className="material-icons" style={{ fontSize: '12px' }}>check_circle</span>
                      Reminder set for {form.reminder_date}{form.reminder_time ? ` at ${form.reminder_time}` : ' at 9:00 AM'}
                    </p>
                  )}
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="addAnother"
              checked={form.addAnother}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 accent-purple-600 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Add another task</span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeNewTaskModal}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#5b4fcf' }}
            >
              {loading ? (
                <>
                  <span className="material-icons animate-spin" style={{ fontSize: '16px' }}>refresh</span>
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
