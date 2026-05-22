import MemberAvatar from './MemberAvatar'
import RoleBadge from './RoleBadge'
import StatusDot from './StatusDot'
import { formatDate } from '@/utils/taskHelpers'

export default function TeamMemberRow({ member, isSelected, onSelect }) {
  return (
    <tr
      onClick={() => onSelect(member)}
      className={`border-b border-gray-50 last:border-0 cursor-pointer transition ${isSelected ? 'bg-purple-50/60' : 'hover:bg-gray-50'}`}
    >
      {/* Member */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <MemberAvatar name={member.name} status={member.status} size={40} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate flex items-center gap-1.5">
              {member.name || '—'}
              {member.isOwner && <span className="text-[10px] font-medium text-gray-400">(You)</span>}
            </p>
            <p className="text-xs text-gray-400 truncate">{member.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-5 py-3.5"><RoleBadge role={member.role} /></td>

      {/* Status */}
      <td className="px-5 py-3.5"><StatusDot status={member.status} /></td>

      {/* Joined */}
      <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(member.joined_at)}</td>

      {/* Actions */}
      <td className="px-5 py-3.5 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(member) }}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          aria-label="Member details"
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>more_horiz</span>
        </button>
      </td>
    </tr>
  )
}
