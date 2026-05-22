import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Calendar as BigCalendar, dayjsLocalizer, Views } from "react-big-calendar";
import dayjs from "dayjs";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getTasks } from "@/services/taskService";
import useTaskStore from "@/store/taskStore";
import CalendarSkeleton from "@/components/CalendarSkeleton";
import { getCategoryColor, getStatusLabel, getStatusStyle } from "@/utils/taskHelpers";
import { CATEGORY_CHIPS } from "@/constants/taskOptions";

// dayjsLocalizer self-loads every plugin it needs (isBetween, utc, …).
const localizer = dayjsLocalizer(dayjs);

// The calendar fetches every task once (like the board) and lets RBC slice by
// month client-side, so the cache key is constant — only a task mutation
// (taskVersion bump) invalidates it. Read imperatively so it never becomes a
// hook dep / refetch trigger. Mirrors boardCache / tasksCache.
const CAL_KEY = "calendar";
const readCalendarCache = () => {
  const { calendarCache, taskVersion } = useTaskStore.getState();
  return calendarCache &&
    calendarCache.key === CAL_KEY &&
    calendarCache.version === taskVersion
    ? calendarCache
    : null;
};

// Place all-day events on the right calendar day. The API returns due_date as a
// UTC ISO string (mysql2 hands back a JS Date for the DATE column, which
// res.json() serializes to UTC) — e.g. a May 22 task in UTC+8 comes back as
// "2026-05-21T16:00:00.000Z". Slicing the first 10 chars would read the UTC day
// (May 21); instead interpret it in *local* time, matching how MyTasks/Board
// render dates (new Date(s).toLocaleDateString()).
const parseLocalDate = (s) => {
  if (!s) return null;
  // Plain date-only string ("YYYY-MM-DD"): build directly so it can't shift.
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  // Full ISO timestamp: take its local Y-M-D.
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ─── Custom toolbar ──────────────────────────────────────────────────────────
// Replaces RBC's default toolbar (which clashes with the design system).
function CalendarToolbar({ label, onNavigate, onView, view }) {
  const BRAND = "#5b4fcf";
  const VIEWS = [
    { key: Views.MONTH, label: "Month" },
    { key: Views.AGENDA, label: "Agenda" },
  ];

  return (
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("TODAY")}
          className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Today
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onNavigate("PREV")}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
            aria-label="Previous"
          >
            <span className="material-icons" style={{ fontSize: "20px" }}>chevron_left</span>
          </button>
          <button
            onClick={() => onNavigate("NEXT")}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
            aria-label="Next"
          >
            <span className="material-icons" style={{ fontSize: "20px" }}>chevron_right</span>
          </button>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-gray-800 ml-1">{label}</h2>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
        {VIEWS.map((v) => {
          const active = view === v.key;
          return (
            <button
              key={v.key}
              onClick={() => onView(v.key)}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: active ? "white" : "transparent",
                color: active ? BRAND : "#6b7280",
                boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Agenda empty state ──────────────────────────────────────────────────────
// Passed as RBC's `noEventsInRange` message (rendered inside .rbc-agenda-empty).
function AgendaEmpty() {
  const openNewTaskModal = useTaskStore((s) => s.openNewTaskModal);
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "#f5f3ff" }}
      >
        <span className="material-icons" style={{ fontSize: "30px", color: "#5b4fcf" }}>
          event_available
        </span>
      </div>
      <p className="text-base font-bold text-gray-800">Nothing scheduled</p>
      <p className="text-sm text-gray-400 mt-1 mb-4 max-w-xs">
        No tasks are due in this range. Add one or jump to another month.
      </p>
      <button
        onClick={() => openNewTaskModal()}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
        style={{ backgroundColor: "#5b4fcf" }}
      >
        <span className="material-icons" style={{ fontSize: "16px" }}>add</span>
        New task
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Calendar() {
  const taskVersion       = useTaskStore((s) => s.taskVersion);
  const setCalendarCache  = useTaskStore((s) => s.setCalendarCache);
  const openNewTaskModal  = useTaskStore((s) => s.openNewTaskModal);
  const openTaskDetail    = useTaskStore((s) => s.openTaskDetail);

  // Seed from cache on mount — revisiting with no task changes shows it
  // instantly, no skeleton flash.
  const seeded = readCalendarCache();
  const [tasks,   setTasks]   = useState(seeded?.tasks ?? []);
  const [loading, setLoading] = useState(!seeded);

  // Controlled date + view. RBC's built-in (uncontrolled) state lives in an
  // `uncontrollable` HOC that doesn't re-render under React 19, so the custom
  // toolbar's navigate/view changes were no-ops — owning the state here fixes it.
  const [date, setDate] = useState(() => new Date());
  const [view, setView] = useState(Views.MONTH);

  // Day action popover — opened when a day that already has tasks is clicked (or
  // its "+N more" link). Lets the user view those tasks or add a new one.
  const [dayPopover, setDayPopover] = useState(null); // { date, tasks, pos }
  const pointerRef = useRef({ x: 0, y: 0 }); // last click position, to anchor the popover
  const popoverRef = useRef(null);

  // Track the latest click position globally (capture phase, so it always fires
  // first and is never swallowed by an open popover/overlay). This keeps the
  // anchor fresh — the previous calendar-only handler went stale once a popover
  // was open and covered the grid.
  useEffect(() => {
    const onDown = (e) => { pointerRef.current = { x: e.clientX, y: e.clientY }; };
    document.addEventListener("mousedown", onDown, true);
    return () => document.removeEventListener("mousedown", onDown, true);
  }, []);

  const fetchCalendar = useCallback(async () => {
    const cached = readCalendarCache();
    if (cached) {
      setTasks(cached.tasks);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getTasks({ limit: 200 }); // fetch all — RBC paginates by month
      const all = res.data.tasks || [];
      setTasks(all);
      setCalendarCache({
        key: CAL_KEY,
        version: useTaskStore.getState().taskVersion,
        tasks: all,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [taskVersion, setCalendarCache]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  // Tasks → all-day events, dropping any without a due date.
  const events = useMemo(
    () =>
      tasks
        .filter((t) => t.due_date)
        .map((t) => {
          const date = parseLocalDate(t.due_date);
          return { id: t.id, title: t.title, start: date, end: date, allDay: true, resource: t };
        }),
    [tasks],
  );

  // Color each event by category; dim + strike completed ones.
  const eventPropGetter = useCallback((event) => {
    const c = getCategoryColor(event.resource.category);
    const done = event.resource.status === "done";
    return {
      style: {
        backgroundColor: c.bg,
        color: c.text,
        borderLeft: `3px solid ${c.text}`,
        borderRadius: "6px",
        opacity: done ? 0.6 : 1,
        textDecoration: done ? "line-through" : "none",
      },
    };
  }, []);

  // Tasks whose due date falls on `day` (compared in local Y-M-D).
  const tasksOnDay = useCallback(
    (day) => {
      const key = dayjs(day).format("YYYY-MM-DD");
      return events
        .filter((e) => dayjs(e.start).format("YYYY-MM-DD") === key)
        .map((e) => e.resource);
    },
    [events],
  );

  // Anchor the popover at the click point; flip up / left when it would overflow
  // the viewport. Height is estimated from the task count. Computed when the
  // popover opens (never reads the ref during render).
  const popoverPos = useCallback((count) => {
    const PW = 300, M = 12;
    const estH = 56 + Math.min(count * 42, 260) + 52; // header + list + footer
    const { x, y } = pointerRef.current;
    return {
      left: x + PW + M > window.innerWidth ? Math.max(M, x - PW) : x,
      top: y + estH + M > window.innerHeight ? Math.max(M, y - estH) : y,
    };
  }, []);

  const openNewTaskOn = (day) =>
    openNewTaskModal({ due_date: dayjs(day).format("YYYY-MM-DD") });

  // The day is the only click target. Clicking anywhere on a day — empty space
  // or a task chip — opens the popover at the click; the chips themselves aren't
  // individually actionable. Empty days skip straight to creating a task.
  const openDayPopover = useCallback(
    (day) => {
      const dayTasks = tasksOnDay(day);
      setDayPopover({ date: day, tasks: dayTasks, pos: popoverPos(dayTasks.length) });
    },
    [tasksOnDay, popoverPos],
  );

  const handleSelectEvent = useCallback((event) => openDayPopover(event.start), [openDayPopover]);

  const handleSelectSlot = useCallback(
    (slot) => {
      const dayTasks = tasksOnDay(slot.start);
      if (dayTasks.length === 0) {
        openNewTaskModal({ due_date: dayjs(slot.start).format("YYYY-MM-DD") });
        return;
      }
      setDayPopover({ date: slot.start, tasks: dayTasks, pos: popoverPos(dayTasks.length) });
    },
    [tasksOnDay, openNewTaskModal, popoverPos],
  );

  // "+N more" link → same popover (covers days too full to click empty space).
  const handleShowMore = useCallback(
    (evts, day) =>
      setDayPopover({ date: day, tasks: evts.map((e) => e.resource), pos: popoverPos(evts.length) }),
    [popoverPos],
  );

  const closeDayPopover = useCallback(() => setDayPopover(null), []);

  // Close the popover on Escape or a click outside it. A click on another day
  // closes this one (mousedown) and the calendar re-opens a fresh popover at the
  // new spot (click) — so clicking a different date moves the popover correctly.
  useEffect(() => {
    if (!dayPopover) return;
    const onKey = (e) => { if (e.key === "Escape") setDayPopover(null); };
    const onDown = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setDayPopover(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [dayPopover]);

  if (loading) return <CalendarSkeleton />;

  const scheduled = events.length;
  const undated = tasks.length - scheduled;

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-7xl mx-auto w-full px-1 sm:px-6 py-4 animate-fadeInUp">

        {/* Category legend + counts */}
        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap mb-4 text-xs">
          {CATEGORY_CHIPS.map((c) => (
            <div key={c.value} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.text }} />
              <span className="text-gray-500 font-medium">{cap(c.value)}</span>
            </div>
          ))}
          <span className="text-gray-400 ml-auto">
            {scheduled} scheduled
            {undated > 0 && <span className="text-gray-300"> · {undated} without a due date</span>}
          </span>
        </div>

        <div className="tf-calendar h-[calc(100vh-220px)] min-h-[560px]">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={date}
            onNavigate={setDate}
            view={view}
            onView={setView}
            views={[Views.MONTH, Views.AGENDA]}
            selectable
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onShowMore={handleShowMore}
            onDrillDown={() => {}}
            eventPropGetter={eventPropGetter}
            components={{ toolbar: CalendarToolbar }}
            messages={{ noEventsInRange: <AgendaEmpty /> }}
          />
        </div>
      </div>

      {/* ── Day action popover — view that day's tasks or add a new one ── */}
      {dayPopover && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[999] w-[300px] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden"
          style={{ ...dayPopover.pos, animation: "fadeInDown 0.15s ease" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {dayjs(dayPopover.date).format("ddd, MMM D")}
                </p>
                <p className="text-xs text-gray-400">
                  {dayPopover.tasks.length} task{dayPopover.tasks.length !== 1 ? "s" : ""} scheduled
                </p>
              </div>
              <button
                onClick={closeDayPopover}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <span className="material-icons" style={{ fontSize: "18px" }}>close</span>
              </button>
            </div>

            {/* Task list */}
            <div className="max-h-[260px] overflow-y-auto divide-y divide-gray-50">
              {dayPopover.tasks.map((t) => {
                const cat = getCategoryColor(t.category);
                const st = getStatusStyle(t.status);
                return (
                  <button
                    key={t.id}
                    onClick={() => { openTaskDetail(t.id); closeDayPopover(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 transition text-left group"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.text }} />
                    <span
                      className={`flex-1 min-w-0 text-sm truncate ${
                        t.status === "done" ? "line-through text-gray-400" : "text-gray-700 group-hover:text-purple-700"
                      }`}
                    >
                      {t.title}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md font-medium border flex-shrink-0 whitespace-nowrap"
                      style={{ backgroundColor: st.bg, color: st.text, borderColor: st.border }}
                    >
                      {getStatusLabel(t.status)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add task */}
            <div className="p-2 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => { openNewTaskOn(dayPopover.date); closeDayPopover(); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: "#5b4fcf" }}
              >
                <span className="material-icons" style={{ fontSize: "16px" }}>add</span>
                Add task this day
              </button>
            </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
