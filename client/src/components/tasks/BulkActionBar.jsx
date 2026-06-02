import { BRAND_COLOR } from '@/constants/taskOptions'

export default function BulkActionBar({ selected, onMarkDone, onDelete, onClear }) {
  return (
    <div className="px-4 py-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-2xl">

      {/* Desktop (830px+): single row */}
      <div className="hidden min-[830px]:flex items-center gap-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold text-white"
            style={{ backgroundColor: BRAND_COLOR }}>
            {selected.length}
          </span>
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300 whitespace-nowrap">
            task{selected.length > 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="w-px h-5 bg-purple-200 dark:bg-purple-500/30 flex-shrink-0" />
        <button onClick={onMarkDone}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-green-50 dark:hover:bg-green-500/10 bg-white dark:bg-gray-800 dark:border-green-500/50 dark:text-green-400 whitespace-nowrap flex-shrink-0"
          style={{ borderColor: '#22c55e', color: '#22c55e' }}>
          <span className="material-icons" style={{ fontSize: '15px' }}>check_circle</span>
          Mark as Done
        </button>
        <button onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-red-50 dark:hover:bg-red-500/10 bg-white dark:bg-gray-800 dark:border-red-500/50 dark:text-red-400 whitespace-nowrap flex-shrink-0"
          style={{ borderColor: '#ef4444', color: '#ef4444' }}>
          <span className="material-icons" style={{ fontSize: '15px' }}>delete_outline</span>
          Delete
        </button>
        <button onClick={onClear}
          className="flex items-center gap-1 text-sm font-medium text-purple-400 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition ml-auto flex-shrink-0 whitespace-nowrap">
          <span className="material-icons" style={{ fontSize: '15px' }}>close</span>
          Clear
        </button>
      </div>

      {/* Mobile + iPad (below 830px): two rows */}
      <div className="min-[830px]:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold text-white"
              style={{ backgroundColor: BRAND_COLOR }}>
              {selected.length}
            </span>
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              task{selected.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <button onClick={onClear}
            className="flex items-center gap-1 text-sm font-medium text-purple-400 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition">
            <span className="material-icons" style={{ fontSize: '15px' }}>close</span>
            Clear
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2.5">
          <button onClick={onMarkDone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-green-50 dark:hover:bg-green-500/10 bg-white dark:bg-gray-800 dark:border-green-500/50 dark:text-green-400"
            style={{ borderColor: '#22c55e', color: '#22c55e' }}>
            <span className="material-icons" style={{ fontSize: '15px' }}>check_circle</span>
            Mark as Done
          </button>
          <button onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-red-50 dark:hover:bg-red-500/10 bg-white dark:bg-gray-800 dark:border-red-500/50 dark:text-red-400"
            style={{ borderColor: '#ef4444', color: '#ef4444' }}>
            <span className="material-icons" style={{ fontSize: '15px' }}>delete_outline</span>
            Delete
          </button>
        </div>
      </div>

    </div>
  )
}