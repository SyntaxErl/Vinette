const selectCls =
  'appearance-none border border-gray-200 rounded-xl pl-3.5 pr-9 py-2.5 text-sm text-gray-700 bg-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition cursor-pointer'

export default function TeamFilters({ search, setSearch, statusFilter, setStatusFilter, roleFilter, setRoleFilter }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Search */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white flex-1 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-50 transition">
        <span className="material-icons text-gray-400 flex-shrink-0" style={{ fontSize: '18px' }}>search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent min-w-0"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
            <span className="material-icons" style={{ fontSize: '16px' }}>close</span>
          </button>
        )}
      </div>

      {/* Status */}
      <div className="relative">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="">All Status</option>
          <option value="online">Online</option>
          <option value="away">Away</option>
          <option value="offline">Offline</option>
          <option value="pending">Pending</option>
        </select>
        <span className="material-icons absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
      </div>

      {/* Role */}
      <div className="relative">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectCls}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <span className="material-icons absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
      </div>
    </div>
  )
}
