import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useTaskStore from "../store/taskStore";
import useNotificationStore from "../store/notificationStore";

const timeAgo = (ts) => {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const TYPE_ICON = {
  task: { icon: "check_box", color: "#5b4fcf" },
  mention: { icon: "alternate_email", color: "#0ea5e9" },
  comment: { icon: "chat_bubble", color: "#10b981" },
  default: { icon: "notifications", color: "#6b7280" },
};


export default function NotificationModal({ onClose }) {
  const navigate = useNavigate();
  const openTaskDetail = useTaskStore((s) => s.openTaskDetail);
  const modalRef = useRef(null);

  // Store-backed cache (shared with the Notifications page). The list is fetched
  // once and reused; fetchNotifications is a no-op cache hit when already loaded,
  // and the socket keeps it fresh.
  const notifications = useNotificationStore((s) => s.notifications);
  const loading = useNotificationStore((s) => s.notificationsLoading);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  const list = notifications ?? [];
  const isLoading = loading && notifications === null;

  // Fetch on open (cache hit if already loaded).
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Click-outside closes modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markRead(notif.id);
    if (notif.related_task_id) {
      openTaskDetail(notif.related_task_id);
      onClose();
    }
  };

  const unreadCount = list.filter((n) => !n.is_read).length;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-start justify-center sm:justify-end pt-16 sm:pr-6 px-4 sm:px-0"
      style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
    >
      {/* Modal panel */}
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm flex flex-col"
        style={{
          maxHeight: "calc(100vh - 80px)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span
                className="text-xs font-bold text-white px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "#ef4444" }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 rounded-lg hover:bg-purple-50 transition font-medium"
              >
                Mark all read
              </button>
            )}
            {list.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition font-medium"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition ml-1"
              aria-label="Close"
            >
              <span
                className="material-icons text-gray-400"
                style={{ fontSize: "18px" }}
              >
                close
              </span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <span
                className="material-icons text-gray-300 animate-spin"
                style={{ fontSize: "28px" }}
              >
                autorenew
              </span>
            </div>
          )}

          {!isLoading && list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <span
                className="material-icons text-gray-200 mb-2"
                style={{ fontSize: "40px" }}
              >
                notifications_off
              </span>
              <p className="text-sm font-medium text-gray-400">
                You're all caught up!
              </p>
              <p className="text-xs text-gray-300 mt-1">
                No notifications yet.
              </p>
            </div>
          )}

          {!isLoading && list.length > 0 && (
            <ul>
              {list.map((notif) => {
                const { icon, color } =
                  TYPE_ICON[notif.type] ?? TYPE_ICON.default;
                const isUnread = !notif.is_read;
                return (
                  <li
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition border-b border-gray-50 last:border-0
                      ${isUnread ? "bg-purple-50/40 hover:bg-purple-50" : "hover:bg-gray-50"}`}
                  >
                    {/* Type icon */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${color}18` }}
                    >
                      <span
                        className="material-icons"
                        style={{ fontSize: "16px", color }}
                      >
                        {icon}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}
                      >
                        {notif.title}
                      </p>
                      {notif.message && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {timeAgo(notif.created_at)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {isUnread && (
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: "#5b4fcf" }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-3">
          <button
            onClick={() => {
              navigate("/notifications");
              onClose();
            }}
            className="w-full text-center text-sm font-medium text-purple-600 hover:text-purple-800 transition"
          >
            View all notifications →
          </button>
        </div>
      </div>
    </div>
  );
}
