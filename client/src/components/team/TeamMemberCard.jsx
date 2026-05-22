import MemberAvatar from './MemberAvatar'
import RoleBadge from './RoleBadge'
import StatusDot from './StatusDot'
import { formatDate } from '@/utils/taskHelpers'

// Mobile / tablet card variant of a member or pending invite.
export default function TeamMemberCard({ member, isSelected, onSelect, onResend, resending, canManage = true }) {
  return (
    <button
      onClick={() => onSelect(member)}
      className={`w-full text-left bg-white rounded-2xl border px-4 py-3.5 transition ${isSelected ? 'border-purple-300 ring-2 ring-purple-50' : 'border-gray-100 hover:border-gray-200'}`}
    >
      <div className="flex items-center gap-3">
        <MemberAvatar name={member.name || member.email} status={member.status} size={44} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 truncate flex items-center gap-1.5">
            {member.name || member.email}
            {member.isYou && <span className="text-[10px] font-medium text-gray-400">(You)</span>}
          </p>
          <p className="text-xs text-gray-400 truncate">{member.email}</p>
        </div>
        <RoleBadge role={member.role} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <StatusDot status={member.status} />
        {member.isPending && canManage ? (
          <span
            onClick={(e) => { e.stopPropagation(); onResend?.(member) }}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            {resending ? 'Sending...' : 'Resend'}
          </span>
        ) : member.isPending ? (
          <span className="text-xs text-amber-500">Pending</span>
        ) : (
          <span className="text-xs text-gray-400">Joined {formatDate(member.joined_at)}</span>
        )}
      </div>
    </button>
  )
}
