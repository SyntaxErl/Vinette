import { createPortal } from 'react-dom'
import { STATUS_CHIPS, PRIORITY_CHIPS, CATEGORY_CHIPS, SORT_OPTIONS, BRAND_COLOR } from '@/constants/taskOptions'
import { getPriorityColor, getCategoryColor, getStatusLabel } from '@/utils/taskHelpers'

export default function TaskFilters({
  search, setSearch,
  status, setStatus,
  priority, setPriority,
  category, setCategory,
  sort, setSort,
  clearFilters,
  filterOpen, setFilterOpen,
  sortOpen, setSortOpen,
  filterPos, setFilterPos,
  sortPos, setSortPos,
  filterRef, sortRef,
  filterBtnRef, sortBtnRef,
  calcPopoverPos,
}) {
  const activeFilterCount = [status, priority, category].filter(Boolean).length
  const currentSort = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0]

  return (
    <div className="bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2 flex-wrap">

        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 flex-1 min-w-[180px]"
          style={{ maxWidth: '320px' }}>
          <span className="material-icons text-gray-400" style={{ fontSize: '16px' }}>search</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition">
              <span className="material-icons" style={{ fontSize: '14px' }}>close</span>
            </button>
          )}
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            ref={filterBtnRef}
            onClick={() => {
              if (!filterOpen) setFilterPos(calcPopoverPos(filterBtnRef, 320))
              setFilterOpen((p) => !p)
              setSortOpen(false)
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition"
            style={{
              borderColor: activeFilterCount > 0 ? BRAND_COLOR : '#e5e7eb',
              backgroundColor: activeFilterCount > 0 ? '#f5f3ff' : 'white',
              color: activeFilterCount > 0 ? BRAND_COLOR : '#374151',
            }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>tune</span>
            Filters
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: BRAND_COLOR }}>
                {activeFilterCount}
              </span>
            )}
            <span className="material-icons text-gray-400" style={{ fontSize: '16px' }}>
              {filterOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </button>

          {/* Filter Panel Portal */}
          {filterOpen && createPortal(
            <div
              ref={filterRef}
              className="fixed z-[998] bg-white rounded-2xl border border-gray-100 shadow-2xl p-5 w-80"
              style={{ top: filterPos.top, left: filterPos.left, animation: 'fadeInDown 0.15s ease' }}
            >
              {/* Status */}
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_CHIPS.map((s) => {
                    const isActive = status === s.value
                    return (
                      <button key={s.value} onClick={() => setStatus(isActive ? '' : s.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition"
                        style={{
                          backgroundColor: isActive ? s.bg : 'white',
                          color: isActive ? s.color : '#6b7280',
                          borderColor: isActive ? s.color : '#e5e7eb',
                        }}>
                        <span className="material-icons" style={{ fontSize: '14px', color: isActive ? s.color : '#9ca3af' }}>{s.icon}</span>
                        {s.label}
                        {isActive && <span className="material-icons" style={{ fontSize: '12px' }}>close</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Priority */}
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Priority</p>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_CHIPS.map((p) => {
                    const isActive = priority === p.value
                    return (
                      <button key={p.value} onClick={() => setPriority(isActive ? '' : p.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition"
                        style={{
                          backgroundColor: isActive ? p.bg : 'white',
                          color: isActive ? p.text : '#6b7280',
                          borderColor: isActive ? p.dot : '#e5e7eb',
                        }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.dot }} />
                        {p.label}
                        {isActive && <span className="material-icons" style={{ fontSize: '12px' }}>close</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_CHIPS.map((c) => {
                    const isActive = category === c.value
                    return (
                      <button key={c.value} onClick={() => setCategory(isActive ? '' : c.value)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition"
                        style={{
                          backgroundColor: isActive ? c.bg : 'white',
                          color: isActive ? c.text : '#6b7280',
                          borderColor: isActive ? c.text : '#e5e7eb',
                        }}>
                        {c.label}
                        {isActive && <span className="material-icons" style={{ fontSize: '12px' }}>close</span>}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => { setStatus(''); setPriority(''); setCategory(''); setFilterOpen(false) }}
                    className="w-full py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 border border-red-100 transition">
                    Clear all filters
                  </button>
                </div>
              )}
            </div>,
            document.body
          )}
        </div>

        {/* Sort Button */}
        <div className="relative">
          <button
            ref={sortBtnRef}
            onClick={() => {
              if (!sortOpen) setSortPos(calcPopoverPos(sortBtnRef, 256))
              setSortOpen((p) => !p)
              setFilterOpen(false)
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white"
          >
            <span className="material-icons" style={{ fontSize: '16px', color: BRAND_COLOR }}>swap_vert</span>
            <span className="hidden sm:inline">{currentSort.label}:</span>
            <span className="text-gray-500 hidden sm:inline">{currentSort.sub}</span>
            <span className="material-icons text-gray-400" style={{ fontSize: '16px' }}>
              {sortOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </button>

          {/* Sort Panel Portal */}
          {sortOpen && createPortal(
            <div
              ref={sortRef}
              className="fixed z-[998] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden w-64"
              style={{ top: sortPos.top, left: sortPos.left, animation: 'fadeInDown 0.15s ease' }}
            >
              {SORT_OPTIONS.map((o) => {
                const isActive = sort === o.value
                return (
                  <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0"
                    style={{ backgroundColor: isActive ? '#f5f3ff' : 'white' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: isActive ? '#ede9fe' : '#f9fafb' }}>
                      <span className="material-icons" style={{ fontSize: '16px', color: isActive ? BRAND_COLOR : '#9ca3af' }}>{o.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: isActive ? BRAND_COLOR : '#374151' }}>{o.label}</p>
                      <p className="text-xs text-gray-400">{o.sub}</p>
                    </div>
                    {isActive && <span className="material-icons ml-auto flex-shrink-0" style={{ fontSize: '16px', color: BRAND_COLOR }}>check</span>}
                  </button>
                )
              })}
            </div>,
            document.body
          )}
        </div>

        {/* Clear All */}
        {(search || activeFilterCount > 0) && (
          <button onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-100 transition">
            <span className="material-icons" style={{ fontSize: '15px' }}>close</span>
            Clear All
          </button>
        )}

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 w-full mt-1">
            {status && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border"
                style={{ backgroundColor: '#eff6ff', color: '#3b82f6', borderColor: '#bfdbfe' }}>
                {getStatusLabel(status)}
                <button onClick={() => setStatus('')} className="hover:opacity-70 transition">
                  <span className="material-icons" style={{ fontSize: '12px' }}>close</span>
                </button>
              </span>
            )}
            {priority && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border"
                style={{ backgroundColor: getPriorityColor(priority).bg, color: getPriorityColor(priority).text, borderColor: getPriorityColor(priority).dot + '60' }}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                <button onClick={() => setPriority('')} className="hover:opacity-70 transition">
                  <span className="material-icons" style={{ fontSize: '12px' }}>close</span>
                </button>
              </span>
            )}
            {category && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border"
                style={{ backgroundColor: getCategoryColor(category).bg, color: getCategoryColor(category).text, borderColor: getCategoryColor(category).text + '40' }}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
                <button onClick={() => setCategory('')} className="hover:opacity-70 transition">
                  <span className="material-icons" style={{ fontSize: '12px' }}>close</span>
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}