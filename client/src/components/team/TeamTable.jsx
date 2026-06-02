import TeamMemberRow from './TeamMemberRow'
import PendingInviteRow from './PendingInviteRow'
import { memberKey } from './teamUtils'

export default function TeamTable({ members, pending, selectedKey, onSelect, onResend, resendingId, canManage = true }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/60">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Member</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Joined On</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <TeamMemberRow
                key={memberKey(m)}
                member={m}
                isSelected={selectedKey === memberKey(m)}
                onSelect={onSelect}
              />
            ))}

            {pending.length > 0 && (
              <tr>
                <td colSpan={5} className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-900">
                  Pending Invites
                </td>
              </tr>
            )}
            {pending.map((p) => (
              <PendingInviteRow
                key={memberKey(p)}
                invite={p}
                isSelected={selectedKey === memberKey(p)}
                onSelect={onSelect}
                onResend={onResend}
                resending={resendingId === p.rowId}
                canManage={canManage}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
