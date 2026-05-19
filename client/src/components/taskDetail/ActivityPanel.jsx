import { Avatar, timeAgo } from './utils'

export default function ActivityPanel({ activity }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Activity</p>
      {activity.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2">
          <span className="material-icons text-gray-200" style={{ fontSize: 36 }}>history</span>
          <p className="text-xs text-gray-300 italic">No activity yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...activity].reverse().map((a, i) => (
            <div key={a.id ?? i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <Avatar name={a.actor_name} size={26} />
                {i < activity.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-2" />}
              </div>
              <div className="flex-1 min-w-0 pb-3">
                <p className="text-sm text-gray-600 leading-snug">
                  <span className="font-semibold text-gray-800">{a.actor_name} </span>
                  {a.action}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(a.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
