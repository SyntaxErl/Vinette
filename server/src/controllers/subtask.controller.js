const db = require('../config/db')

const getSubtasks = async (req, res) => {
  const userId = req.user.userId
  const taskId = req.params.taskId

  try {
    const [[task]] = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    )
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })

    const [subtasks] = await db.query(
      'SELECT *, is_done AS is_completed FROM subtasks WHERE task_id = ? ORDER BY created_at ASC',
      [taskId]
    )
    res.json({ success: true, subtasks })
  } catch (error) {
    console.error('[getSubtasks]', error)
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

const createSubtask = async (req, res) => {
  const userId = req.user.userId
  const taskId = req.params.taskId
  const { title } = req.body

  try {
    const [[task]] = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    )
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' })

    const [result] = await db.query(
      'INSERT INTO subtasks (task_id, title, is_done) VALUES (?, ?, 0)',
      [taskId, title.trim()]
    )
    const [[newSubtask]] = await db.query(
      'SELECT *, is_done AS is_completed FROM subtasks WHERE id = ?',
      [result.insertId]
    )

    await db.query(
      'INSERT INTO activity_log (task_id, user_id, action) VALUES (?, ?, ?)',
      [taskId, userId, `added subtask "${title.trim()}"`]
    )

    res.status(201).json({ success: true, subtask: newSubtask })
  } catch (error) {
    console.error('[createSubtask]', error)
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

const toggleSubtask = async (req, res) => {
  const userId = req.user.userId
  const { taskId, subtaskId } = req.params

  try {
    const [[task]] = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    )
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })

    const [[subtask]] = await db.query(
      'SELECT * FROM subtasks WHERE id = ? AND task_id = ?',
      [subtaskId, taskId]
    )
    if (!subtask) return res.status(404).json({ success: false, message: 'Subtask not found' })

    const newValue = subtask.is_done ? 0 : 1
    await db.query('UPDATE subtasks SET is_done = ? WHERE id = ?', [newValue, subtaskId])

    const action = newValue
      ? `completed subtask "${subtask.title}"`
      : `unchecked subtask "${subtask.title}"`
    await db.query(
      'INSERT INTO activity_log (task_id, user_id, action) VALUES (?, ?, ?)',
      [taskId, userId, action]
    )

    res.json({ success: true, subtask: { ...subtask, is_done: newValue, is_completed: newValue } })
  } catch (error) {
    console.error('[toggleSubtask]', error)
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

const deleteSubtask = async (req, res) => {
  const userId = req.user.userId
  const { taskId, subtaskId } = req.params

  try {
    const [[task]] = await db.query(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    )
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' })

    const [[subtask]] = await db.query(
      'SELECT * FROM subtasks WHERE id = ? AND task_id = ?',
      [subtaskId, taskId]
    )
    if (!subtask) return res.status(404).json({ success: false, message: 'Subtask not found' })

    await db.query('DELETE FROM subtasks WHERE id = ?', [subtaskId])

    await db.query(
      'INSERT INTO activity_log (task_id, user_id, action) VALUES (?, ?, ?)',
      [taskId, userId, `deleted subtask "${subtask.title}"`]
    )

    res.json({ success: true, message: 'Subtask deleted' })
  } catch (error) {
    console.error('[deleteSubtask]', error)
    res.status(500).json({ success: false, message: 'Server error', error: error.message })
  }
}

module.exports = { getSubtasks, createSubtask, toggleSubtask, deleteSubtask }
