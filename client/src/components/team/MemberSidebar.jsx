import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import useTaskStore from '@/store/taskStore'
import { Avatar, timeAgo } from '@/components/taskDetail/utils'
import RoleBadge from './RoleBadge'
import StatusDot from './StatusDot'
import { getMemberTasks, getMemberActivity } from '@/services/teamService'
import { getCategoryColor, getPriorityColor, formatDate } from '@/utils/taskHelpers'

const TABS = ['Overview', 'Tasks', 'Activity', 'Settings']

export default function MemberSidebar({ member, onClose, onRemove, onRoleChange, onResend, resending }) {
  const openTaskDetail = useTaskStore((s) => s.openTaskDetail)
  const [tab, setTab] = useState('Overview')
  const [tasks, setTasks] = useState([])
  const [tasksLoaded, setTasksLoaded] = useState(false)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(false)

  // Load assigned tasks (also powers the Overview count) for real members.
  useEffect(() => {
    if (member.isPending || !member.userId) return
    let active = true
    getMemberTasks(member.userId)
      .then((res) => { if (active) { setTasks(res.data.tasks || []); setTasksLoaded(true) } })
      .catch(() => { if (active) setTasksLoaded(true) })
    return () => { active = false }
  }, [member.userId, member.isPending])

  // Load activity lazily when the tab is opened.
  useEffect(() => {
    if (tab !== 'Activity' || member.isPending || !member.userId) return
    let active = true
    setLoading(true)
    getMemberActivity(member.userId)
      .then((res) => { if (active) setActivity(res.data.activity || []) })
      .catch(() => { if (active) setActivity([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [tab, member.userId, member.isPending])

  const openTask = (id) => { onClose(); openTaskDetail(id) }

  return (
    <>
      {/* Backdrop (mobile / tablet) */}
      <div className="fixed inset-0 z-[55] bg-black/20 xl:hidden" onClick={onClose} />

      <aside
        className="fixed top-0 right-0 z-[60] h-screen w-full max-w-[380px] bg-white border-l border-gray-100 shadow-2xl flex flex-col"
        style={{ animation: 'fadeIn 0.2s ease' }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={member.name || member.email} size={52} />
              <div className="min-w-0">
                <p className="text-base font-bold text-gray-900 truncate">{member.name || member.email}</p>
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <RoleBadge role={member.role} />
                  <StatusDot status={member.status} />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition flex-shrink-0">
              <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>

          {/* Tabs */}
          {!member.isPending && (
            <div className="flex gap-5 mt-4 -mb-px">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="pb-2 text-sm font-medium border-b-2 transition"
                  style={{
                    color: tab === t ? '#5b4fcf' : '#9ca3af',
                    borderColor: tab === t ? '#5b4fcf' : 'transparent',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {member.isPending ? (
            <PendingBody member={member} onResend={onResend} resending={resending} onRemove={onRemove} />
          ) : tab === 'Overview' ? (
            <OverviewBody member={member} taskCount={tasksLoaded ? tasks.length : null} onOpenTasks={() => setTab('Tasks')} />
          ) : tab === 'Tasks' ? (
            <TasksBody tasks={tasks} loaded={tasksLoaded} onOpenTask={openTask} />
          ) : tab === 'Activity' ? (
            <ActivityBody activity={activity} loading={loading} />
          ) : (
            <SettingsBody member={member} onRoleChange={onRoleChange} onRemove={onRemove} />
          )}
        </div>

        {/* Quick actions (real members only) */}
        {!member.isPending && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Quick Actions</p>
            <a
              href={`mailto:${member.email}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>mail_outline</span>
              Send Message
            </a>
            <button
              onClick={() => toast('Member profiles are coming soon')}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>badge</span>
              View Profile
            </button>
            {!member.isOwner && (
              <button
                onClick={() => onRemove(member)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition"
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>person_remove</span>
                Remove from Team
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  )
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="material-icons text-gray-400" style={{ fontSize: 14 }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
        <div className="text-sm text-gray-700">{children}</div>
      </div>
    </div>
  )
}

function OverviewBody({ member, taskCount, onOpenTasks }) {
  return (
    <div>
      <InfoRow icon="badge" label="Role"><RoleBadge role={member.role} /></InfoRow>
      <InfoRow icon="circle" label="Status"><StatusDot status={member.status} /></InfoRow>
      <InfoRow icon="calendar_today" label="Joined">{formatDate(member.joined_at)}</InfoRow>
      {member.status === 'offline' && member.last_active && (
        <InfoRow icon="schedule" label="Last seen">{timeAgo(member.last_active)}</InfoRow>
      )}
      <button
        onClick={onOpenTasks}
        className="w-full mt-4 flex items-center justify-between px-4 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition"
      >
        <span className="text-sm font-medium text-gray-700">Tasks Assigned</span>
        <span className="text-sm font-bold text-purple-600">{taskCount ?? '—'}</span>
      </button>
    </div>
  )
}

function TasksBody({ tasks, loaded, onOpenTask }) {
  if (!loaded) {
    return <div className="flex items-center justify-center py-12">
      <span className="material-icons animate-spin text-purple-400" style={{ fontSize: '28px' }}>autorenew</span>
    </div>
  }
  if (tasks.length === 0) {
    return <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="material-icons text-gray-200 mb-2" style={{ fontSize: '40px' }}>assignment_ind</span>
      <p className="text-sm text-gray-400">No tasks assigned</p>
    </div>
  }
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Tasks Assigned ({tasks.length})</p>
      <div className="space-y-2">
        {tasks.map((task) => {
          const cat = getCategoryColor(task.category)
          const pri = getPriorityColor(task.priority)
          return (
            <button
              key={task.id}
              onClick={() => onOpenTask(task.id)}
              className="w-full text-left rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-medium leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </p>
                {task.priority && task.priority !== 'none' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ backgroundColor: pri.bg, color: pri.text }}>
                    {task.priority[0].toUpperCase() + task.priority.slice(1)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: cat.bg, color: cat.text }}>
                  {task.category || 'others'}
                </span>
                {task.due_date && <span className="text-xs text-gray-400">{formatDate(task.due_date)}</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ActivityBody({ activity, loading }) {
  if (loading) {
    return <div className="flex items-center justify-center py-12">
      <span className="material-icons animate-spin text-purple-400" style={{ fontSize: '28px' }}>autorenew</span>
    </div>
  }
  if (activity.length === 0) {
    return <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="material-icons text-gray-200 mb-2" style={{ fontSize: '40px' }}>history</span>
      <p className="text-sm text-gray-400">No recent activity</p>
    </div>
  }
  return (
    <div className="space-y-3">
      {activity.map((a) => (
        <div key={a.id} className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="material-icons text-purple-400" style={{ fontSize: 14 }}>bolt</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-700 leading-snug">
              {a.action} {a.task_title && <span className="text-gray-400">on “{a.task_title}”</span>}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{timeAgo(a.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function SettingsBody({ member, onRoleChange, onRemove }) {
  if (member.isOwner) {
    return <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="material-icons text-gray-200 mb-2" style={{ fontSize: '40px' }}>lock_person</span>
      <p className="text-sm text-gray-400">This is your own account.</p>
    </div>
  }
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Role</p>
        <div className="flex gap-2">
          {['admin', 'member'].map((r) => (
            <button
              key={r}
              onClick={() => onRoleChange(member.rowId, r)}
              className="flex-1 py-2 rounded-xl text-sm font-medium border transition capitalize"
              style={{
                backgroundColor: member.role === r ? '#ede9fe' : 'white',
                color: member.role === r ? '#5b4fcf' : '#6b7280',
                borderColor: member.role === r ? '#c4b5fd' : '#e5e7eb',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-2 border-t border-gray-100">
        <p className="text-sm font-semibold text-gray-700 mb-1">Danger zone</p>
        <p className="text-xs text-gray-400 mb-2">Remove this member from your team.</p>
        <button
          onClick={() => onRemove(member)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>person_remove</span>
          Remove from Team
        </button>
      </div>
    </div>
  )
}

function PendingBody({ member, onResend, resending, onRemove }) {
  return (
    <div>
      <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-start gap-2.5">
        <span className="material-icons text-amber-500" style={{ fontSize: '18px' }}>schedule</span>
        <div>
          <p className="text-sm font-medium text-amber-700">Invitation pending</p>
          <p className="text-xs text-amber-600/80 mt-0.5">Waiting for {member.email} to accept.</p>
        </div>
      </div>
      <InfoRow icon="mail_outline" label="Email">{member.email}</InfoRow>
      <InfoRow icon="badge" label="Role"><RoleBadge role={member.role} /></InfoRow>
      <InfoRow icon="calendar_today" label="Invited">{formatDate(member.joined_at)}</InfoRow>

      <div className="mt-4 space-y-2">
        <button
          onClick={() => onResend(member)}
          disabled={resending}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#5b4fcf' }}
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>send</span>
          {resending ? 'Sending...' : 'Resend Invitation'}
        </button>
        <button
          onClick={() => onRemove(member)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>cancel</span>
          Cancel Invite
        </button>
      </div>
    </div>
  )
}
