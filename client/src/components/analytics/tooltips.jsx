// Shared recharts tooltips for the Analytics charts.
import { BRAND } from "./analyticsUtils";

export const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      <p className="text-xs font-bold mt-0.5" style={{ color: BRAND }}>
        {p.rate}% completion rate
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
        {p.completed} of {p.created} created
      </p>
    </div>
  );
};

export const PriorityTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-semibold" style={{ color: p.fill }}>
        {p.label}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{p.count} tasks</p>
    </div>
  );
};

export const CategoryTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg px-3 py-2">
      <p
        className="text-xs font-semibold capitalize"
        style={{ color: payload[0].payload.fill }}
      >
        {payload[0].name}
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{payload[0].value} tasks</p>
    </div>
  );
};
