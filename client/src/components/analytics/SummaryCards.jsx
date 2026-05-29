import StatCard from "./StatCard";
import ScoreRing from "./ScoreRing";
import { formatDuration } from "./analyticsUtils";

// Tiny inline sparkline (no chart lib needed at this size) for the
// Completion Rate card — plots the weekly completion-rate trend.
function Sparkline({ points, width = 72, height = 32, color = "#5b4fcf" }) {
  const vals = points.map((p) => p.rate);
  if (vals.length < 2) return null;
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const span = max - min || 1;
  const step = width / (vals.length - 1);
  const coords = vals.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={coords.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={coords[coords.length - 1].split(",")[0]}
        cy={coords[coords.length - 1].split(",")[1]}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

const scoreHint = (s) => {
  if (s >= 80) return "Great job! 🎉";
  if (s >= 60) return "Good progress 👍";
  if (s >= 40) return "Keep it up";
  return "Just getting started";
};

export default function SummaryCards({ summary, completionTrend, rangeLabel = "last 30 days" }) {
  const completedDelta = summary.completedThisPeriod - summary.completedPrevPeriod;
  const vsLabel = `vs ${rangeLabel}`;

  // Average completion time trend (faster = good).
  let avgTrend = null;
  if (summary.avgCompletionDays != null && summary.avgCompletionDaysPrev != null) {
    const diff = +(summary.avgCompletionDays - summary.avgCompletionDaysPrev).toFixed(1);
    if (diff !== 0) {
      avgTrend = {
        up: diff > 0,
        good: diff < 0, // shorter completion time is better
        value: `${Math.abs(diff)} ${Math.abs(diff) === 1 ? "day" : "days"}`,
        label: vsLabel,
      };
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 animate-fadeInUp">
      <StatCard
        label="Completion Rate"
        value={summary.completionRate}
        suffix="%"
        tone="purple"
        trend={{
          up: completedDelta >= 0,
          good: completedDelta >= 0,
          value: `${completedDelta >= 0 ? "+" : ""}${completedDelta}`,
          label: `completed ${vsLabel}`,
        }}
        visual={<Sparkline points={completionTrend} />}
      />

      <StatCard
        label="Tasks Completed"
        value={summary.completedThisPeriod}
        tone="green"
        trend={{
          up: completedDelta >= 0,
          good: completedDelta >= 0,
          value: `${completedDelta >= 0 ? "+" : ""}${completedDelta}`,
          label: vsLabel,
        }}
        visual={
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100">
            <span className="material-icons text-green-500 text-[22px]">check_circle</span>
          </div>
        }
      />

      <StatCard
        label="Productivity Score"
        value={summary.productivityScore}
        suffix="/100"
        tone="amber"
        hint={scoreHint(summary.productivityScore)}
        visual={
          <ScoreRing value={summary.productivityScore} color="#f59e0b" track="#fde68a">
            <span className="material-icons text-amber-500" style={{ fontSize: "20px" }}>
              emoji_events
            </span>
          </ScoreRing>
        }
      />

      <StatCard
        label="Avg. Completion Time"
        value={formatDuration(summary.avgCompletionDays)}
        tone="blue"
        trend={avgTrend}
        hint={avgTrend ? undefined : "Time from created to done"}
        visual={
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100">
            <span className="material-icons text-blue-500 text-[22px]">schedule</span>
          </div>
        }
      />
    </div>
  );
}
