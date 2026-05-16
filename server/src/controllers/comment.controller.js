const db = require('../config/db')

const getComments = async (req, res) => {
  const userId = req.user.userId
  const taskId = req.params.taskId

  try {
    const [[task]] = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
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
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
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

    res.status(201).json({ success: true, comment: newComment })
  } catch (error) {
    console.error('[createComment]', error)
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

module.exports = { getComments, createComment }
