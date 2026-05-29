import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import ChartCard from "./ChartCard";
import { BRAND } from "./analyticsUtils";
import { TrendTooltip } from "./tooltips";

// "Completion Rate Over Time" — weekly completion-rate line/area chart.
export default function CompletionTrendChart({ trend = [] }) {
  const hasData = trend.some((d) => d.created > 0 || d.completed > 0);

  return (
    <ChartCard
      title="Completion Rate Over Time"
      subtitle="Weekly completion rate (completed vs created)"
      isEmpty={!hasData}
      emptyIcon="show_chart"
      emptyText="No completed tasks in the last 5 weeks"
      className="lg:col-span-3"
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={trend} margin={{ top: 20, right: 16, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.25} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: "#e5e7eb" }} />
          <Area
            type="monotone"
            dataKey="rate"
            stroke={BRAND}
            strokeWidth={2.5}
            fill="url(#trendFill)"
            dot={{ r: 4, fill: BRAND, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          >
            <LabelList
              dataKey="rate"
              position="top"
              formatter={(v) => `${v}%`}
              style={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
