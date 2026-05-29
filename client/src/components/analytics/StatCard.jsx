// One summary card at the top of the Analytics page.
// `tone` picks the soft background; `visual` is the right-side icon/gauge/sparkline
// each card supplies. `trend` renders the coloured ▲/▼ delta line.

const TONES = {
  purple: "bg-purple-50 border-purple-100",
  green: "bg-green-50 border-green-100",
  amber: "bg-amber-50 border-amber-100",
  blue: "bg-blue-50 border-blue-100",
};

export default function StatCard({ label, value, suffix, hint, trend, tone = "purple", visual }) {
  return (
    <div className={`rounded-2xl p-5 border shadow-sm ${TONES[tone] || TONES.purple}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {value}
            {suffix && <span className="text-lg font-semibold text-gray-400 ml-1">{suffix}</span>}
          </p>
        </div>
        {visual && <div className="flex-shrink-0">{visual}</div>}
      </div>

      {trend ? (
        <div className="flex items-center gap-1.5 mt-3">
          <span
            className="material-icons"
            style={{ fontSize: "16px", color: trend.good ? "#22c55e" : "#ef4444" }}
          >
            {trend.up ? "arrow_upward" : "arrow_downward"}
          </span>
          <span className="text-xs font-semibold" style={{ color: trend.good ? "#22c55e" : "#ef4444" }}>
            {trend.value}
          </span>
          <span className="text-xs text-gray-400">{trend.label}</span>
        </div>
      ) : (
        hint && <p className="text-xs text-gray-400 mt-3">{hint}</p>
      )}
    </div>
  );
}
