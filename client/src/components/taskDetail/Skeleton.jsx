export default function TaskDetailSkeleton({ onClose }) {
  const p = 'bg-gray-200 rounded-lg animate-pulse'
  const metaRow = (
    <div className="flex items-start gap-3 py-2.5 px-3 border-b border-gray-50 last:border-0">
      <div className={`w-7 h-7 rounded-lg flex-shrink-0 ${p}`} />
      <div className="flex-1 space-y-1.5 py-0.5">
        <div className={`h-2.5 w-16 ${p}`} />
        <div className={`h-4 w-28 ${p}`} />
      </div>
    </div>
  )
  const activityRow = (
    <div className="flex gap-3">
      <div className={`w-[26px] h-[26px] rounded-full flex-shrink-0 ${p}`} />
      <div className="flex-1 space-y-1.5 pb-3">
        <div className={`h-3.5 w-4/5 ${p}`} />
        <div className={`h-2.5 w-16 ${p}`} />
      </div>
    </div>
  )

  const leftPane = (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className={`h-2.5 w-24 ${p}`} />
        <div className={`h-20 w-full rounded-xl ${p}`} />
      </section>
      <section className="space-y-3">
        <div className={`h-2.5 w-20 ${p}`} />
        <div className={`h-1.5 w-full rounded-full ${p}`} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <div className={`w-5 h-5 rounded-full flex-shrink-0 ${p}`} />
            <div className={`h-3.5 rounded ${p}`} style={{ width: `${55 + i * 12}%` }} />
          </div>
        ))}
      </section>
      <section className="space-y-4">
        <div className={`h-2.5 w-20 ${p}`} />
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex-shrink-0 ${p}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-28 ${p}`} />
              <div className={`h-12 w-full rounded-2xl ${p}`} />
            </div>
          </div>
        ))}
      </section>
    </div>
  )

  const rightPane = (
    <div className="space-y-6">
      <div>
        <div className={`h-2.5 w-16 mb-3 ${p}`} />
        <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
          {[...Array(6)].map((_, i) => <div key={i}>{metaRow}</div>)}
        </div>
      </div>
      <div className="border-t border-gray-200" />
      <div>
        <div className={`h-2.5 w-16 mb-3 ${p}`} />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i}>{activityRow}</div>)}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className={`h-1 flex-shrink-0 rounded-t-3xl sm:rounded-t-2xl ${p}`} />

      <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-3">
            <div className={`h-6 w-2/3 ${p}`} />
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`h-6 w-20 ${p}`} />
              <div className={`h-6 w-16 ${p}`} />
              <div className={`h-6 w-14 ${p}`} />
              <div className={`h-6 w-24 hidden sm:block ${p}`} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition flex-shrink-0 mt-0.5"
          >
            <span className="material-icons" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>
        <div className="flex lg:hidden gap-1 mt-3 bg-gray-50 p-1 rounded-xl">
          {[...Array(3)].map((_, i) => <div key={i} className={`flex-1 h-8 rounded-lg ${p}`} />)}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 lg:hidden">{leftPane}</div>
        <div className="hidden lg:flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 min-w-0">{leftPane}</div>
          <div
            className="overflow-y-auto px-5 py-5 flex-shrink-0 border-l border-gray-100 bg-gray-50/40"
            style={{ width: 288 }}
          >{rightPane}</div>
        </div>
      </div>
    </>
  )
}
