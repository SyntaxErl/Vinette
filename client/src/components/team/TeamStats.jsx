const CARDS = [
  { key: 'total',   label: 'Total Members',  icon: 'groups',        color: '#5b4fcf', iconCls: 'bg-purple-100 dark:bg-purple-500/20' },
  { key: 'active',  label: 'Active Members', icon: 'check_circle',  color: '#22c55e', iconCls: 'bg-green-100 dark:bg-green-500/20'  },
  { key: 'pending', label: 'Pending Invites',icon: 'schedule',      color: '#f59e0b', iconCls: 'bg-amber-100 dark:bg-amber-500/20'  },
  { key: 'admins',  label: 'Admin',          icon: 'shield',        color: '#3b82f6', iconCls: 'bg-blue-100 dark:bg-blue-500/20'   },
]

export default function TeamStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {CARDS.map((c) => (
        <div key={c.key} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-4 sm:px-5 py-4 flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconCls}`}>
            <span className="material-icons" style={{ fontSize: '22px', color: c.color }}>{c.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{stats?.[c.key] ?? 0}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
