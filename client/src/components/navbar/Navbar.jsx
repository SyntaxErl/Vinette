import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import api from "../../api/axios";
import { ROUTE_CONFIG, DEFAULT_CONFIG, getGreeting } from "./navbarConfig";
import NotificationModal from "../NotificationModal";

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [showNotifModal, setShowNotifModal] = useState(false);
  const [dueTodayCount, setDueTodayCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  // Fetch due-today task count
  useEffect(() => {
    const controller = new AbortController();
    const fetchDueToday = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await api.get(`/tasks?due_date=${today}&status=todo`, {
          signal: controller.signal,
        });
        setDueTodayCount(res.data.tasks?.length || 0);
      } catch (err) {
        if (err.name !== "CanceledError") setDueTodayCount(0);
      }
    };
    fetchDueToday();
    return () => controller.abort();
  }, []);

  // Fetch unread notification count — silent fallback until endpoint is ready
  useEffect(() => {
    const controller = new AbortController();
    const fetchNotifCount = async () => {
      try {
        const res = await api.get("/notifications?unread=true", {
          signal: controller.signal,
        });
        setNotifCount(res.data.count ?? res.data.notifications?.length ?? 0);
      } catch (err) {
        if (err.name !== "CanceledError") setNotifCount(0);
      }
    };
    fetchNotifCount();
    return () => controller.abort();
  }, [location.pathname]);

  const config = ROUTE_CONFIG[location.pathname] ?? DEFAULT_CONFIG;

  const title =
    location.pathname === "/dashboard"
      ? `${getGreeting()}, ${user?.name?.split(" ")[0] || "there"}! 👋`
      : config.title;

  const subtitle =
    location.pathname === "/dashboard"
      ? dueTodayCount > 0
        ? `You have ${dueTodayCount} task${dueTodayCount > 1 ? "s" : ""} due today.`
        : "You have no tasks due today. 🎉"
      : config.subtitle;

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header
      key={location.pathname}
      className="bg-white border-b border-gray-100 shadow-sm animate-fadeIn relative z-50"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* ── Main row ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3 ">

        {/* Left — hamburger + page title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden flex-shrink-0 text-gray-500 hover:text-gray-700 p-1"
            aria-label="Open menu"
          >
            <span className="material-icons" style={{ fontSize: "24px" }}>menu</span>
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-400 truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Middle — large desktop only (lg+) */}
        {/* ✅ changed: was md:flex, now lg:flex so tablet titles don't get squished */}
        <div className="hidden lg:flex items-center flex-1 justify-center px-4">
          {config.middle}
        </div>

        {/* Right — actions + bell + avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Action button — full label on lg+, icon-only below lg */}
          {/* ✅ changed: was md:block/md:hidden, now lg:block/lg:hidden */}
          <div className="hidden lg:block">{config.right}</div>
          <div className="lg:hidden">{config.mobileRight}</div>

          {/* Notification bell */}
          <button
            className="relative p-2 rounded-xl hover:bg-gray-50 transition"
            onClick={() => setShowNotifModal((prev) => !prev)}
            aria-label="Notifications"
          >
            <span className="material-icons text-gray-500" style={{ fontSize: "22px" }}>
              notifications
            </span>
            {notifCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-4 h-4 px-0.5 rounded-full text-white font-bold flex items-center justify-center"
                style={{ backgroundColor: "#ef4444", fontSize: "10px" }}
              >
                {notifCount > 99 ? "99+" : notifCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            className="flex items-center gap-1 p-1 rounded-xl hover:bg-gray-50 transition"
            onClick={() => navigate("/profile")}
            aria-label="Go to profile"
          >
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: "#5b4fcf" }}
            >
              {userInitial}
            </div>
          </button>
        </div>
      </div>

      {/* ── Tablet search row — md to lg only ── */}
      <div className="hidden md:flex lg:hidden px-4 pb-3">
        {config.middle}
      </div>

      {/* ── Mobile search row ── */}
      <div className="md:hidden px-4 pb-3">{config.middle}</div>

      {/* Notification modal */}
      {showNotifModal && (
        <NotificationModal
          onClose={() => setShowNotifModal(false)}
          onCountChange={(count) => setNotifCount(count)}
        />
      )}
    </header>
  );
}