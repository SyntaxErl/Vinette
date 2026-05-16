const db = require('../config/db')

const getActivity = async (req, res) => {
  const userId = req.user.userId
  const taskId = req.params.taskId

  try {
    const [[task]] = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    )
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })

    const [activity] = await db.query(
      `SELECT a.*, u.name AS actor_name, u.avatar AS actor_avatar
       FROM activity_log a
       JOIN users u ON a.user_id = u.id
       WHERE a.task_id = ?
       ORDER BY a.created_at ASC`,
      [taskId]
    )

    res.json({ success: true, activity })
  } catch (error) {
    console.error('[getActivity]', error)
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

module.exports = { getActivity }
