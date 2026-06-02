const ROLE_META = {
  admin:  { cls: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300', label: 'Admin' },
  member: { cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',          label: 'Member' },
}

export default function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.member
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${meta.cls}`}>
      {meta.label}
    </span>
  )
}
