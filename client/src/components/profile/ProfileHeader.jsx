import { Avatar } from '@/components/taskDetail/utils'
import { formatJoinDate } from './profileUtils'

// Top banner: large initials avatar + name / email / join date.
export default function ProfileHeader({ user }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      <div className="h-24" style={{ background: 'linear-gradient(135deg, #5b4fcf 0%, #7c6df0 100%)' }} />
      <div className="px-5 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
          <div className="ring-4 ring-white dark:ring-gray-900 rounded-full w-fit">
            <Avatar name={user?.name || user?.email} size={80} />
          </div>
          <div className="min-w-0 sm:pb-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{user?.name || 'Your name'}</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
          <div className="sm:ml-auto sm:pb-1 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <span className="material-icons" style={{ fontSize: '16px' }}>calendar_today</span>
            Joined {formatJoinDate(user?.created_at)}
          </div>
        </div>
        {user?.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">{user.bio}</p>}
      </div>
    </div>
  )
}
