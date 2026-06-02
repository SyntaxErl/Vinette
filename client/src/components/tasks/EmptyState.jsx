export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="material-icons text-gray-200 dark:text-gray-700 mb-3" style={{ fontSize: '48px' }}>assignment</span>
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No tasks found</p>
      <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Try adjusting your filters or create a new task</p>
    </div>
  )
}