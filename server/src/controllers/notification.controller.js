const db = require("../config/db");

const getNotifications = async (req, res) => {
  const userId = req.user.userId;
  const unreadOnly = req.query.unread === "true";

  try {
    const where = unreadOnly ? "WHERE user_id = ? AND is_read = 0" : "WHERE user_id = ?";
    const [notifications] = await db.query(
      `SELECT n.*, u.name AS actor_name, u.avatar AS actor_avatar
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       ${where}
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId],
    );
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0",
      [userId],
    );
    res.json({ success: true, notifications, count });
  } catch (error) {
    console.error("[getNotifications]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const markRead = async (req, res) => {
  const userId = req.user.userId;
  try {
    await db.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [req.params.id, userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("[markRead]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const markAllRead = async (req, res) => {
  const userId = req.user.userId;
  try {
    await db.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("[markAllRead]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const clearAll = async (req, res) => {
  const userId = req.user.userId;
  try {
    await db.query("DELETE FROM notifications WHERE user_id = ?", [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error("[clearAll]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { getNotifications, markRead, markAllRead, clearAll };
