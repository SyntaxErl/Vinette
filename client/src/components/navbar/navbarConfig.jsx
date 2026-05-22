import { SearchBar, AnalyticsDateRange } from "./NavbarWidgets";
import {
  NewTaskButton,
  InviteMemberButton,
  ExportReportButton,
  MarkAllReadButton,
} from "./NavbarButtons";

// ─── Greeting helper ──────────────────────────────────────────────────────────

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// ─── Route config ─────────────────────────────────────────────────────────────
// title/subtitle : page header text (null = built dynamically in Navbar)
// middle         : widget shown centered on md+ screens
// right          : full action button on desktop
// mobileRight    : icon-only action button on mobile

export const ROUTE_CONFIG = {
  "/dashboard": {
    title: null,
    subtitle: null,
    middle: <SearchBar placeholder="Search tasks..." />,
    right: <NewTaskButton />,
    mobileRight: <NewTaskButton mobile />,
  },
  "/board": {
    title: "Board",
    subtitle: "Visualize and manage your tasks 📋",
    middle: <SearchBar placeholder="Search tasks..." />,
    right: <NewTaskButton />,
    mobileRight: <NewTaskButton mobile />,
  },
  "/tasks": {
    title: "My Tasks",
    subtitle: "All tasks assigned to you",
    middle: <SearchBar placeholder="Search tasks..." />,
    right: <NewTaskButton />,
    mobileRight: <NewTaskButton mobile />,
  },
  "/calendar": {
    title: "Calendar",
    subtitle: "Plan your tasks and never miss a deadline",
    // Month navigation lives in the Calendar page's own toolbar, so the navbar
    // shows task search here (consistent with Dashboard / Board / My Tasks).
    middle: <SearchBar placeholder="Search tasks..." />,
    right: <NewTaskButton />,
    mobileRight: <NewTaskButton mobile />,
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Track your productivity and task performance",
    middle: <AnalyticsDateRange />,
    right: <ExportReportButton />,
    mobileRight: <ExportReportButton mobile />,
  },
  "/team": {
    title: "Team / Members",
    subtitle: "Manage your team, roles and permissions",
    middle: <SearchBar placeholder="Search members..." />,
    right: <InviteMemberButton />,
    mobileRight: <InviteMemberButton mobile />,
  },
  "/notifications": {
    title: "Notifications",
    subtitle: "Stay updated with what's important.",
    middle: <SearchBar placeholder="Search notifications..." />,
    right: <MarkAllReadButton />,
    mobileRight: <MarkAllReadButton mobile />,
  },
  "/profile": {
    title: "My Profile",
    subtitle: "Manage your account settings and preferences",
    middle: <SearchBar placeholder="Search tasks..." />,
    right: <NewTaskButton />,
    mobileRight: <NewTaskButton mobile />,
  },
  "/settings": {
    title: "Settings",
    subtitle: "Manage your account settings and preferences",
    middle: <SearchBar placeholder="Search tasks..." />,
    right: <NewTaskButton />,
    mobileRight: <NewTaskButton mobile />,
  },
};

// Fallback config for unknown routes
export const DEFAULT_CONFIG = {
  title: "TaskFlow",
  subtitle: "",
  middle: <SearchBar placeholder="Search tasks..." />,
  right: <NewTaskButton />,
  mobileRight: <NewTaskButton mobile />,
};
