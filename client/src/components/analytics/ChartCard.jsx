// Shared white card wrapper for every analytics chart panel.
// Keeps the header (title + optional right slot) and empty-state markup in one
// place so the chart components only worry about their chart.

export default function ChartCard({ title, subtitle, right, isEmpty, emptyIcon, emptyText, children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 animate-fadeInUp ${className}`}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="min-w-0">
          <h2 className="font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <span className="material-icons text-gray-200 dark:text-gray-700 mb-2" style={{ fontSize: "36px" }}>
            {emptyIcon || "insights"}
          </span>
          <p className="text-sm text-gray-400 dark:text-gray-500">{emptyText || "No data yet"}</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
