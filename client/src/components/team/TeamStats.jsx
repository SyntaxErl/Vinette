const CARDS = [
  { key: 'total',   label: 'Total Members',  icon: 'groups',        color: '#5b4fcf', bg: '#ede9fe' },
  { key: 'active',  label: 'Active Members', icon: 'check_circle',  color: '#22c55e', bg: '#dcfce7' },
  { key: 'pending', label: 'Pending Invites',icon: 'schedule',      color: '#f59e0b', bg: '#fef3c7' },
  { key: 'admins',  label: 'Admin',          icon: 'shield',        color: '#3b82f6', bg: '#dbeafe' },
]

export default function TeamStats({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {CARDS.map((c) => (
        <div key={c.key} className="bg-white rounded-2xl border border-gray-100 px-4 sm:px-5 py-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.bg }}>
            <span className="material-icons" style={{ fontSize: '22px', color: c.color }}>{c.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-gray-900 leading-tight">{stats?.[c.key] ?? 0}</p>
            <p className="text-xs text-gray-400 truncate">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
