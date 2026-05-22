import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getTasks, updateTask } from "@/services/taskService";
import useTaskStore from "@/store/taskStore";
import BoardSkeleton from "@/components/BoardSkeleton";
import { getCategoryColor, getPriorityColor, formatDate, getDaysLeft } from "@/utils/taskHelpers";

// Cache key for the board is just its server-side params (category + sort).
const boardKey = (category, sort) => JSON.stringify({ category, sort });

// Returns the cached board iff it matches the current filters AND no task has
// mutated since it was stored. Read imperatively (like dashboard's get()) so it
// never becomes a hook dependency / refetch trigger.
const readBoardCache = (category, sort) => {
  const { boardCache, taskVersion } = useTaskStore.getState();
  return boardCache &&
    boardCache.key === boardKey(category, sort) &&
    boardCache.version === taskVersion
    ? boardCache
    : null;
};

// ─── Column config ─────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    id: "todo",
    label: "Todo",
    icon: "radio_button_unchecked",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    headerBg: "#f3f4f6",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: "pending",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
    headerBg: "#fef3c7",
  },
  {
    id: "done",
    label: "Done",
    icon: "check_circle",
    color: "#22c55e",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    headerBg: "#dcfce7",
  },
];

// ─── Task Card ─────────────────────────────────────────────────────────────────
function KanbanCard({ task, index }) {
  const catColor = getCategoryColor(task.category);
  const priColor = getPriorityColor(task.priority);
  const daysLeft = getDaysLeft(task.due_date, task.status);
  const openTaskDetail = useTaskStore((s) => s.openTaskDetail);

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
        >
          {/* Inner wrapper handles visual effects — never touch the outer transform */}
          <div
            onClick={() => openTaskDetail(task.id)}
            className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer select-none transition-all duration-150"
            style={{
              boxShadow: snapshot.isDragging
                ? "0 10px 30px rgba(91,79,207,0.18)"
                : "0 1px 4px rgba(0,0,0,0.06)",
              transform: snapshot.isDragging ? "rotate(1.5deg)" : "rotate(0deg)",
              opacity: snapshot.isDragging ? 0.95 : 1,
              borderColor: snapshot.isDragging ? "#c4b5fd" : "#f3f4f6",
            }}
          >
          {/* Title */}
          <p className="text-sm font-semibold text-gray-800 leading-snug mb-1">
            {task.title}
          </p>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
              {task.description}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: catColor.bg, color: catColor.text }}
            >
              {task.category?.charAt(0).toUpperCase() + task.category?.slice(1)}
            </span>
            {task.priority && task.priority !== "none" && (
              <span
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: priColor.bg, color: priColor.text }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: priColor.dot }}
                />
                {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
              </span>
            )}
          </div>

          {/* Due date */}
          {task.due_date && (
            <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
              <span
                className="material-icons"
                style={{ fontSize: "13px", color: daysLeft?.color || "#9ca3af" }}
              >
                calendar_today
              </span>
              <span className="text-xs text-gray-500">{formatDate(task.due_date)}</span>
              {daysLeft && (
                <span
                  className="text-xs font-medium ml-auto"
                  style={{ color: daysLeft.color }}
                >
                  {daysLeft.label}
                </span>
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// ─── Column ────────────────────────────────────────────────────────────────────
function KanbanColumn({ column, tasks }) {
  const openNewTaskModal = useTaskStore((s) => s.openNewTaskModal);

  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-sm">
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl mb-3"
        style={{ backgroundColor: column.headerBg }}
      >
        <div className="flex items-center gap-2">
          <span
            className="material-icons"
            style={{ fontSize: "18px", color: column.color }}
          >
            {column.icon}
          </span>
          <span className="text-sm font-bold text-gray-700">{column.label}</span>
          <span
            className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: column.color }}
          >
            {tasks.length}
          </span>
        </div>
        <button
          onClick={openNewTaskModal}
          className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-white/60"
          title={`Add task to ${column.label}`}
        >
          <span className="material-icons" style={{ fontSize: "18px" }}>add</span>
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 flex flex-col gap-3 rounded-2xl p-2 transition-colors min-h-[200px]"
            style={{
              backgroundColor: snapshot.isDraggingOver
                ? `${column.color}10`
                : "transparent",
              border: snapshot.isDraggingOver
                ? `2px dashed ${column.color}50`
                : "2px dashed transparent",
            }}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-50">
                <span
                  className="material-icons mb-2"
                  style={{ fontSize: "32px", color: column.color }}
                >
                  {column.icon}
                </span>
                <p className="text-xs font-medium text-gray-400">
                  No {column.label.toLowerCase()} tasks
                </p>
              </div>
            )}

            {tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} index={index} />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

// ─── Main Board ────────────────────────────────────────────────────────────────
export default function BoardView() {
  const clearDashboardStats    = useTaskStore((s) => s.clearDashboardStats);
  const incrementTaskVersion   = useTaskStore((s) => s.incrementTaskVersion);
  const setBoardCache          = useTaskStore((s) => s.setBoardCache);
  const taskVersion            = useTaskStore((s) => s.taskVersion);

  // Seed from cache on mount — revisiting the board with no changes since the
  // last fetch shows it instantly, no skeleton (filters always start default).
  const seeded = readBoardCache("", "due_date");

  const [columns, setColumns] = useState(
    seeded?.columns ?? { todo: [], in_progress: [], done: [] },
  );
  const [loading,     setLoading]     = useState(!seeded);
  const [category,    setCategory]    = useState("");
  const [sort,        setSort]        = useState("due_date");
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [sortOpen,    setSortOpen]    = useState(false);
  const [filterPos,   setFilterPos]   = useState({ top: 0, left: 0 });
  const [sortPos,     setSortPos]     = useState({ top: 0, left: 0 });
  const filterRef    = useRef(null);
  const sortRef      = useRef(null);
  const filterBtnRef = useRef(null);
  const sortBtnRef   = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    const close = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target) &&
          filterBtnRef.current && !filterBtnRef.current.contains(e.target))
        setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target) &&
          sortBtnRef.current && !sortBtnRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const calcPos = (btnRef, width) => {
    const rect = btnRef.current.getBoundingClientRect();
    const spaceRight  = window.innerWidth - rect.left;
    const spaceBottom = window.innerHeight - rect.bottom;
    return {
      top:  spaceBottom < 300 ? rect.top - 12 : rect.bottom + 8,
      left: spaceRight < width ? rect.right - width : rect.left,
    };
  };

  // ── Fetch all tasks ──────────────────────────────────────────────────────────
  const fetchBoard = useCallback(async () => {
    // Cache hit — same filters, no task mutation since: reuse, skip the network.
    const cached = readBoardCache(category, sort);
    if (cached) {
      setColumns(cached.columns);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = { limit: 200 };
      if (category) params.category = category;
      if (sort)     params.sort     = sort;
      const res = await getTasks(params); // fetch all — no pagination on board
      const all = res.data.tasks || [];

      const cols = {
        todo:        all.filter((t) => t.status === "todo"),
        in_progress: all.filter((t) => t.status === "in_progress"),
        done:        all.filter((t) => t.status === "done"),
      };
      setColumns(cols);
      setBoardCache({
        key: boardKey(category, sort),
        version: useTaskStore.getState().taskVersion,
        columns: cols,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [taskVersion, category, sort, setBoardCache]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  // ── Drag end handler ─────────────────────────────────────────────────────────
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside or same position
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId;
    const destCol   = destination.droppableId;
    const taskId    = Number(draggableId);

    // ── Optimistic update — move card instantly in UI ──────────────────────────
    const sourceTasks = [...columns[sourceCol]];
    const destTasks   = sourceCol === destCol ? sourceTasks : [...columns[destCol]];
    const [movedTask] = sourceTasks.splice(source.index, 1);
    const updatedTask = { ...movedTask, status: destCol };

    let next;
    if (sourceCol === destCol) {
      sourceTasks.splice(destination.index, 0, updatedTask);
      next = { ...columns, [sourceCol]: sourceTasks };
    } else {
      destTasks.splice(destination.index, 0, updatedTask);
      next = { ...columns, [sourceCol]: sourceTasks, [destCol]: destTasks };
    }
    setColumns(next);

    // ── Persist to backend ─────────────────────────────────────────────────────
    try {
      await updateTask(taskId, { status: destCol });
      clearDashboardStats();
      incrementTaskVersion(); // let MyTasks / Dashboard see the moved task
      // Re-cache the board under the new version so it stays cached (the
      // version bump above would otherwise invalidate it and force a refetch).
      setBoardCache({
        key: boardKey(category, sort),
        version: useTaskStore.getState().taskVersion,
        columns: next,
      });
    } catch (err) {
      console.error("Failed to update task status:", err);
      // Revert on failure — fetchBoard() restores the pre-drag cached columns.
      fetchBoard();
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return <BoardSkeleton />;

  // ── Board ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto w-full px-1 sm:px-6 py-4 animate-fadeIn">

        {/* ── Filter Bar ── */}
        {(() => {
          const CATEGORY_CHIPS = [
            { value: "work",     label: "💼 Work",     bg: "#ede9fe", text: "#5b4fcf" },
            { value: "personal", label: "🙋 Personal", bg: "#dcfce7", text: "#16a34a" },
            { value: "school",   label: "📚 School",   bg: "#dbeafe", text: "#2563eb" },
            { value: "fitness",  label: "💪 Fitness",  bg: "#fce7f3", text: "#db2777" },
            { value: "others",   label: "📌 Others",   bg: "#f3f4f6", text: "#6b7280" },
          ];
          const SORT_OPTIONS = [
            { value: "due_date",      label: "Due Date",   sub: "Earliest first", icon: "arrow_upward"   },
            { value: "due_date_desc", label: "Due Date",   sub: "Latest first",   icon: "arrow_downward" },
            { value: "created_at",    label: "Created On", sub: "Newest first",   icon: "schedule"       },
            { value: "priority",      label: "Priority",   sub: "High to low",    icon: "flag"           },
          ];
          const currentSort   = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0];
          const hasFilter     = !!category;
          const BRAND         = "#5b4fcf";

          return (
            <div className="bg-gray-50 px-4 py-3 mb-4 flex items-center gap-2 flex-wrap">

              {/* Filter Button */}
              <div className="relative">
                <button
                  ref={filterBtnRef}
                  onClick={() => {
                    if (!filterOpen) setFilterPos(calcPos(filterBtnRef, 300));
                    setFilterOpen((p) => !p);
                    setSortOpen(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition"
                  style={{
                    borderColor: hasFilter ? BRAND : "#e5e7eb",
                    backgroundColor: hasFilter ? "#f5f3ff" : "white",
                    color: hasFilter ? BRAND : "#374151",
                  }}
                >
                  <span className="material-icons" style={{ fontSize: "16px" }}>tune</span>
                  Filters
                  {hasFilter && (
                    <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: BRAND }}>1</span>
                  )}
                  <span className="material-icons text-gray-400" style={{ fontSize: "16px" }}>
                    {filterOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>

                {/* Filter Popover */}
                {filterOpen && createPortal(
                  <div
                    ref={filterRef}
                    className="fixed z-[998] bg-white rounded-2xl border border-gray-100 shadow-2xl p-5"
                    style={{ top: filterPos.top, left: filterPos.left, width: 300, animation: "fadeInDown 0.15s ease" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">Category</p>
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
                    {hasFilter && (
                      <div className="pt-3 mt-3 border-t border-gray-100">
                        <button
                          onClick={() => { setCategory(""); setFilterOpen(false); }}
                          className="w-full py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 border border-red-100 transition">
                          Clear filter
                        </button>
                      </div>
                    )}
                  </div>,
                  document.body
                )}
              </div>

              {/* Sort Button */}
              <div className="relative">
                <button
                  ref={sortBtnRef}
                  onClick={() => {
                    if (!sortOpen) setSortPos(calcPos(sortBtnRef, 256));
                    setSortOpen((p) => !p);
                    setFilterOpen(false);
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white"
                >
                  <span className="material-icons" style={{ fontSize: "16px", color: BRAND }}>swap_vert</span>
                  <span className="hidden sm:inline">{currentSort.label}:</span>
                  <span className="text-gray-500 hidden sm:inline">{currentSort.sub}</span>
                  <span className="material-icons text-gray-400" style={{ fontSize: "16px" }}>
                    {sortOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>

                {/* Sort Popover */}
                {sortOpen && createPortal(
                  <div
                    ref={sortRef}
                    className="fixed z-[998] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden w-64"
                    style={{ top: sortPos.top, left: sortPos.left, animation: "fadeInDown 0.15s ease" }}
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
                            <span className="material-icons" style={{ fontSize: "16px", color: isActive ? BRAND : "#9ca3af" }}>{o.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold" style={{ color: isActive ? BRAND : "#374151" }}>{o.label}</p>
                            <p className="text-xs text-gray-400">{o.sub}</p>
                          </div>
                          {isActive && <span className="material-icons ml-auto" style={{ fontSize: "16px", color: BRAND }}>check</span>}
                        </button>
                      );
                    })}
                  </div>,
                  document.body
                )}
              </div>

              {/* Active filter pill */}
              {hasFilter && (
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const chip = CATEGORY_CHIPS.find((c) => c.value === category);
                    return chip ? (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border"
                        style={{ backgroundColor: chip.bg, color: chip.text, borderColor: chip.text + "40" }}>
                        {chip.label}
                        <button onClick={() => setCategory("")} className="hover:opacity-70 transition">
                          <span className="material-icons" style={{ fontSize: "12px" }}>close</span>
                        </button>
                      </span>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          );
        })()}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 items-start">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={columns[col.id]}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}