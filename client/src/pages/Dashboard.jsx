import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import DashboardSkeleton from "../components/DashboardSkeleton";
import useTaskStore from "../store/taskStore";

const CATEGORY_COLORS = {
  work: "#5b4fcf",
  personal: "#22c55e",
  school: "#3b82f6",
  fitness: "#ec4899",
  others: "#9ca3af",
};
const PRIORITY_COLORS = {
  high: "#ef4444",
  medium: "#f97316",
  low: "#22c55e",
  none: "#9ca3af",
};
const STATUS_COLORS = {
  todo: "#9ca3af",
  in_progress: "#3b82f6",
  done: "#22c55e",
};
const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getCategoryColor = (c) => CATEGORY_COLORS[c] || "#9ca3af";
const getPriorityColor = (p) => PRIORITY_COLORS[p] || "#9ca3af";
const getStatusColor = (s) => STATUS_COLORS[s] || "#9ca3af";
const getStatusLabel = (s) =>
  ({ todo: "Todo", in_progress: "In Progress", done: "Done" })[s] || s;
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
const isOverdue = (dueDate, status) =>
  status !== "done" && new Date(dueDate) < new Date();

const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      <p className="text-xs text-purple-600 font-bold mt-0.5">
        {payload[0].value} tasks
      </p>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2">
      <p
        className="text-xs font-semibold capitalize"
        style={{ color: payload[0].payload.fill }}
      >
        {payload[0].name}
      </p>
      <p className="text-xs text-gray-600 mt-0.5">{payload[0].value} tasks</p>
    </div>
  );
};

export default function Dashboard() {
  const { dashboardStats, dashboardLoading, fetchDashboardStats } =
    useTaskStore();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);
  if (dashboardLoading) return <DashboardSkeleton />;

  const stats = dashboardStats?.stats;
  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  const pending = stats?.pending || 0;
  const overdue = stats?.overdue || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categoryData = (dashboardStats?.byCategory || []).map((item) => ({
    name: item.category?.charAt(0).toUpperCase() + item.category?.slice(1),
    value: item.count,
    fill: getCategoryColor(item.category),
  }));

  const activityMap = Object.fromEntries(
    (dashboardStats?.weeklyActivity || []).map((d) => [d.day, d.count]),
  );
  const weeklyData = ALL_DAYS.map((day) => ({
    day: day.slice(0, 3),
    tasks: activityMap[day] || 0,
  }));

  const filteredTasks = (dashboardStats?.recentTasks || []).filter((task) => {
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });

  const thisWeek = weeklyData.reduce((s, d) => s + d.tasks, 0);
  const lastWeek = dashboardStats?.lastWeekTotal || 0;
  const diff = thisWeek - lastWeek;
  const pct =
    lastWeek > 0 ? Math.abs(Math.round((diff / lastWeek) * 100)) : null;
  const isUp = diff >= 0;
  const best = weeklyData.reduce(
    (a, b) => (b.tasks > a.tasks ? b : a),
    weeklyData[0],
  );

  return (
    <div
      className="max-w-7xl mx-auto w-full px-1 sm:px-6 lg:px-8"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 animate-fadeInUp">
        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 shadow-sm">
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

        <div className="bg-green-50 rounded-2xl p-5 border border-green-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {completed}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {completionRate}% completion rate
              </p>
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

        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100 shadow-sm">
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

        <div className="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm">
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

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Tasks — row 1, left 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeInUp">
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
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: getCategoryColor(task.category),
                      }}
                    />
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm text-gray-700 font-medium truncate">
                        {task.title}
                      </p>
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
              <div className="px-5 py-3 border-t border-gray-100">
                <button
                  onClick={() => navigate("/tasks")}
                  className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  style={{ color: "#5b4fcf" }}
                >
                  View all tasks{" "}
                  <span className="material-icons" style={{ fontSize: "16px" }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Donut Chart — row 1, right 1/3 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fadeInUp">
          <h2 className="font-bold text-gray-900 mb-1">Tasks by Category</h2>
          <p className="text-xs text-gray-400 mb-4">
            Distribution across all categories
          </p>

          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <span
                className="material-icons text-gray-200 mb-2"
                style={{ fontSize: "36px" }}
              >
                donut_large
              </span>
              <p className="text-sm text-gray-400">No data yet</p>
            </div>
          ) : (
            /* FIX: flex-col on mobile, flex-row on sm+ so chart + legend never get squeezed */
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative flex-shrink-0"
                style={{ width: 140, height: 140 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-gray-900 leading-none">
                    {total}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Total</p>
                </div>
              </div>

              <div className="w-full space-y-2.5">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-xs text-gray-600 capitalize flex-1 truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">
                        {item.value}
                      </span>{" "}
                      ({total > 0 ? Math.round((item.value / total) * 100) : 0}
                      %)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 mt-4 pt-3">
            <button
              onClick={() => navigate("/analytics")}
              className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              style={{ color: "#5b4fcf" }}
            >
              View full breakdown{" "}
              <span className="material-icons" style={{ fontSize: "16px" }}>
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Weekly Activity — row 2, spans all 3 columns */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fadeInUp">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Bar Chart — flex-[2] ≈ 2/3 width */}
            <div className="flex-[2] min-w-0">
              <div className="mb-4">
                <h2 className="font-bold text-gray-900">Weekly Activity</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tasks created in the last 7 days
                </p>
              </div>
              {weeklyData.every((d) => d.tasks === 0) ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <span
                    className="material-icons text-gray-200 mb-2"
                    style={{ fontSize: "36px" }}
                  >
                    bar_chart
                  </span>
                  <p className="text-sm text-gray-400">
                    No activity in the last 7 days
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={weeklyData}
                    barSize={32}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f3f4f6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={<BarTooltip />}
                      cursor={{ fill: "#f5f3ff" }}
                    />
                    <Bar dataKey="tasks" fill="#5b4fcf" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Stats Panel — flex-[1] ≈ 1/3 width */}
            <div className="flex-[1] lg:border-l lg:border-gray-100 lg:pl-5 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                  <p className="text-xs text-gray-400 font-medium leading-tight">
                    This Week
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {thisWeek}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                    Tasks Completed
                  </p>
                </div>
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium leading-tight">
                    Best Day
                  </p>
                  {best.tasks > 0 ? (
                    <>
                      <p className="text-lg font-bold text-gray-900 mt-1 leading-tight">
                        {best.day}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {best.tasks} tasks
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">—</p>
                  )}
                </div>
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-xs text-gray-400 font-medium leading-tight">
                    Avg. per Day
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(thisWeek / 7)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Tasks</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-lg"
                  style={{ backgroundColor: isUp ? "#f0fdf4" : "#fef2f2" }}
                >
                  <span
                    className="material-icons"
                    style={{
                      fontSize: "15px",
                      color: isUp ? "#22c55e" : "#ef4444",
                    }}
                  >
                    {isUp ? "arrow_upward" : "arrow_downward"}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: isUp ? "#22c55e" : "#ef4444" }}
                  >
                    {pct !== null ? `${pct}%` : "—"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  vs last week ({lastWeek} tasks)
                </p>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <button
                  onClick={() => navigate("/analytics")}
                  className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  style={{ color: "#5b4fcf" }}
                >
                  View full analytics{" "}
                  <span className="material-icons" style={{ fontSize: "16px" }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
