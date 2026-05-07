import { useEffect } from "react";
import DashboardSkeleton from "../components/DashboardSkeleton";
import useTaskStore from "../store/taskStore";

export default function Dashboard() {
  const { dashboardStats, dashboardLoading, fetchDashboardStats } =
    useTaskStore();

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const stats = dashboardStats?.stats;

  if (dashboardLoading) return <DashboardSkeleton />;

  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  const pending = stats?.pending || 0;
  const overdue = stats?.overdue || 0;

  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="p-6" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 animate-fadeInUp">

        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {total}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                All tasks across categories
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-violet-100">
              <span className="material-icons text-violet-600 text-[22px]">
                assignment
              </span>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {completed}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {completionRate}% completion rate
              </p>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div
                  className="h-1.5 rounded-full transition-all duration-500 bg-green-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div className="w-12 h-12 rounded-xl flex items-center justify-center ml-4 bg-green-100">
              <span className="material-icons text-green-500 text-[22px]">
                check_circle
              </span>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {pending}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Todo or In Progress
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-100">
              <span className="material-icons text-yellow-500 text-[22px]">
                schedule
              </span>
            </div>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Overdue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overdue}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tasks past due date
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100">
              <span className="material-icons text-red-500 text-[22px]">
                warning
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}