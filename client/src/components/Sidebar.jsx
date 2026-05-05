import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import api from "../api/axios";

const navItems = [
  { path: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { path: "/board", icon: "view_kanban", label: "Board" },
  { path: "/tasks", icon: "check_box", label: "My Tasks" },
  { path: "/calendar", icon: "calendar_month", label: "Calendar" },
  { path: "/analytics", icon: "bar_chart", label: "Analytics" },
  { path: "/team", icon: "group", label: "Team / Members" },
  { path: "/notifications", icon: "notifications", label: "Notifications" },
  { path: "/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get("/notifications", {
          signal: controller.signal,
        });
        const unread = res.data.notifications?.filter((n) => !n.is_read) || [];
        setUnreadCount(unread.length);
      } catch (err) {
        if (err.name !== "CanceledError") setUnreadCount(0);
      }
    };
    fetchUnreadCount();
    return () => controller.abort();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.25)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-30
          flex flex-col h-screen w-64 border-r border-gray-100 bg-white
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="font-bold text-lg" style={{ color: "#5b4fcf" }}>
              TaskFlow
            </span>
          </div>

          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-600"
          >
            <span className="material-icons" style={{ fontSize: "22px" }}>
              close
            </span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "text-purple-700 bg-purple-50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="material-icons"
                        style={{
                          fontSize: "20px",
                          color: isActive ? "#5b4fcf" : undefined,
                        }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>

                      {/* Dynamic notification badge */}
                      {item.path === "/notifications" && unreadCount > 0 && (
                        <span
                          className="ml-auto text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: "#ef4444" }}
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User profile */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: "#5b4fcf" }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || ""}
              </p>
            </div>

            <span
              className="material-icons text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors cursor-pointer"
              style={{ fontSize: "18px" }}
              onClick={handleLogout}
              title="Logout"
            >
              logout
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
