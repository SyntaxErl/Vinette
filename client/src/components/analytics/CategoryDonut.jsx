import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartCard from "./ChartCard";
import { getCategoryColor, capitalize, pct } from "./analyticsUtils";
import { CategoryTooltip } from "./tooltips";

export default function CategoryDonut({ byCategory = [] }) {
  const total = byCategory.reduce((s, r) => s + r.count, 0);
  const data = [...byCategory]
    .sort((a, b) => b.count - a.count)
    .map((r) => ({
      name: capitalize(r.category),
      category: r.category,
      value: r.count,
      fill: getCategoryColor(r.category),
    }));

  return (
    <ChartCard
      title="Tasks by Category"
      subtitle="Distribution across categories"
      isEmpty={total === 0}
      emptyIcon="donut_large"
      emptyText="No tasks yet"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex-shrink-0" style={{ width: 150, height: 150 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry) => (
                  <Cell key={entry.category} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CategoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold text-gray-900 leading-none">{total}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total</p>
          </div>
        </div>

        <div className="w-full space-y-2.5">
          {data.map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
              <span className="text-xs text-gray-600 flex-1 truncate">{item.name}</span>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                <span className="font-semibold text-gray-800">{item.value}</span> ({pct(item.value, total)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
