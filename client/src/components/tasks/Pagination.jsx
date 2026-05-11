import { PER_PAGE, BRAND_COLOR } from '@/constants/taskOptions'

export default function Pagination({ page, setPage, total, totalPages, compact = false }) {
  const start = total === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const end   = Math.min(page * PER_PAGE, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
      <p className="text-sm text-gray-500">
        Showing {start} to {end} of {total} tasks
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>chevron_left</span>
        </button>

        {compact ? (
          <span className="w-8 h-8 rounded-lg text-sm font-medium border flex items-center justify-center"
            style={{ backgroundColor: BRAND_COLOR, color: 'white', borderColor: BRAND_COLOR }}>
            {page}
          </span>
        ) : (
          <>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-sm font-medium border transition"
                style={{
                  backgroundColor: page === p ? BRAND_COLOR : 'white',
                  color: page === p ? 'white' : '#6b7280',
                  borderColor: page === p ? BRAND_COLOR : '#e5e7eb',
                }}>
                {p}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="text-gray-400 px-1">...</span>
                <button onClick={() => setPage(totalPages)}
                  className="w-8 h-8 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                  {totalPages}
                </button>
              </>
            )}
          </>
        )}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>chevron_right</span>
        </button>

        {!compact && (
          <select className="ml-2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-600 bg-white outline-none" disabled>
            <option>10 / page</option>
          </select>
        )}
      </div>
    </div>
  )
}