import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { getTasks } from "@/services/taskService";
import useTaskStore from "@/store/taskStore";
import { getCategoryColor, getPriorityColor, getStatusLabel, getStatusStyle } from "@/utils/taskHelpers";

// ─── Search Bar ───────────────────────────────────────────────────────────────

export const SearchBar = ({ placeholder }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [isOpen,   setIsOpen]   = useState(false);
  const [dropPos,  setDropPos]  = useState({ top: 0, left: 0, width: 0 });

  const openTaskDetail = useTaskStore((s) => s.openTaskDetail);
  const inputRef    = useRef(null);
  const wrapperRef  = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset on route change
  useEffect(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }, [location.pathname]);

  // Calculate dropdown position
  const updatePos = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setDropPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }, []);

  // Debounced search — fires 300ms after user stops typing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    updatePos();
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);
      try {
        const res = await getTasks({ search: query.trim(), limit: 6 });
        setResults(res.data.tasks || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (task) => {
    setIsOpen(false);
    setQuery("");
    openTaskDetail(task.id); // Task Details modal reads this from taskStore
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      navigate(`/tasks?search=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === "Escape") {
      setQuery("");
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white w-full focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-50 transition">
        <span className="material-icons text-gray-400 flex-shrink-0" style={{ fontSize: "18px" }}>search</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent min-w-0"
        />
        {query && (
          <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
            <span className="material-icons" style={{ fontSize: "16px" }}>close</span>
          </button>
        )}
      </div>

      {/* Dropdown Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[999] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
          style={{ top: dropPos.top, left: dropPos.left, width: Math.max(dropPos.width, 340), animation: "fadeInDown 0.15s ease" }}
        >
          {loading ? (
            // Loading
            <div className="flex items-center gap-3 px-4 py-5">
              <span className="material-icons animate-spin text-purple-400" style={{ fontSize: "20px" }}>autorenew</span>
              <span className="text-sm text-gray-500">Searching...</span>
            </div>

          ) : results.length === 0 ? (
            // No results
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#f5f3ff" }}>
                <span className="material-icons" style={{ fontSize: "22px", color: "#5b4fcf" }}>search_off</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">No tasks found</p>
              <p className="text-xs text-gray-400 mt-1">
                No results for "<span className="font-medium text-gray-600">{query}</span>"
              </p>
              <p className="text-xs text-gray-300 mt-0.5">Try a different keyword</p>
            </div>

          ) : (
            // Results
            <>
              {/* Header */}
              <div className="px-4 pt-3 pb-1.5 flex items-center justify-between border-b border-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {results.length} result{results.length > 1 ? "s" : ""} found
                </p>
                <button
                  onClick={() => { setIsOpen(false); navigate(`/tasks?search=${encodeURIComponent(query.trim())}`); }}
                  className="text-xs font-semibold flex items-center gap-0.5 transition hover:opacity-70"
                  style={{ color: "#5b4fcf" }}
                >
                  View all
                  <span className="material-icons" style={{ fontSize: "13px" }}>arrow_forward</span>
                </button>
              </div>

              {/* Task list */}
              <div className="divide-y divide-gray-50">
                {results.map((task) => {
                  const catColor    = getCategoryColor(task.category);
                  const priColor    = getPriorityColor(task.priority);
                  const statusStyle = getStatusStyle(task.status);
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleSelect(task)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left group"
                    >
                      {/* Category dot */}
                      <div className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: catColor.text }} />

                      {/* Title + description */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-700 transition">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{task.description}</p>
                        )}
                      </div>

                      {/* Priority + Status badges */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {task.priority && task.priority !== "none" && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: priColor.bg, color: priColor.text }}>
                            {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium border"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}>
                          {getStatusLabel(task.status)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-600 font-mono text-[10px]">Enter</kbd>
                  {" "}to see all results
                </p>
                <p className="text-xs text-gray-400">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-600 font-mono text-[10px]">Esc</kbd>
                  {" "}to close
                </p>
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

// ─── Analytics Date Range ─────────────────────────────────────────────────────
// Wired to taskStore.analyticsRange — picking a preset refetches the Analytics
// page for that window (see taskStore.fetchAnalytics).

const RANGE_OPTIONS = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

export const AnalyticsDateRange = () => {
  const analyticsRange = useTaskStore((s) => s.analyticsRange);
  const setAnalyticsRange = useTaskStore((s) => s.setAnalyticsRange);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current =
    RANGE_OPTIONS.find((o) => o.days === analyticsRange) || RANGE_OPTIONS[1];
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - current.days);
  const fmt = (d) => d.toLocaleDateString("default", { month: "short", day: "numeric" });

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2 bg-white hover:bg-gray-50 transition min-w-0"
      >
        <span className="material-icons text-gray-400 flex-shrink-0" style={{ fontSize: "16px" }}>calendar_today</span>
        <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">{fmt(start)} – {fmt(end)}</span>
        <span className="material-icons text-gray-400 flex-shrink-0" style={{ fontSize: "16px" }}>keyboard_arrow_down</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => {
                setAnalyticsRange(opt.days);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                opt.days === analyticsRange ? "text-purple-600 font-medium" : "text-gray-700"
              }`}
            >
              {opt.label}
              {opt.days === analyticsRange && (
                <span className="material-icons" style={{ fontSize: "16px" }}>check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};