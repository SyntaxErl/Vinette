import TaskTableRow from '@/components/tasks/TaskTableRow'
import EmptyState from '@/components/tasks/EmptyState'
import LoadingState from '@/components/tasks/LoadingState'
import Pagination from '@/components/tasks/Pagination'

const COL = '40px minmax(200px,1fr) 120px 120px 160px 130px 110px 40px'

export default function TaskTable({
  tasks, loading, total, totalPages,
  page, setPage,
  allSelected, toggleAll,
  selected, toggleOne,
  sort, setSort,
  openDropdownId, openDropdown,
  dropdownPos, dropdownRef,
  onStatusChange, onPriorityChange, onDelete,
}) {
  return (
    <div className="hidden min-[1400px]:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div
        className="grid items-center px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide gap-3"
        style={{ gridTemplateColumns: COL }}
      >
        <div>
          <input type="checkbox" checked={allSelected} onChange={toggleAll}
            className="w-4 h-4 rounded accent-purple-600 cursor-pointer" />
        </div>
        <div>Task</div>
        <div>Category</div>
        <div>Priority</div>
        <div
          className="flex items-center gap-1 cursor-pointer select-none hover:text-purple-600 transition-colors"
          onClick={() => setSort(sort === 'due_date' ? 'due_date_desc' : 'due_date')}
        >
          Due Date
          <span className="material-icons" style={{
            fontSize: '14px',
            color: (sort === 'due_date' || sort === 'due_date_desc') ? '#5b4fcf' : '#9ca3af',
          }}>
            {sort === 'due_date' ? 'arrow_upward' : sort === 'due_date_desc' ? 'arrow_downward' : 'unfold_more'}
          </span>
        </div>
        <div>Status</div>
        <div>Created On</div>
        <div className="flex justify-center">
          <span className="material-icons text-gray-400" style={{ fontSize: '18px' }}>settings</span>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <LoadingState />
      ) : tasks.length === 0 ? (
        <EmptyState />
      ) : (
        tasks.map((task) => (
          <TaskTableRow
            key={task.id}
            task={task}
            isSelected={selected.includes(task.id)}
            toggleOne={toggleOne}
            openDropdownId={openDropdownId}
            openDropdown={openDropdown}
            dropdownPos={dropdownPos}
            dropdownRef={dropdownRef}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
            onDelete={onDelete}
          />
        ))
      )}

      {/* Pagination */}
      <div className="border-t border-gray-100">
        <Pagination page={page} setPage={setPage} total={total} totalPages={totalPages} />
      </div>
    </div>
  )
}