// Loading placeholder for the Analytics page — mirrors its layout (4 stat
// cards, two-up chart row, full-width trend, weekly + insights) so there's no
// jump when the real data swaps in. Styled like DashboardSkeleton.
function AnalyticsSkeleton() {
  return (
    <div
      className="max-w-7xl mx-auto w-full px-6 sm:px-6 lg:px-8 py-6 animate-pulse"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-28 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16 mb-3" />
                <div className="h-2 bg-gray-200 rounded w-32" />
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl ml-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Full-width trend chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-60 bg-gray-100 rounded-xl" />
      </div>

      {/* Priority (2/3) + Category (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
          <div className="h-52 bg-gray-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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

      {/* Weekly performance + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
          <div className="h-24 bg-gray-100 rounded-xl" />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="h-4 bg-gray-200 rounded w-36 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsSkeleton;
