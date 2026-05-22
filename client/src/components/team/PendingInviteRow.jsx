import MemberAvatar from './MemberAvatar'
import RoleBadge from './RoleBadge'
import StatusDot from './StatusDot'
import { formatDate } from '@/utils/taskHelpers'

export default function PendingInviteRow({ invite, isSelected, onSelect, onResend, resending }) {
  return (
    <tr
      onClick={() => onSelect(invite)}
      className={`border-b border-gray-50 last:border-0 cursor-pointer transition ${isSelected ? 'bg-purple-50/60' : 'hover:bg-gray-50'}`}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <MemberAvatar name={invite.name || invite.email} status="pending" size={40} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{invite.name || invite.email}</p>
            <p className="text-xs text-gray-400 truncate">{invite.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5"><RoleBadge role={invite.role} /></td>
      <td className="px-5 py-3.5"><StatusDot status="pending" /></td>
      <td className="px-5 py-3.5 text-sm text-gray-500">Invited {formatDate(invite.joined_at)}</td>
      <td className="px-5 py-3.5 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); onResend(invite) }}
          disabled={resending}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
        >
          {resending ? 'Sending...' : 'Resend'}
        </button>
      </td>
    </tr>
  )
}
