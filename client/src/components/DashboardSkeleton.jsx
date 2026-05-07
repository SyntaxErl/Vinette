function DashboardSkeleton() {
  return (
    <div
      className="max-w-7xl mx-auto w-full px-6 sm:px-6 lg:px-8 py-6 animate-pulse"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-2 bg-gray-200 rounded w-32" />
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl ml-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tasks + Category Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Tasks Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="flex items-center gap-2">
              <div className="h-7 bg-gray-200 rounded-lg w-24" />
              <div className="h-7 bg-gray-200 rounded-lg w-24" />
              <div className="h-4 bg-gray-200 rounded w-12" />
            </div>
          </div>

          {/* Task rows */}
          <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="grid items-center px-5 py-3 gap-3
                  [grid-template-columns:12px_1fr_90px]
                  sm:[grid-template-columns:12px_1fr_120px_90px]
                  lg:[grid-template-columns:12px_1fr_90px_80px_130px_100px]"
              >
                {/* Dot */}
                <div className="w-2.5 h-2.5 bg-gray-200 rounded-full flex-shrink-0" />

                {/* Title */}
                <div className="flex flex-col min-w-0 gap-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="flex items-center gap-1.5 lg:hidden">
                    <div className="h-4 bg-gray-200 rounded-full w-14" />
                    <div className="h-4 bg-gray-200 rounded-full w-12" />
                  </div>
                </div>

                {/* Category badge — lg+ only */}
                <div className="hidden lg:flex justify-center">
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </div>

                {/* Priority badge — lg+ only */}
                <div className="hidden lg:flex justify-center">
                  <div className="h-5 bg-gray-200 rounded-full w-14" />
                </div>

                {/* Due date — sm+ */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <div className="h-3.5 w-3.5 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>

                {/* Status badge */}
                <div className="flex justify-end lg:justify-center">
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
        </div>

        {/* Category Chart Skeleton */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-36 mb-4" />
          <div className="w-36 h-36 bg-gray-200 rounded-full mx-auto mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded-full" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;