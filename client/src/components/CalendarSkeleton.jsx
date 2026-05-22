// Loading placeholder for Calendar — mirrors the real layout (toolbar + a 7-col
// month grid) so the page doesn't jump when the live calendar swaps in.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarSkeleton() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto w-full px-1 sm:px-6 py-4 animate-pulse">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-gray-200 rounded-xl" />
            <div className="h-9 w-9 bg-gray-200 rounded-xl" />
            <div className="h-9 w-9 bg-gray-200 rounded-xl" />
            <div className="h-5 w-40 bg-gray-200 rounded ml-1" />
          </div>
          <div className="h-9 w-44 bg-gray-200 rounded-xl" />
        </div>

        {/* Month grid */}
        <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-3 flex justify-center">
                <div className="h-2.5 w-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>

          {/* 5 week rows */}
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={row} className="grid grid-cols-7 border-b border-gray-100 last:border-0">
              {Array.from({ length: 7 }).map((_, col) => (
                <div key={col} className="h-24 border-l border-gray-100 first:border-0 p-2">
                  <div className="h-2.5 w-5 bg-gray-200 rounded mb-2" />
                  {/* a couple of event bars on scattered cells */}
                  {(row + col) % 3 === 0 && <div className="h-4 bg-gray-200 rounded w-full mb-1" />}
                  {(row + col) % 4 === 0 && <div className="h-4 bg-gray-100 rounded w-2/3" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarSkeleton;
