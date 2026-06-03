import { Avatar } from '@/components/taskDetail/utils'
import { formatJoinDate } from './profileUtils'

// A small labelled chip used for the email / join-date meta row.
function MetaChip({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 max-w-full">
      <span className="material-icons text-gray-400 dark:text-gray-500 flex-shrink-0" style={{ fontSize: '15px' }}>{icon}</span>
      <span className="truncate">{children}</span>
    </span>
  )
}

// Top banner: large initials avatar centered over a gradient, with the name,
// email and join date laid out as readable chips underneath.
export default function ProfileHeader({ user }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      {/* Gradient banner */}
      <div className="h-28 relative" style={{ background: 'linear-gradient(135deg, #5b4fcf 0%, #7c6df0 100%)' }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #fff 0, transparent 40%), radial-gradient(circle at 80% 60%, #fff 0, transparent 35%)' }}
        />
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + name, centered on mobile, left-aligned from sm up */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="ring-4 ring-white dark:ring-gray-900 rounded-full w-fit -mt-12 shadow-md">
            <Avatar name={user?.name || user?.email} size={88} />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100 truncate max-w-full">
            {user?.name || 'Your name'}
          </h1>
          {user?.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 leading-relaxed max-w-xl">
              {user.bio}
            </p>
          )}
        </div>

        {/* Meta chips */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
          {user?.email && <MetaChip icon="mail">{user.email}</MetaChip>}
          <MetaChip icon="calendar_today">Joined {formatJoinDate(user?.created_at)}</MetaChip>
        </div>
      </div>
    </div>
  )
}
