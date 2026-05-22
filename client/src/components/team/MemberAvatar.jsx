import { Avatar } from '@/components/taskDetail/utils'

const DOT = {
  online:  '#22c55e',
  away:    '#f59e0b',
  offline: '#9ca3af',
  pending: '#f59e0b',
}

// Avatar with a presence dot in the bottom-right corner.
export default function MemberAvatar({ name, status, size = 40 }) {
  const dotSize = Math.max(9, Math.round(size * 0.28))
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <Avatar name={name || '?'} size={size} />
      {status && (
        <span
          className="absolute rounded-full border-2 border-white"
          style={{ width: dotSize, height: dotSize, backgroundColor: DOT[status] || DOT.offline, right: -1, bottom: -1 }}
        />
      )}
    </div>
  )
}
