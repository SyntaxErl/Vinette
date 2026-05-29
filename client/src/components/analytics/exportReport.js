// Build a CSV report from the analytics payload and trigger a browser download.
// Used by the navbar "Export Report" button.

const esc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const row = (cells) => cells.map(esc).join(",");

export function exportAnalyticsCsv(data) {
  if (!data?.summary) return false;

  const {
    summary,
    completionTrend = [],
    byPriority = [],
    byCategory = [],
    weeklyPerformance = {},
    bestDay,
    range,
  } = data;

  const lines = [];
  lines.push(row(["TaskFlow Analytics Report"]));
  lines.push(row(["Generated", new Date().toLocaleString()]));
  lines.push(row(["Date range", range?.label || "last 30 days"]));
  lines.push("");

  lines.push(row(["Summary"]));
  lines.push(row(["Metric", "Value"]));
  lines.push(row(["Tasks created", summary.total]));
  lines.push(row(["Tasks completed", summary.completedThisPeriod]));
  lines.push(row(["Completion rate (%)", summary.completionRate]));
  lines.push(row(["Productivity score", summary.productivityScore]));
  lines.push(row(["Avg. completion time (days)", summary.avgCompletionDays ?? "—"]));
  lines.push(row(["Overdue (now)", summary.overdue]));
  lines.push(row(["Most productive day", bestDay || "—"]));
  lines.push("");

  lines.push(row(["Completion Rate Over Time"]));
  lines.push(row(["Period", "Completed", "Created", "Rate (%)"]));
  completionTrend.forEach((t) => lines.push(row([t.label, t.completed, t.created, t.rate])));
  lines.push("");

  lines.push(row(["Tasks by Priority"]));
  lines.push(row(["Priority", "Count"]));
  byPriority.forEach((p) => lines.push(row([p.priority, p.count])));
  lines.push("");

  lines.push(row(["Tasks by Category"]));
  lines.push(row(["Category", "Count"]));
  byCategory.forEach((c) => lines.push(row([c.category, c.count])));
  lines.push("");

  lines.push(row(["Weekly Performance"]));
  lines.push(row(["This week completed", weeklyPerformance.thisWeek ?? 0]));
  lines.push(row(["Last week completed", weeklyPerformance.lastWeek ?? 0]));

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `taskflow-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
