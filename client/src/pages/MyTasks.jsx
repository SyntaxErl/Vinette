import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { getTasks, bulkAction as bulkActionService, updateTask, deleteTask } from "../services/taskService";
import useTaskStore from "../store/taskStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCategoryColor = (category) => {
  const colors = {
    work:     { bg: "#ede9fe", text: "#5b4fcf" },
    personal: { bg: "#dcfce7", text: "#16a34a" },
    school:   { bg: "#dbeafe", text: "#2563eb" },
    fitness:  { bg: "#fce7f3", text: "#db2777" },
    others:   { bg: "#f3f4f6", text: "#6b7280" },
  };
  return colors[category] || colors.others;
};

const getPriorityColor = (priority) => {
  const colors = {
    high:   { bg: "#fee2e2", text: "#ef4444", dot: "#ef4444" },
    medium: { bg: "#fff7ed", text: "#f97316", dot: "#f97316" },
    low:    { bg: "#f0fdf4", text: "#22c55e", dot: "#22c55e" },
    none:   { bg: "#f3f4f6", text: "#9ca3af", dot: "#9ca3af" },
  };
  return colors[priority] || colors.none;
};

const getStatusStyle = (status) => {
  const styles = {
    todo:        { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
    in_progress: { bg: "#eff6ff", text: "#3b82f6", border: "#bfdbfe" },
    done:        { bg: "#f0fdf4", text: "#22c55e", border: "#bbf7d0" },
  };
  return styles[status] || styles.todo;
};

const getStatusLabel = (status) =>
  ({ todo: "Todo", in_progress: "In Progress", done: "Done" }[status] || status);

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const getDaysLeft = (dueDate, status) => {
  if (!dueDate) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate); due.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (status === "done") return null;
  if (diff < 0)   return { label: "Overdue",     color: "#ef4444" };
  if (diff === 0) return { label: "Due today",   color: "#f97316" };
  if (diff === 1) return { label: "1 day left",  color: "#f97316" };
  return { label: `${diff} days left`, color: "#6b7280" };
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyTasks() {
  const navigate = useNavigate();
  const taskVersion         = useTaskStore((s) => s.taskVersion);
  const clearDashboardStats = useTaskStore((s) => s.clearDashboardStats);

  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total,   setTotal]   = useState(0);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [sort,     setSort]     = useState("due_date");
  const [page,     setPage]     = useState(1);
  const [perPage]               = useState(10);
  const [selected, setSelected] = useState([]);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPos,    setDropdownPos]    = useState({ top: 0, right: 0 });
  const dropdownRef = useRef(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen,   setSortOpen]   = useState(false);
  const [filterPos,  setFilterPos]  = useState({ top: 0, left: 0 });
  const [sortPos,    setSortPos]    = useState({ top: 0, left: 0 });
  const filterRef     = useRef(null);
  const sortRef       = useRef(null);
  const filterBtnRef  = useRef(null);
  const sortBtnRef    = useRef(null);

  const calcPopoverPos = (btnRef, popoverWidth) => {
    const rect = btnRef.current.getBoundingClientRect();
    const spaceRight  = window.innerWidth - rect.left;
    const spaceBottom = window.innerHeight - rect.bottom;
    const left = spaceRight < popoverWidth ? rect.right - popoverWidth : rect.left;
    const top  = spaceBottom < 300 ? rect.top - 12 : rect.bottom + 8; // flip up if not enough below
    return { top, left };
  };

  // Close dropdown on outside click / scroll
  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenDropdownId(null);
      if (filterRef.current && !filterRef.current.contains(e.target) &&
          filterBtnRef.current && !filterBtnRef.current.contains(e.target))
        setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target) &&
          sortBtnRef.current && !sortBtnRef.current.contains(e.target))
        setSortOpen(false);
    };
    const closeOnScroll = () => { setOpenDropdownId(null); };
    document.addEventListener("mousedown", closeDropdown);
    document.addEventListener("scroll", closeOnScroll, true);
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
      document.removeEventListener("scroll", closeOnScroll, true);
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (search)   params.search   = search;
      if (status)   params.status   = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;
      if (sort)     params.sort     = sort;
      const res = await getTasks(params);
      setTasks(res.data.tasks || []);
      setTotal(res.data.total || res.data.tasks?.length || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, category, sort, page, perPage, taskVersion]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { setPage(1); setSelected([]); }, [search, status, priority, category, sort]);

  const allSelected  = tasks.length > 0 && selected.length === tasks.length;
  const someSelected = selected.length > 0;
  const totalPages   = Math.ceil(total / perPage);
  const toggleAll    = () => setSelected(allSelected ? [] : tasks.map((t) => t.id));
  const toggleOne    = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const bulkAction = async (action, extra = {}) => {
    try {
      await bulkActionService(selected, action, extra);
      clearDashboardStats();
      setSelected([]);
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setOpenDropdownId(null);
    try { await updateTask(taskId, { status: newStatus }); clearDashboardStats(); fetchTasks(); }
    catch (err) { console.error(err); }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    setOpenDropdownId(null);
    try { await updateTask(taskId, { priority: newPriority === "none" ? null : newPriority }); clearDashboardStats(); fetchTasks(); }
    catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    setOpenDropdownId(null);
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try { await deleteTask(taskId); clearDashboardStats(); fetchTasks(); }
    catch (err) { console.error(err); }
  };

  const openDropdown = (e, taskId) => {
    e.stopPropagation();
    if (openDropdownId === taskId) { setOpenDropdownId(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const dropdownHeight = 300;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < dropdownHeight ? rect.top - dropdownHeight - 4 : rect.bottom + 4;
    setDropdownPos({ top, right: window.innerWidth - rect.right });
    setOpenDropdownId(taskId);
  };

  const clearFilters = () => {
    setSearch(""); setStatus(""); setPriority(""); setCategory(""); setSort("due_date"); setPage(1); setSelected([]);
  };

  // ── Dropdown Portal ────────────────────────────────────────────────────────
  const DropdownMenu = ({ task }) => {
    const STATUS_OPTIONS = [
      { value: "todo",        label: "Todo",        icon: "radio_button_unchecked", color: "#6b7280" },
      { value: "in_progress", label: "In Progress", icon: "pending",                color: "#f59e0b" },
      { value: "done",        label: "Done",         icon: "check_circle",           color: "#22c55e" },
    ];
    const PRIORITY_OPTIONS = [
      { value: "high",   label: "High",   color: "#ef4444" },
      { value: "medium", label: "Medium", color: "#f97316" },
      { value: "low",    label: "Low",    color: "#22c55e" },
      { value: "none",   label: "None",   color: "#9ca3af" },
    ];
    return createPortal(
      <div ref={dropdownRef}
        className="fixed z-[999] bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
        style={{ top: dropdownPos.top, right: dropdownPos.right, minWidth: "190px" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Status */}
        <div className="px-3 pt-2.5 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Change Status</p>
          {STATUS_OPTIONS.filter((s) => s.value !== task.status).map((s) => (
            <button key={s.value} onClick={() => handleStatusChange(task.id, s.value)}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition text-left">
              <span className="material-icons" style={{ fontSize: "15px", color: s.color }}>{s.icon}</span>
              <span className="text-sm text-gray-700">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Priority */}
        <div className="border-t border-gray-100 px-3 pt-2 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Change Priority</p>
          {PRIORITY_OPTIONS.map((p) => {
            const isCurrent = (task.priority || "none") === p.value;
            return (
              <button key={p.value} onClick={() => handlePriorityChange(task.id, p.value)}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition text-left">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-sm flex-1" style={{ color: isCurrent ? p.color : "#374151", fontWeight: isCurrent ? 600 : 400 }}>
                  {p.label}
                </span>
                {isCurrent && <span className="material-icons" style={{ fontSize: "14px", color: p.color }}>check</span>}
              </button>
            );
          })}
        </div>

        {/* Delete */}
        <div className="border-t border-gray-100 px-3 py-1.5">
          <button onClick={() => handleDeleteTask(task.id)}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-red-50 transition text-left">
            <span className="material-icons" style={{ fontSize: "15px", color: "#ef4444" }}>delete_outline</span>
            <span className="text-sm text-red-500">Delete Task</span>
          </button>
        </div>
      </div>,
      document.body
    );
  };

  // ── Pagination component ───────────────────────────────────────────────────
  const Pagination = ({ compact = false }) => (
    <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3 ${compact ? "" : "border-t border-gray-100"}`}>
      <p className="text-sm text-gray-500">
        Showing {tasks.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of {total} tasks
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <span className="material-icons" style={{ fontSize: "16px" }}>chevron_left</span>
        </button>
        {compact ? (
          <span className="w-8 h-8 rounded-lg text-sm font-medium border flex items-center justify-center"
            style={{ backgroundColor: "#5b4fcf", color: "white", borderColor: "#5b4fcf" }}>{page}</span>
        ) : (
          <>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-sm font-medium border transition"
                style={{ backgroundColor: page === p ? "#5b4fcf" : "white", color: page === p ? "white" : "#6b7280", borderColor: page === p ? "#5b4fcf" : "#e5e7eb" }}>
                {p}
              </button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="text-gray-400 px-1">...</span>
                <button onClick={() => setPage(totalPages)}
                  className="w-8 h-8 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                  {totalPages}
                </button>
              </>
            )}
          </>
        )}
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <span className="material-icons" style={{ fontSize: "16px" }}>chevron_right</span>
        </button>
        {!compact && (
          <select className="ml-2 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-600 bg-white outline-none" disabled>
            <option>10 / page</option>
          </select>
        )}
      </div>
    </div>
  );

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto w-full space-y-4 px-1 sm:px-6 py-4">

        {/* ── Toolbar ── */}
        {(() => {
          const activeFilterCount = [status, priority, category].filter(Boolean).length;
          const SORT_OPTIONS = [
            { value: "due_date",      label: "Due Date",  sub: "Earliest first", icon: "arrow_upward" },
            { value: "due_date_desc", label: "Due Date",  sub: "Latest first",   icon: "arrow_downward" },
            { value: "created_at",    label: "Created On", sub: "Newest first",   icon: "schedule" },
            { value: "priority",      label: "Priority",  sub: "High to low",    icon: "flag" },
          ];
          const currentSort = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0];

          const STATUS_CHIPS = [
            { value: "todo",        label: "Todo",        icon: "radio_button_unchecked", color: "#6b7280", bg: "#f9fafb" },
            { value: "in_progress", label: "In Progress", icon: "pending",                color: "#3b82f6", bg: "#eff6ff" },
            { value: "done",        label: "Done",        icon: "check_circle",           color: "#22c55e", bg: "#f0fdf4" },
          ];
          const PRIORITY_CHIPS = [
            { value: "high",   label: "High",   dot: "#ef4444", bg: "#fee2e2", text: "#ef4444" },
            { value: "medium", label: "Medium", dot: "#f97316", bg: "#fff7ed", text: "#f97316" },
            { value: "low",    label: "Low",    dot: "#22c55e", bg: "#f0fdf4", text: "#22c55e" },
          ];
          const CATEGORY_CHIPS = [
            { value: "work",     label: "💼 Work",     bg: "#ede9fe", text: "#5b4fcf" },
            { value: "personal", label: "🙋 Personal", bg: "#dcfce7", text: "#16a34a" },
            { value: "school",   label: "📚 School",   bg: "#dbeafe", text: "#2563eb" },
            { value: "fitness",  label: "💪 Fitness",  bg: "#fce7f3", text: "#db2777" },
            { value: "others",   label: "📌 Others",   bg: "#f3f4f6", text: "#6b7280" },
          ];

          return (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex items-center gap-2 flex-wrap">

                {/* Search */}
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 flex-1 min-w-[180px]"
                  style={{ maxWidth: "320px" }}>
                  <span className="material-icons text-gray-400" style={{ fontSize: "16px" }}>search</span>
                  <input type="text" placeholder="Search tasks..." value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent" />
                  {search && (
                    <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 transition">
                      <span className="material-icons" style={{ fontSize: "14px" }}>close</span>
                    </button>
                  )}
                </div>

                {/* Filter Button */}
                <div className="relative" ref={filterRef}>
                  <button
                    ref={filterBtnRef}
                    onClick={() => {
                      if (!filterOpen) setFilterPos(calcPopoverPos(filterBtnRef, 320));
                      setFilterOpen((p) => !p);
                      setSortOpen(false);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition"
                    style={{
                      borderColor: activeFilterCount > 0 ? "#5b4fcf" : "#e5e7eb",
                      backgroundColor: activeFilterCount > 0 ? "#f5f3ff" : "white",
                      color: activeFilterCount > 0 ? "#5b4fcf" : "#374151",
                    }}
                  >
                    <span className="material-icons" style={{ fontSize: "16px" }}>tune</span>
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: "#5b4fcf" }}>
                        {activeFilterCount}
                      </span>
                    )}
                    <span className="material-icons text-gray-400" style={{ fontSize: "16px" }}>
                      {filterOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                    </span>
                  </button>

                  {/* Filter Panel — portal so it never clips */}
                  {filterOpen && createPortal(
                    <div
                      className="fixed z-[998] bg-white rounded-2xl border border-gray-100 shadow-2xl p-5 w-80"
                      style={{ top: filterPos.top, left: filterPos.left, animation: "fadeInDown 0.15s ease" }}
                      ref={filterRef}
                    >

                      {/* Status */}
                      <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_CHIPS.map((s) => {
                            const isActive = status === s.value;
                            return (
                              <button key={s.value}
                                onClick={() => setStatus(isActive ? "" : s.value)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition"
                                style={{
                                  backgroundColor: isActive ? s.bg : "white",
                                  color: isActive ? s.color : "#6b7280",
                                  borderColor: isActive ? s.color : "#e5e7eb",
                                }}>
                                <span className="material-icons" style={{ fontSize: "14px", color: isActive ? s.color : "#9ca3af" }}>{s.icon}</span>
                                {s.label}
                                {isActive && <span className="material-icons" style={{ fontSize: "12px" }}>close</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Priority */}
                      <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Priority</p>
                        <div className="flex flex-wrap gap-2">
                          {PRIORITY_CHIPS.map((p) => {
                            const isActive = priority === p.value;
                            return (
                              <button key={p.value}
                                onClick={() => setPriority(isActive ? "" : p.value)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition"
                                style={{
                                  backgroundColor: isActive ? p.bg : "white",
                                  color: isActive ? p.text : "#6b7280",
                                  borderColor: isActive ? p.dot : "#e5e7eb",
                                }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.dot }} />
                                {p.label}
                                {isActive && <span className="material-icons" style={{ fontSize: "12px" }}>close</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2.5">Category</p>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORY_CHIPS.map((c) => {
                            const isActive = category === c.value;
                            return (
                              <button key={c.value}
                                onClick={() => setCategory(isActive ? "" : c.value)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition"
                                style={{
                                  backgroundColor: isActive ? c.bg : "white",
                                  color: isActive ? c.text : "#6b7280",
                                  borderColor: isActive ? c.text : "#e5e7eb",
                                }}>
                                {c.label}
                                {isActive && <span className="material-icons" style={{ fontSize: "12px" }}>close</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer */}
                      {activeFilterCount > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <button
                            onClick={() => { setStatus(""); setPriority(""); setCategory(""); setFilterOpen(false); }}
                            className="w-full py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 border border-red-100 transition">
                            Clear all filters
                          </button>
                        </div>
                      )}
                    </div>,
                    document.body
                  )}
                </div>

                {/* Sort Button */}
                <div className="relative" ref={sortRef}>
                  <button
                    ref={sortBtnRef}
                    onClick={() => {
                      if (!sortOpen) setSortPos(calcPopoverPos(sortBtnRef, 256));
                      setSortOpen((p) => !p);
                      setFilterOpen(false);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white"
                  >
                    <span className="material-icons" style={{ fontSize: "16px", color: "#5b4fcf" }}>swap_vert</span>
                    <span className="hidden sm:inline">{currentSort.label}:</span>
                    <span className="text-gray-500 hidden sm:inline">{currentSort.sub}</span>
                    <span className="material-icons text-gray-400" style={{ fontSize: "16px" }}>
                      {sortOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                    </span>
                  </button>

                  {/* Sort Panel — portal so it never clips */}
                  {sortOpen && createPortal(
                    <div
                      className="fixed z-[998] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden w-64"
                      style={{ top: sortPos.top, left: sortPos.left, animation: "fadeInDown 0.15s ease" }}
                      ref={sortRef}
                    >
                      {SORT_OPTIONS.map((o) => {
                        const isActive = sort === o.value;
                        return (
                          <button key={o.value}
                            onClick={() => { setSort(o.value); setSortOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0"
                            style={{ backgroundColor: isActive ? "#f5f3ff" : "white" }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: isActive ? "#ede9fe" : "#f9fafb" }}>
                              <span className="material-icons" style={{ fontSize: "16px", color: isActive ? "#5b4fcf" : "#9ca3af" }}>{o.icon}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold" style={{ color: isActive ? "#5b4fcf" : "#374151" }}>{o.label}</p>
                              <p className="text-xs text-gray-400">{o.sub}</p>
                            </div>
                            {isActive && (
                              <span className="material-icons ml-auto flex-shrink-0" style={{ fontSize: "16px", color: "#5b4fcf" }}>check</span>
                            )}
                          </button>
                        );
                      })}
                    </div>,
                    document.body
                  )}
                </div>

                {/* Clear All — only visible when something is active */}
                {(search || activeFilterCount > 0) && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-100 transition">
                    <span className="material-icons" style={{ fontSize: "15px" }}>close</span>
                    Clear All
                  </button>
                )}

                {/* Active filter pills — quick remove */}
                {activeFilterCount > 0 && (
                  <div className="flex flex-wrap gap-1.5 w-full mt-1">
                    {status && (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border"
                        style={{ backgroundColor: "#eff6ff", color: "#3b82f6", borderColor: "#bfdbfe" }}>
                        {getStatusLabel(status)}
                        <button onClick={() => setStatus("")} className="hover:opacity-70 transition">
                          <span className="material-icons" style={{ fontSize: "12px" }}>close</span>
                        </button>
                      </span>
                    )}
                    {priority && (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border"
                        style={{ backgroundColor: getPriorityColor(priority).bg, color: getPriorityColor(priority).text, borderColor: getPriorityColor(priority).dot + "60" }}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                        <button onClick={() => setPriority("")} className="hover:opacity-70 transition">
                          <span className="material-icons" style={{ fontSize: "12px" }}>close</span>
                        </button>
                      </span>
                    )}
                    {category && (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border"
                        style={{ backgroundColor: getCategoryColor(category).bg, color: getCategoryColor(category).text, borderColor: getCategoryColor(category).text + "40" }}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                        <button onClick={() => setCategory("")} className="hover:opacity-70 transition">
                          <span className="material-icons" style={{ fontSize: "12px" }}>close</span>
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Bulk Action Bar */}
        {someSelected && (
          <div className="px-4 py-3 bg-purple-50 border border-purple-100 rounded-2xl">

            {/* Desktop (820px+): single row */}
            <div className="hidden min-[830px]:flex items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold text-white"
                  style={{ backgroundColor: "#5b4fcf" }}>
                  {selected.length}
                </span>
                <span className="text-sm font-medium text-purple-700 whitespace-nowrap">
                  task{selected.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="w-px h-5 bg-purple-200 flex-shrink-0" />
              <button onClick={() => bulkAction("done")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-green-50 bg-white whitespace-nowrap flex-shrink-0"
                style={{ borderColor: "#22c55e", color: "#22c55e" }}>
                <span className="material-icons" style={{ fontSize: "15px" }}>check_circle</span>
                Mark as Done
              </button>
              <button onClick={() => bulkAction("delete")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-red-50 bg-white whitespace-nowrap flex-shrink-0"
                style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                <span className="material-icons" style={{ fontSize: "15px" }}>delete_outline</span>
                Delete
              </button>
              <button onClick={() => setSelected([])}
                className="flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-700 transition ml-auto flex-shrink-0 whitespace-nowrap">
                <span className="material-icons" style={{ fontSize: "15px" }}>close</span>
                Clear
              </button>
            </div>

            {/* Mobile + iPad (below 820px): two rows */}
            <div className="min-[830px]:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: "#5b4fcf" }}>
                    {selected.length}
                  </span>
                  <span className="text-sm font-medium text-purple-700">
                    task{selected.length > 1 ? "s" : ""} selected
                  </span>
                </div>
                <button onClick={() => setSelected([])}
                  className="flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-700 transition">
                  <span className="material-icons" style={{ fontSize: "15px" }}>close</span>
                  Clear
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <button onClick={() => bulkAction("done")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-green-50 bg-white"
                  style={{ borderColor: "#22c55e", color: "#22c55e" }}>
                  <span className="material-icons" style={{ fontSize: "15px" }}>check_circle</span>
                  Mark as Done
                </button>
                <button onClick={() => bulkAction("delete")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition hover:bg-red-50 bg-white"
                  style={{ borderColor: "#ef4444", color: "#ef4444" }}>
                  <span className="material-icons" style={{ fontSize: "15px" }}>delete_outline</span>
                  Delete
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── CARD VIEW — mobile + tablet + small desktop (below xl / 1280px) ── */}
        <div className="min-[1400px]:hidden space-y-3">

          {/* Select All bar */}
          {tasks.length > 0 && !loading && (
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-2.5 flex items-center gap-3">
              <input type="checkbox" checked={allSelected} onChange={toggleAll}
                className="w-4 h-4 rounded accent-purple-600 cursor-pointer" />
              <span className="text-sm text-gray-600">
                {allSelected ? "Deselect all" : `Select all ${tasks.length} tasks`}
              </span>
              {someSelected && (
                <span className="ml-auto text-xs font-medium text-purple-600">
                  {selected.length} selected
                </span>
              )}
            </div>
          )}

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
              <span className="material-icons animate-spin text-purple-400" style={{ fontSize: "32px" }}>autorenew</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 text-center">
              <span className="material-icons text-gray-200 mb-3" style={{ fontSize: "48px" }}>assignment</span>
              <p className="text-sm font-medium text-gray-400">No tasks found</p>
              <p className="text-xs text-gray-300 mt-1">Try adjusting your filters or create a new task</p>
            </div>
          ) : tasks.map((task) => {
            const isSelected  = selected.includes(task.id);
            const catColor    = getCategoryColor(task.category);
            const priColor    = getPriorityColor(task.priority);
            const statusStyle = getStatusStyle(task.status);
            const daysLeft    = getDaysLeft(task.due_date, task.status);
            return (
              <div key={task.id}
                className={`bg-white rounded-2xl border p-4 transition ${isSelected ? "border-purple-300 bg-purple-50/30" : "border-gray-100"}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleOne(task.id)}
                    className="w-4 h-4 mt-0.5 rounded accent-purple-600 cursor-pointer flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                    {task.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>}
                  </div>
                  <button onClick={(e) => openDropdown(e, task.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
                    <span className="material-icons" style={{ fontSize: "18px" }}>more_horiz</span>
                  </button>
                  {openDropdownId === task.id && <DropdownMenu task={task} />}
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: catColor.bg, color: catColor.text }}>
                    {task.category?.charAt(0).toUpperCase() + task.category?.slice(1)}
                  </span>
                  <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: priColor.bg, color: priColor.text }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priColor.dot }} />
                    {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-lg font-medium border" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  {task.due_date ? (
                    <div className="flex items-center gap-1.5">
                      <span className="material-icons" style={{ fontSize: "14px", color: daysLeft?.color || "#9ca3af" }}>calendar_today</span>
                      <span className="text-xs text-gray-500">{formatDate(task.due_date)}</span>
                      {daysLeft && <span className="text-xs font-medium" style={{ color: daysLeft.color }}>· {daysLeft.label}</span>}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">No due date</span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="material-icons" style={{ fontSize: "12px" }}>schedule</span>
                    {formatDate(task.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* Pagination */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <Pagination compact />
          </div>
        </div>

        {/* ── TABLE VIEW — large desktop only (xl+) ── */}
        <div className="hidden min-[1400px]:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div>
            {/* Header */}
            <div className="grid items-center px-5 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide gap-3"
              style={{ gridTemplateColumns: "40px minmax(200px,1fr) 120px 120px 160px 130px 110px 40px" }}>
              <div>
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="w-4 h-4 rounded accent-purple-600 cursor-pointer" />
              </div>
              <div>Task</div>
              <div>Category</div>
              <div>Priority</div>
              <div className="flex items-center gap-1 cursor-pointer select-none hover:text-purple-600 transition-colors"
                onClick={() => setSort(sort === "due_date" ? "due_date_desc" : "due_date")}>
                Due Date
                <span className="material-icons" style={{ fontSize: "14px", color: (sort === "due_date" || sort === "due_date_desc") ? "#5b4fcf" : "#9ca3af" }}>
                  {sort === "due_date" ? "arrow_upward" : sort === "due_date_desc" ? "arrow_downward" : "unfold_more"}
                </span>
              </div>
              <div>Status</div>
              <div>Created On</div>
              <div className="flex justify-center">
                <span className="material-icons text-gray-400" style={{ fontSize: "18px" }}>settings</span>
              </div>
            </div>

            {/* Rows */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-icons animate-spin text-purple-400" style={{ fontSize: "32px" }}>autorenew</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-icons text-gray-200 mb-3" style={{ fontSize: "48px" }}>assignment</span>
                <p className="text-sm font-medium text-gray-400">No tasks found</p>
                <p className="text-xs text-gray-300 mt-1">Try adjusting your filters or create a new task</p>
              </div>
            ) : tasks.map((task) => {
              const isSelected  = selected.includes(task.id);
              const catColor    = getCategoryColor(task.category);
              const priColor    = getPriorityColor(task.priority);
              const statusStyle = getStatusStyle(task.status);
              const daysLeft    = getDaysLeft(task.due_date, task.status);
              return (
                <div key={task.id}
                  className={`grid items-center px-5 py-3.5 border-b border-gray-50 transition cursor-pointer gap-3 ${isSelected ? "bg-purple-50/50" : "hover:bg-gray-50"}`}
                  style={{ gridTemplateColumns: "40px minmax(200px,1fr) 120px 120px 160px 130px 110px 40px" }}>
                  <div>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleOne(task.id)}
                      className="w-4 h-4 rounded accent-purple-600 cursor-pointer" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{task.title}</p>
                    {task.description && <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>}
                  </div>
                  <div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: catColor.bg, color: catColor.text }}>
                      {task.category?.charAt(0).toUpperCase() + task.category?.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium w-fit" style={{ backgroundColor: priColor.bg, color: priColor.text }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: priColor.dot }} />
                      {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                    </span>
                  </div>
                  <div>
                    {task.due_date ? (
                      <>
                        <p className="text-sm text-gray-700">{formatDate(task.due_date)}</p>
                        {daysLeft && <p className="text-xs font-medium mt-0.5" style={{ color: daysLeft.color }}>{daysLeft.label}</p>}
                      </>
                    ) : <p className="text-sm text-gray-300">—</p>}
                  </div>
                  <div>
                    <span className="text-xs px-3 py-1 rounded-lg font-medium border" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{formatDate(task.created_at)}</p>
                  </div>
                  <div className="flex justify-center">
                    <button onClick={(e) => openDropdown(e, task.id)}
                      className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
                      <span className="material-icons" style={{ fontSize: "18px" }}>more_horiz</span>
                    </button>
                    {openDropdownId === task.id && <DropdownMenu task={task} />}
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination />
        </div>

      </div>
    </div>
  );
}