import useTasks from '@/hooks/useTasks'
import TaskFilters from '@/components/tasks/TaskFilters'
import TaskTable from '@/components/tasks/TaskTable'
import TaskCard from '@/components/tasks/TaskCard'
import BulkActionBar from '@/components/tasks/BulkActionBar'
import Pagination from '@/components/tasks/Pagination'
import EmptyState from '@/components/tasks/EmptyState'
import LoadingState from '@/components/tasks/LoadingState'

export default function MyTasks() {
  const t = useTasks()

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto w-full space-y-4 px-1 sm:px-6 py-4">

        {/* Filter Toolbar */}
        <TaskFilters
          search={t.search}       setSearch={t.setSearch}
          status={t.status}       setStatus={t.setStatus}
          priority={t.priority}   setPriority={t.setPriority}
          category={t.category}   setCategory={t.setCategory}
          sort={t.sort}           setSort={t.setSort}
          clearFilters={t.clearFilters}
          filterOpen={t.filterOpen}   setFilterOpen={t.setFilterOpen}
          sortOpen={t.sortOpen}       setSortOpen={t.setSortOpen}
          filterPos={t.filterPos}     setFilterPos={t.setFilterPos}
          sortPos={t.sortPos}         setSortPos={t.setSortPos}
          filterRef={t.filterRef}     sortRef={t.sortRef}
          filterBtnRef={t.filterBtnRef} sortBtnRef={t.sortBtnRef}
          calcPopoverPos={t.calcPopoverPos}
        />

        {/* Bulk Action Bar */}
        {t.someSelected && (
          <BulkActionBar
            selected={t.selected}
            onMarkDone={() => t.bulkAction('done')}
            onDelete={() => t.bulkAction('delete')}
            onClear={() => t.setSelected([])}
          />
        )}

        {/* ── Card View — below 1400px ── */}
        <div className="min-[1400px]:hidden space-y-3">

          {/* Select All bar */}
          {t.tasks.length > 0 && !t.loading && (
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-2.5 flex items-center gap-3">
              <input type="checkbox" checked={t.allSelected} onChange={t.toggleAll}
                className="w-4 h-4 rounded accent-purple-600 cursor-pointer" />
              <span className="text-sm text-gray-600">
                {t.allSelected ? 'Deselect all' : `Select all ${t.tasks.length} tasks`}
              </span>
              {t.someSelected && (
                <span className="ml-auto text-xs font-medium text-purple-600">
                  {t.selected.length} selected
                </span>
              )}
            </div>
          )}

          {/* Cards grid */}
          {t.loading ? (
            <div className="bg-white rounded-2xl border border-gray-100">
              <LoadingState />
            </div>
          ) : t.tasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100">
              <EmptyState />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {t.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isSelected={t.selected.includes(task.id)}
                  toggleOne={t.toggleOne}
                  openDropdownId={t.openDropdownId}
                  openDropdown={t.openDropdown}
                  dropdownPos={t.dropdownPos}
                  dropdownRef={t.dropdownRef}
                  onStatusChange={t.handleStatusChange}
                  onPriorityChange={t.handlePriorityChange}
                  onDelete={t.handleDeleteTask}
                />
              ))}
            </div>
          )}

          {/* Card Pagination */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <Pagination
              compact
              page={t.page}
              setPage={t.setPage}
              total={t.total}
              totalPages={t.totalPages}
            />
          </div>
        </div>

        {/* ── Table View — 1400px+ ── */}
        <TaskTable
          tasks={t.tasks}
          loading={t.loading}
          total={t.total}
          totalPages={t.totalPages}
          page={t.page}
          setPage={t.setPage}
          allSelected={t.allSelected}
          toggleAll={t.toggleAll}
          selected={t.selected}
          toggleOne={t.toggleOne}
          sort={t.sort}
          setSort={t.setSort}
          openDropdownId={t.openDropdownId}
          openDropdown={t.openDropdown}
          dropdownPos={t.dropdownPos}
          dropdownRef={t.dropdownRef}
          onStatusChange={t.handleStatusChange}
          onPriorityChange={t.handlePriorityChange}
          onDelete={t.handleDeleteTask}
        />

      </div>
    </div>
  )
}