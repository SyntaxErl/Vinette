import { useEffect } from "react";
import useTaskStore from "../store/taskStore";
import AnalyticsSkeleton from "../components/AnalyticsSkeleton";
import SummaryCards from "../components/analytics/SummaryCards";
import CompletionTrendChart from "../components/analytics/CompletionTrendChart";
import PriorityChart from "../components/analytics/PriorityChart";
import CategoryDonut from "../components/analytics/CategoryDonut";
import WeeklyPerformance from "../components/analytics/WeeklyPerformance";
import InsightsTrends from "../components/analytics/InsightsTrends";

export default function Analytics() {
  const analyticsStats = useTaskStore((s) => s.analyticsStats);
  const analyticsLoading = useTaskStore((s) => s.analyticsLoading);
  const fetchAnalytics = useTaskStore((s) => s.fetchAnalytics);
  // taskVersion is the cross-view invalidation signal: any task mutation bumps
  // it, which re-runs this effect. analyticsRange changes when the navbar
  // date-range picker is used. fetchAnalytics refetches only when the cached
  // version/range is stale (see taskStore.fetchAnalytics).
  const taskVersion = useTaskStore((s) => s.taskVersion);
  const analyticsRange = useTaskStore((s) => s.analyticsRange);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, taskVersion, analyticsRange]);

  if (analyticsLoading && !analyticsStats) return <AnalyticsSkeleton />;

  const data = analyticsStats?.data;
  if (!data) return <AnalyticsSkeleton />;

  return (
    <div className="max-w-7xl mx-auto w-full px-1 sm:px-6 lg:px-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <SummaryCards
        summary={data.summary}
        completionTrend={data.completionTrend}
        rangeLabel={data.range?.label}
      />

      {/* Trend (full row) · Priority (2/3) · Category (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <CompletionTrendChart trend={data.completionTrend} />
        <PriorityChart byPriority={data.byPriority} />
        <CategoryDonut byCategory={data.byCategory} />
      </div>

      {/* Weekly performance (1/3) · Insights (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <WeeklyPerformance weeklyPerformance={data.weeklyPerformance} />
        <InsightsTrends data={data} className="lg:col-span-2" />
      </div>
    </div>
  );
}
