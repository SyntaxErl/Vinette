const STATUS_META = {
  online:  { color: '#22c55e', label: 'Online' },
  away:    { color: '#f59e0b', label: 'Away' },
  offline: { color: '#9ca3af', label: 'Offline' },
  pending: { color: '#f59e0b', label: 'Pending' },
}

export default function StatusDot({ status, showLabel = true }) {
  const meta = STATUS_META[status] || STATUS_META.offline
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: meta.color, boxShadow: status === 'online' ? `0 0 0 3px ${meta.color}22` : 'none' }}
      />
      {showLabel && <span className="text-sm text-gray-600">{meta.label}</span>}
    </span>
  )
}
