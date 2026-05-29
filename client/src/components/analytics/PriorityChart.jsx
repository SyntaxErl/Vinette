import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import ChartCard from "./ChartCard";
import {
  getPriorityColor,
  PRIORITY_LABELS,
  capitalize,
  pct,
} from "./analyticsUtils";
import { PriorityTooltip } from "./tooltips";

// Fixed order so the bars don't reshuffle as counts change.
const ORDER = ["high", "medium", "low", "none"];

export default function PriorityChart({ byPriority = [] }) {
  const map = Object.fromEntries(byPriority.map((r) => [r.priority, r.count]));
  const total = byPriority.reduce((s, r) => s + r.count, 0);

  const data = ORDER.filter((p) => (map[p] || 0) > 0).map((p) => ({
    priority: p,
    label: capitalize(p),
    count: map[p] || 0,
    fill: getPriorityColor(p),
  }));

  return (
    <ChartCard
      title="Tasks by Priority"
      subtitle="Where your workload sits"
      isEmpty={total === 0}
      emptyIcon="flag"
      emptyText="No tasks yet"
      className="lg:col-span-2"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-full sm:flex-1 min-w-0">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barSize={40} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<PriorityTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((d) => (
                  <Cell key={d.priority} fill={d.fill} />
                ))}
                <LabelList dataKey="count" position="top" style={{ fontSize: 12, fill: "#374151", fontWeight: 700 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown legend */}
        <div className="w-full sm:w-44 flex-shrink-0 space-y-3">
          {ORDER.filter((p) => (map[p] || 0) > 0 || p !== "none").map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getPriorityColor(p) }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{PRIORITY_LABELS[p]}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                <span className="font-semibold text-gray-800">{map[p] || 0}</span> ({pct(map[p] || 0, total)}%)
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-xs font-medium text-gray-500">Total</span>
            <span className="text-sm font-bold text-gray-900">{total}</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
