import { useEffect, useState } from "react";
import DashboardSkeleton from "../components/DashboardSkeleton";
import useTaskStore from "../store/taskStore";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { dashboardStats, dashboardLoading, fetchDashboardStats } =
    useTaskStore();

  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const stats = dashboardStats?.stats;

  if (dashboardLoading) return <DashboardSkeleton />;

  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  const pending = stats?.pending || 0;
  const overdue = stats?.overdue || 0;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getCategoryColor = (category) => {
    const colors = {
      work: "#5b4fcf",
      personal: "#22c55e",
      school: "#3b82f6",
      fitness: "#ec4899",
      others: "#9ca3af",
    };
    return colors[category] || "#9ca3af";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "#ef4444",
      medium: "#f97316",
      low: "#22c55e",
      none: "#9ca3af",
    };
    return colors[priority] || "#9ca3af";
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: "#9ca3af",
      in_progress: "#3b82f6",
      done: "#22c55e",
    };
    return colors[status] || "#9ca3af";
  };

  const getStatusLabel = (status) => {
    const labels = {
      todo: "Todo",
      in_progress: "In Progress",
      done: "Done",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (dueDate, status) => {
    if (status === "done") return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks =
    dashboardStats?.recentTasks?.filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (priorityFilter && task.priority !== priorityFilter) return false;
      return true;
    }) || [];
  return (
    <div className="max-w-7xl mx-auto w-full px-1 sm:px-6 lg:px-8" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 animate-fadeInUp">
        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
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
              <p className="text-3xl font-bold text-gray-900 mt-1">{pending}</p>
              <p className="text-xs text-gray-400 mt-1">Todo or In Progress</p>
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
              <p className="text-3xl font-bold text-gray-900 mt-1">{overdue}</p>
              <p className="text-xs text-gray-400 mt-1">Tasks past due date</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100">
              <span className="material-icons text-red-500 text-[22px]">
                warning
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks + Category Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeInUp">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-2 flex-wrap">
            <h2 className="font-bold text-gray-900">Recent Tasks</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none bg-white"
              >
                <option value="">All Status</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none bg-white"
              >
                <option value="">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <button
                onClick={() => navigate("/tasks")}
                className="text-xs font-medium hover:underline"
                style={{ color: "#5b4fcf" }}
              >
                View All
              </button>
            </div>
          </div>

          {/* Task list */}
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span
                className="material-icons text-gray-200 mb-2"
                style={{ fontSize: "40px" }}
              >
                assignment
              </span>
              <p className="text-sm font-medium text-gray-400">No tasks yet</p>
              <p className="text-xs text-gray-300 mt-1">
                Create your first task to get started
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid items-center px-5 py-3 hover:bg-gray-50 transition gap-3
              [grid-template-columns:12px_1fr_90px]
              sm:[grid-template-columns:12px_1fr_120px_90px]
              lg:[grid-template-columns:12px_1fr_90px_80px_130px_100px]"
                  >
                    {/* Category dot — always visible */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: getCategoryColor(task.category),
                      }}
                    />

                    {/* Title — always visible */}
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm text-gray-700 font-medium truncate">
                        {task.title}
                      </p>
                      {/* Category + priority shown below title on tablet and below */}
                      <div className="flex items-center gap-1.5 mt-0.5 lg:hidden">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${getCategoryColor(task.category)}15`,
                            color: getCategoryColor(task.category),
                          }}
                        >
                          {task.category}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${getPriorityColor(task.priority)}15`,
                            color: getPriorityColor(task.priority),
                          }}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>

                    {/* Category badge — hidden on tablet and below, shows lg+ */}
                    <div className="hidden lg:flex justify-center">
                      <span
                        className="text-xs px-3 py-0.5 rounded-full font-medium w-20 text-center"
                        style={{
                          backgroundColor: `${getCategoryColor(task.category)}15`,
                          color: getCategoryColor(task.category),
                        }}
                      >
                        {task.category}
                      </span>
                    </div>

                    {/* Priority badge — hidden on tablet and below, shows lg+ */}
                    <div className="hidden lg:flex justify-center">
                      <span
                        className="text-xs px-3 py-0.5 rounded-full font-medium w-16 text-center"
                        style={{
                          backgroundColor: `${getPriorityColor(task.priority)}15`,
                          color: getPriorityColor(task.priority),
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* Due date — hidden on mobile, shows sm+ */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      {task.due_date ? (
                        <>
                          <span
                            className="material-icons"
                            style={{
                              fontSize: "14px",
                              color: isOverdue(task.due_date, task.status)
                                ? "#ef4444"
                                : "#9ca3af",
                            }}
                          >
                            calendar_today
                          </span>
                          <span
                            className="text-xs whitespace-nowrap"
                            style={{
                              color: isOverdue(task.due_date, task.status)
                                ? "#ef4444"
                                : "#9ca3af",
                            }}
                          >
                            {formatDate(task.due_date)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>

                    {/* Status badge — always visible */}
                    <div className="flex justify-end lg:justify-center">
                      <span
                        className="text-xs px-3 py-0.5 rounded-full font-medium w-24 text-center whitespace-nowrap"
                        style={{
                          backgroundColor: `${getStatusColor(task.status)}15`,
                          color: getStatusColor(task.status),
                        }}
                      >
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100">
                <button
                  onClick={() => navigate("/tasks")}
                  className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  style={{ color: "#5b4fcf" }}
                >
                  View all tasks
                  <span className="material-icons" style={{ fontSize: "16px" }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tasks by Category — placeholder for now */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fadeInUp">
          <h2 className="font-bold text-gray-900 mb-4">Tasks by Category</h2>
          <p className="text-sm text-gray-400">Chart coming next!</p>
        </div>
      </div>
    </div>
  );
}
