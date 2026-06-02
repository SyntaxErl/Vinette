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
    <div className="bg-gray-50 dark:bg-gray-800/60 px-4 py-3">
      <div className="flex items-center gap-2 flex-wrap">

        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-gray-50/50 dark:bg-gray-800 flex-1 min-w-[180px]"
          style={{ maxWidth: '320px' }}>
          <span className="material-icons text-gray-400 dark:text-gray-500" style={{ fontSize: '16px' }}>search</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition">
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
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition ${activeFilterCount > 0 ? "dark:bg-purple-500/15 dark:border-purple-500/50 dark:text-purple-300" : "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"}`}
            style={{
              borderColor: activeFilterCount > 0 ? BRAND_COLOR : undefined,
              backgroundColor: activeFilterCount > 0 ? '#f5f3ff' : undefined,
              color: activeFilterCount > 0 ? BRAND_COLOR : undefined,
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
              className="fixed z-[998] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl p-5 w-80"
              style={{ top: filterPos.top, left: filterPos.left, animation: 'fadeInDown 0.15s ease' }}
            >
              {/* Status */}
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2.5">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_CHIPS.map((s) => {
                    const isActive = status === s.value
                    return (
                      <button key={s.value} onClick={() => setStatus(isActive ? '' : s.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition ${isActive ? "" : "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"}`}
                        style={{
                          backgroundColor: isActive ? s.bg : undefined,
                          color: isActive ? s.color : undefined,
                          borderColor: isActive ? s.color : undefined,
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2.5">Priority</p>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_CHIPS.map((p) => {
                    const isActive = priority === p.value
                    return (
                      <button key={p.value} onClick={() => setPriority(isActive ? '' : p.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition ${isActive ? "" : "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"}`}
                        style={{
                          backgroundColor: isActive ? p.bg : undefined,
                          color: isActive ? p.text : undefined,
                          borderColor: isActive ? p.dot : undefined,
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2.5">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_CHIPS.map((c) => {
                    const isActive = category === c.value
                    return (
                      <button key={c.value} onClick={() => setCategory(isActive ? '' : c.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition ${isActive ? "" : "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"}`}
                        style={{
                          backgroundColor: isActive ? c.bg : undefined,
                          color: isActive ? c.text : undefined,
                          borderColor: isActive ? c.text : undefined,
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
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => { setStatus(''); setPriority(''); setCategory(''); setFilterOpen(false) }}
                    className="w-full py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-100 dark:border-red-500/30 transition">
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition bg-white dark:bg-gray-900"
          >
            <span className="material-icons" style={{ fontSize: '16px', color: BRAND_COLOR }}>swap_vert</span>
            <span className="hidden sm:inline">{currentSort.label}:</span>
            <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">{currentSort.sub}</span>
            <span className="material-icons text-gray-400" style={{ fontSize: '16px' }}>
              {sortOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </button>

          {/* Sort Panel Portal */}
          {sortOpen && createPortal(
            <div
              ref={sortRef}
              className="fixed z-[998] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl overflow-hidden w-64"
              style={{ top: sortPos.top, left: sortPos.left, animation: 'fadeInDown 0.15s ease' }}
            >
              {SORT_OPTIONS.map((o) => {
                const isActive = sort === o.value
                return (
                  <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left border-b border-gray-50 dark:border-gray-800 last:border-0 ${isActive ? "bg-purple-50 dark:bg-purple-500/10" : ""}`}>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-purple-100 dark:bg-purple-500/15" : "bg-gray-50 dark:bg-gray-800"}`}
                    >
                      <span className="material-icons" style={{ fontSize: '16px', color: isActive ? BRAND_COLOR : '#9ca3af' }}>{o.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold dark:text-gray-100" style={{ color: isActive ? BRAND_COLOR : undefined }}>{o.label}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{o.sub}</p>
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-gray-200 dark:border-gray-700 hover:border-red-100 dark:hover:border-red-500/30 transition">
            <span className="material-icons" style={{ fontSize: '15px' }}>close</span>
            Clear All
          </button>
        )}

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 w-full mt-1">
            {status && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30"
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