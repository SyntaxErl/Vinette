const ROLE_META = {
  admin:  { bg: '#ede9fe', text: '#5b4fcf', label: 'Admin' },
  member: { bg: '#eff6ff', text: '#3b82f6', label: 'Member' },
}

export default function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.member
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold"
      style={{ backgroundColor: meta.bg, color: meta.text }}
    >
      {meta.label}
    </span>
  )
}
