// Loading placeholder for BoardView — mirrors the real board layout
// (filter bar + 3 columns of cards) so the page doesn't jump on load.
const COLUMN_TINTS = [
  { headerClass: "bg-gray-100 dark:bg-gray-800",       cards: 4 }, // Todo
  { headerClass: "bg-amber-100 dark:bg-yellow-500/10", cards: 3 }, // In Progress
  { headerClass: "bg-green-100 dark:bg-green-500/10",  cards: 2 }, // Done
];

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
      {/* Title */}
      <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2" />
      {/* Description */}
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1.5" />
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
      {/* Badges */}
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
      </div>
      {/* Due date row */}
      <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="h-3.5 w-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 ml-auto" />
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto w-full px-1 sm:px-6 py-4 animate-pulse">
        {/* Filter bar */}
        <div className="bg-gray-50 dark:bg-gray-800/60 px-4 py-3 mb-4 flex items-center gap-2">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-28" />
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-40" />
        </div>

        {/* Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4 items-start">
          {COLUMN_TINTS.map((col, i) => (
            <div key={i} className="flex flex-col flex-1 min-w-[280px] max-w-sm">
              {/* Column header */}
              <div
                className={`flex items-center justify-between px-4 py-3 rounded-2xl mb-3 ${col.headerClass}`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-[18px] h-[18px] bg-gray-300/70 dark:bg-gray-600/70 rounded-full" />
                  <div className="h-3.5 bg-gray-300/70 dark:bg-gray-600/70 rounded w-24" />
                  <div className="w-5 h-5 bg-gray-300/70 dark:bg-gray-600/70 rounded-full" />
                </div>
                <div className="w-5 h-5 bg-gray-300/70 dark:bg-gray-600/70 rounded" />
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3 p-2">
                {Array.from({ length: col.cards }).map((_, c) => (
                  <CardSkeleton key={c} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BoardSkeleton;
