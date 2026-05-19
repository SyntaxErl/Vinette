import { useState } from 'react'
import { formatDate } from '@/utils/taskHelpers'

export const PALETTE = ['#5b4fcf', '#3b82f6', '#22c55e', '#f97316', '#db2777', '#0891b2']

export const timeAgo = (dateStr) => {
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

export const errMsg = (e, fallback) =>
  e?.response?.data?.error || e?.response?.data?.message || e?.message || fallback

export function Avatar({ name, size = 28 }) {
  const initials = name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const color    = PALETTE[(name?.charCodeAt(0) || 0) % PALETTE.length]
  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-bold flex-shrink-0 select-none"
      style={{ width: size, height: size, backgroundColor: color, fontSize: Math.round(size * 0.38) }}
    >{initials}</div>
  )
}

export function MetaRow({ icon, label, children }) {
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

export function SubtaskRow({ subtask, onToggle, onDelete }) {
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
