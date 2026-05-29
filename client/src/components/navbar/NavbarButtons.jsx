import useTaskStore from '../../store/taskStore'
import useTeamStore from '../../store/teamStore'
import toast from 'react-hot-toast'
import { exportAnalyticsCsv } from '../analytics/exportReport'

// ─── Navbar Button Sub-components ────────────────────────────────────────────

export const NewTaskButton = ({ mobile = false }) => {
  const openNewTaskModal = useTaskStore((state) => state.openNewTaskModal)

  return (
    <button
      onClick={openNewTaskModal}
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-white text-sm font-medium transition hover:opacity-90"
      style={{ backgroundColor: '#5b4fcf' }}
    >
      <span className="material-icons" style={{ fontSize: '18px' }}>add</span>
      {!mobile && 'New Task'}
    </button>
  )
}

export const InviteMemberButton = ({ mobile = false }) => {
  const openInviteModal = useTeamStore((state) => state.openInviteModal)

  return (
    <button
      onClick={openInviteModal}
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-white text-sm font-medium transition hover:opacity-90"
      style={{ backgroundColor: '#5b4fcf' }}
    >
      <span className="material-icons" style={{ fontSize: '18px' }}>person_add</span>
      {!mobile && 'Invite Member'}
    </button>
  )
}

export const ExportReportButton = ({ mobile = false }) => {
  const handleExport = () => {
    const stats = useTaskStore.getState().analyticsStats
    if (!stats?.data) {
      toast.error('Analytics are still loading — try again in a moment')
      return
    }
    if (exportAnalyticsCsv(stats.data)) toast.success('Report exported')
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white hover:bg-gray-50 transition text-sm font-medium text-gray-700"
    >
      <span className="material-icons text-gray-500" style={{ fontSize: '18px' }}>download</span>
      {!mobile && 'Export Report'}
    </button>
  )
}

export const MarkAllReadButton = ({ mobile = false }) => (
  <button className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white hover:bg-gray-50 transition text-sm font-medium text-gray-700">
    <span className="material-icons text-gray-500" style={{ fontSize: '18px' }}>done_all</span>
    {!mobile && 'Mark all as read'}
  </button>
)
