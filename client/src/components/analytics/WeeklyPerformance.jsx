import ChartCard from "./ChartCard";

// "This week vs last week" completed-task comparison.
export default function WeeklyPerformance({ weeklyPerformance }) {
  const thisWeek = weeklyPerformance?.thisWeek || 0;
  const lastWeek = weeklyPerformance?.lastWeek || 0;
  const diff = thisWeek - lastWeek;
  const changePct = lastWeek > 0 ? Math.abs(Math.round((diff / lastWeek) * 100)) : null;
  const isUp = diff >= 0;

  return (
    <ChartCard title="Weekly Performance" subtitle="Tasks completed this week vs last">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 font-medium">This Week</p>
          <p className="text-3xl font-bold mt-1" style={{ color: isUp ? "#16a34a" : "#ef4444" }}>
            {thisWeek}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="material-icons" style={{ fontSize: "15px", color: isUp ? "#22c55e" : "#ef4444" }}>
              {isUp ? "arrow_upward" : "arrow_downward"}
            </span>
            <span className="text-xs font-semibold" style={{ color: isUp ? "#22c55e" : "#ef4444" }}>
              {changePct !== null ? `${changePct}%` : diff >= 0 ? `+${diff}` : diff}
            </span>
            <span className="text-xs text-gray-400">vs last week</span>
          </div>
        </div>

        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: isUp ? "#f0fdf4" : "#fef2f2" }}>
          <span className="material-icons" style={{ fontSize: "26px", color: isUp ? "#22c55e" : "#ef4444" }}>
            {isUp ? "trending_up" : "trending_down"}
          </span>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium">Last Week</p>
          <p className="text-3xl font-bold text-gray-700 mt-1">{lastWeek}</p>
          <p className="text-xs text-gray-400 mt-1">completed</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 flex items-center gap-2">
        <span className="material-icons text-amber-500" style={{ fontSize: "18px" }}>emoji_events</span>
        <p className="text-xs text-gray-600">
          {thisWeek === 0 && lastWeek === 0
            ? "Complete a task to start tracking your weekly performance."
            : isUp
              ? `You're ${changePct !== null ? `${changePct}% ` : ""}ahead of last week — keep the momentum!`
              : "A slower week — a small win today turns it around."}
        </p>
      </div>
    </ChartCard>
  );
}
