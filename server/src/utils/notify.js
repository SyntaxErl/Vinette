const db = require("../config/db");
const { emitToUser } = require("../realtime/socket");

// Persist a notification and push it to the recipient in real time.
async function createNotification({ userId, actorId = null, type = "task", title, message = null, relatedTaskId = null }) {
  if (!userId) return null;
  try {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, actor_id, type, title, message, related_task_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, actorId, type, title, message, relatedTaskId],
    );
    const notification = {
      id: result.insertId,
      user_id: userId,
      actor_id: actorId,
      type,
      title,
      message,
      related_task_id: relatedTaskId,
      is_read: 0,
      created_at: new Date(),
    };
    emitToUser(userId, "notification:new", notification);
    return notification;
  } catch (error) {
    console.error("[createNotification]", error);
    return null;
  }
}

module.exports = { createNotification };
