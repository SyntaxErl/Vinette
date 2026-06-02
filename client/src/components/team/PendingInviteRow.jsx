import MemberAvatar from './MemberAvatar'
import RoleBadge from './RoleBadge'
import StatusDot from './StatusDot'
import { formatDate } from '@/utils/taskHelpers'

export default function PendingInviteRow({ invite, isSelected, onSelect, onResend, resending, canManage = true }) {
  return (
    <tr
      onClick={() => onSelect(invite)}
      className={`border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer transition ${isSelected ? 'bg-purple-50/60 dark:bg-purple-500/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <MemberAvatar name={invite.name || invite.email} status="pending" size={40} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{invite.name || invite.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{invite.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5"><RoleBadge role={invite.role} /></td>
      <td className="px-5 py-3.5"><StatusDot status="pending" /></td>
      <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">Invited {formatDate(invite.joined_at)}</td>
      <td className="px-5 py-3.5 text-right">
        {canManage && (
          <button
            onClick={(e) => { e.stopPropagation(); onResend(invite) }}
            disabled={resending}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            {resending ? 'Sending...' : 'Resend'}
          </button>
        )}
      </td>
    </tr>
  )
}
