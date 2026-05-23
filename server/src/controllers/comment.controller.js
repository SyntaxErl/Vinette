const db = require('../config/db')
const { createNotification } = require('../utils/notify')

const getComments = async (req, res) => {
  const userId = req.user.userId
  const taskId = req.params.taskId

  try {
    const [[task]] = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND (user_id = ? OR assigned_to = ?)',
      [taskId, userId, userId]
    )
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })

    const [comments] = await db.query(
      `SELECT c.*, c.body AS content, u.name AS author_name, u.avatar AS author_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
      [taskId]
    )
    res.json({ success: true, comments })
  } catch (error) {
    console.error('[getComments]', error)
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

const createComment = async (req, res) => {
  const userId = req.user.userId
  const taskId = req.params.taskId
  const { content } = req.body

  try {
    const [[task]] = await db.query(
      'SELECT id, user_id, assigned_to, title FROM tasks WHERE id = ? AND (user_id = ? OR assigned_to = ?)',
      [taskId, userId, userId]
    )
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Comment cannot be empty' })

    const [result] = await db.query(
      'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)',
      [taskId, userId, content.trim()]
    )

    const [[newComment]] = await db.query(
      `SELECT c.*, c.body AS content, u.name AS author_name, u.avatar AS author_avatar
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.insertId]
    )

    await db.query(
      'INSERT INTO activity_log (task_id, user_id, action) VALUES (?, ?, ?)',
      [taskId, userId, 'added a comment']
    )

    // Notify the task owner + assignee (except the commenter).
    const [[actor]] = await db.query('SELECT name FROM users WHERE id = ?', [userId])
    const recipients = [...new Set([task.user_id, task.assigned_to].filter((uid) => uid && Number(uid) !== userId))]
    for (const rid of recipients) {
      await createNotification({
        userId: rid,
        actorId: userId,
        type: 'comment',
        title: 'New comment',
        message: `${actor?.name || 'Someone'} commented on "${task.title}"`,
        relatedTaskId: taskId,
      })
    }

    res.status(201).json({ success: true, comment: newComment })
  } catch (error) {
    console.error('[createComment]', error)
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

module.exports = { getComments, createComment }
