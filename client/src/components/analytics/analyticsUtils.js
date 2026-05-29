// Shared constants and formatters for the Analytics page (no JSX — keeps fast
// refresh happy; chart tooltips live in tooltips.jsx).
// Hex values mirror the Dashboard charts so the two pages stay visually consistent.

export const CATEGORY_COLORS = {
  work: "#5b4fcf",
  personal: "#22c55e",
  school: "#3b82f6",
  fitness: "#ec4899",
  others: "#9ca3af",
};

export const PRIORITY_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#22c55e",
  none: "#9ca3af",
};

export const PRIORITY_LABELS = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
  none: "No Priority",
};

export const BRAND = "#5b4fcf";

export const getCategoryColor = (c) => CATEGORY_COLORS[c] || "#9ca3af";
export const getPriorityColor = (p) => PRIORITY_COLORS[p] || "#9ca3af";

export const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);

export const pct = (value, total) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

// "2.4 days" / "18 hrs" / "—"
export const formatDuration = (days) => {
  if (days == null) return "—";
  if (days < 1) return `${Math.round(days * 24)} hrs`;
  return `${days} ${days === 1 ? "day" : "days"}`;
};

// Build the bottom "Insights & Trends" cards from the analytics payload.
export const deriveInsights = (data) => {
  const { summary, byCategory = [], bestDay } = data;
  const insights = [];

  // 1. Completion trend (this 30d vs prev 30d)
  const delta = summary.completedThis30 - summary.completedPrev30;
  if (delta > 0) {
    insights.push({
      icon: "trending_up",
      tone: "green",
      title: "Great progress!",
      text: `You completed ${delta} more ${delta === 1 ? "task" : "tasks"} than the previous 30 days.`,
    });
  } else if (delta < 0) {
    insights.push({
      icon: "trending_down",
      tone: "red",
      title: "Slowing down",
      text: `You completed ${Math.abs(delta)} fewer ${Math.abs(delta) === 1 ? "task" : "tasks"} than the previous 30 days.`,
    });
  } else {
    insights.push({
      icon: "trending_flat",
      tone: "purple",
      title: "Steady pace",
      text: "Your output matched the previous 30 days. Consistency pays off.",
    });
  }

  // 2. Most productive day
  insights.push({
    icon: "event_available",
    tone: "blue",
    title: "Most productive day",
    text: bestDay
      ? `You complete the most tasks on ${bestDay}s.`
      : "Complete a few tasks to reveal your most productive day.",
  });

  // 3. Focus opportunity (avg completion time)
  insights.push({
    icon: "schedule",
    tone: "yellow",
    title: "Focus opportunity",
    text:
      summary.avgCompletionDays != null
        ? `Tasks take ${formatDuration(summary.avgCompletionDays)} on average. Try breaking big ones down.`
        : "Finish a few tasks to track your average completion time.",
  });

  // 4. Category focus (top category)
  const top = [...byCategory].sort((a, b) => b.count - a.count)[0];
  const total = byCategory.reduce((s, c) => s + c.count, 0);
  insights.push({
    icon: "donut_large",
    tone: "purple",
    title: "Category focus",
    text: top
      ? `${capitalize(top.category)} tasks make up ${pct(top.count, total)}% of your workload.`
      : "Add tasks across categories to see where your focus goes.",
  });

  return insights;
};
