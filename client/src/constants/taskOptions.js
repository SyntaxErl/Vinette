// ─── Category ─────────────────────────────────────────────────────────────────
export const CATEGORY_COLORS = {
  work:     { bg: "#ede9fe", text: "#5b4fcf" },
  personal: { bg: "#dcfce7", text: "#16a34a" },
  school:   { bg: "#dbeafe", text: "#2563eb" },
  fitness:  { bg: "#fce7f3", text: "#db2777" },
  others:   { bg: "#f3f4f6", text: "#6b7280" },
};

export const CATEGORY_CHIPS = [
  { value: "work",     label: "💼 Work",     bg: "#ede9fe", text: "#5b4fcf" },
  { value: "personal", label: "🙋 Personal", bg: "#dcfce7", text: "#16a34a" },
  { value: "school",   label: "📚 School",   bg: "#dbeafe", text: "#2563eb" },
  { value: "fitness",  label: "💪 Fitness",  bg: "#fce7f3", text: "#db2777" },
  { value: "others",   label: "📌 Others",   bg: "#f3f4f6", text: "#6b7280" },
];

// ─── Priority ─────────────────────────────────────────────────────────────────
export const PRIORITY_COLORS = {
  high:   { bg: "#fee2e2", text: "#ef4444", dot: "#ef4444" },
  medium: { bg: "#fff7ed", text: "#f97316", dot: "#f97316" },
  low:    { bg: "#f0fdf4", text: "#22c55e", dot: "#22c55e" },
  none:   { bg: "#f3f4f6", text: "#9ca3af", dot: "#9ca3af" },
};

export const PRIORITY_CHIPS = [
  { value: "high",   label: "High",   dot: "#ef4444", bg: "#fee2e2", text: "#ef4444" },
  { value: "medium", label: "Medium", dot: "#f97316", bg: "#fff7ed", text: "#f97316" },
  { value: "low",    label: "Low",    dot: "#22c55e", bg: "#f0fdf4", text: "#22c55e" },
];

export const PRIORITY_OPTIONS = [
  { value: "high",   label: "High",   color: "#ef4444" },
  { value: "medium", label: "Medium", color: "#f97316" },
  { value: "low",    label: "Low",    color: "#22c55e" },
  { value: "none",   label: "None",   color: "#9ca3af" },
];

// ─── Status ───────────────────────────────────────────────────────────────────
export const STATUS_STYLES = {
  todo:        { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
  in_progress: { bg: "#eff6ff", text: "#3b82f6", border: "#bfdbfe" },
  done:        { bg: "#f0fdf4", text: "#22c55e", border: "#bbf7d0" },
};

export const STATUS_CHIPS = [
  { value: "todo",        label: "Todo",        icon: "radio_button_unchecked", color: "#6b7280", bg: "#f9fafb" },
  { value: "in_progress", label: "In Progress", icon: "pending",                color: "#3b82f6", bg: "#eff6ff" },
  { value: "done",        label: "Done",        icon: "check_circle",           color: "#22c55e", bg: "#f0fdf4" },
];

export const STATUS_OPTIONS = [
  { value: "todo",        label: "Todo",        icon: "radio_button_unchecked", color: "#6b7280" },
  { value: "in_progress", label: "In Progress", icon: "pending",                color: "#f59e0b" },
  { value: "done",        label: "Done",        icon: "check_circle",           color: "#22c55e" },
];

// ─── Sort ─────────────────────────────────────────────────────────────────────
export const SORT_OPTIONS = [
  { value: "due_date",      label: "Due Date",   sub: "Earliest first", icon: "arrow_upward"   },
  { value: "due_date_desc", label: "Due Date",   sub: "Latest first",   icon: "arrow_downward" },
  { value: "created_at",    label: "Created On", sub: "Newest first",   icon: "schedule"       },
  { value: "priority",      label: "Priority",   sub: "High to low",    icon: "flag"           },
];

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const PER_PAGE = 10;
export const BRAND_COLOR = "#5b4fcf";