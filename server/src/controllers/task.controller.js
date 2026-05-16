const db = require("../config/db");

const getTaskById = async (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;

  try {
    const [[task]] = await db.query(
      `SELECT t.*, t.is_repeated AS \`repeat\`, u.name AS assignee_name, u.email AS assignee_email
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ? AND t.user_id = ?`,
      [taskId, userId]
    );
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getTasks = async (req, res) => {
  const userId = req.user.userId;
  const { status, priority, category, sort, search } = req.query;

  // 1. Extract pagination parameters
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * limit;

  try {
    // 2. Build the shared WHERE clause and params
    let baseWhere = "WHERE user_id = ?";
    let params = [userId];

    if (status) {
      baseWhere += " AND status = ?";
      params.push(status);
    }
    if (priority) {
      baseWhere += " AND priority = ?";
      params.push(priority);
    }
    if (category) {
      baseWhere += " AND category = ?";
      params.push(category);
    }
    if (search) {
      baseWhere += " AND title LIKE ?";
      params.push(`%${search}%`);
    }
    if (req.query.due_date) {
      baseWhere += " AND due_date = ?";
      params.push(req.query.due_date);
    }

    // 3. Get total count using the same filters
    const [[{ totalCount }]] = await db.query(
      `SELECT COUNT(*) as totalCount FROM tasks ${baseWhere}`,
      params,
    );

    // 4. Determine Sort Order
    let orderBy = "ORDER BY created_at DESC";

    if (sort === "due_earliest") {
      orderBy = "ORDER BY due_date IS NULL, due_date ASC";
    }

    if (sort === "due_latest") {
      orderBy = "ORDER BY due_date IS NULL, due_date DESC";
    }

    if (sort === "priority") {
      orderBy = `
    ORDER BY 
      CASE 
        WHEN priority = 'high' THEN 3
        WHEN priority = 'medium' THEN 2
        WHEN priority = 'low' THEN 1
        ELSE 0
      END DESC
  `;
    }

    // 5. Execute main query with pagination
    const [tasks] = await db.query(
      `SELECT t.*, t.is_repeated AS \`repeat\`, u.name AS assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       ${baseWhere} ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    // 6. Return response with total
    res.json({
      success: true,
      tasks,
      total: totalCount,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const createTask = async (req, res) => {
  const userId = req.user.userId;
  const {
    title,
    description,
    status,
    priority,
    category,
    due_date,
    due_time,
    assigned_to,
    tags,
    repeat,
    reminder_at,
  } = req.body;

  try {
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const [result] = await db.query(
      `INSERT INTO tasks
        (user_id, assigned_to, title, description, status, priority, category, due_date, due_time, tags, is_repeated, reminder_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        assigned_to || null,
        title,
        description || null,
        status || "todo",
        priority || "none",
        category || "others",
        due_date || null,
        due_time || null,
        tags || null,
        repeat || "none",
        reminder_at || null,
      ],
    );

    const [newTask] = await db.query(
      "SELECT *, is_repeated AS `repeat` FROM tasks WHERE id = ?",
      [result.insertId],
    );

    await db.query(
      "INSERT INTO activity_log (task_id, user_id, action) VALUES (?, ?, ?)",
      [result.insertId, userId, "created this task"]
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;
  const {
    title,
    description,
    status,
    priority,
    category,
    due_date,
    due_time,
    assigned_to,
    tags,
    repeat,
    reminder_at,
  } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT *, is_repeated AS `repeat` FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, userId],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const task = existing[0];

    // Collect changes for activity log
    const STATUS_LABELS = { todo: "Todo", in_progress: "In Progress", done: "Done" };
    const changes = [];
    if (title && title.trim() !== task.title) changes.push(`renamed task to "${title.trim()}"`);
    if (status && status !== task.status) changes.push(`changed status to "${STATUS_LABELS[status] || status}"`);
    if (priority && priority !== task.priority) changes.push(`changed priority to "${priority}"`);
    if (category && category !== task.category) changes.push(`changed category to "${category}"`);
    if (description !== undefined && description !== task.description) changes.push("updated description");

    await db.query(
      `UPDATE tasks SET
        title = ?, description = ?, status = ?,
        priority = ?, category = ?, due_date = ?,
        due_time = ?, assigned_to = ?, tags = ?,
        is_repeated = ?, reminder_at = ?
       WHERE id = ? AND user_id = ?`,
      [
        title || task.title,
        description || task.description,
        status || task.status,
        priority || task.priority,
        category || task.category,
        due_date || task.due_date,
        due_time || task.due_time,
        assigned_to !== undefined ? assigned_to : task.assigned_to,
        tags !== undefined ? tags : task.tags,
        repeat || task.repeat || "none",
        reminder_at !== undefined ? reminder_at : task.reminder_at,
        taskId,
        userId,
      ],
    );

    for (const action of changes) {
      await db.query(
        "INSERT INTO activity_log (task_id, user_id, action) VALUES (?, ?, ?)",
        [taskId, userId, action]
      );
    }

    const [updated] = await db.query(
      "SELECT *, is_repeated AS `repeat` FROM tasks WHERE id = ?",
      [taskId],
    );

    res.json({
      success: true,
      message: "Task updated successfully",
      task: updated[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;

  try {
    const [existing] = await db.query(
      "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
      [taskId, userId],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await db.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [
      taskId,
      userId,
    ]);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const bulkAction = async (req, res) => {
  const userId = req.user.userId;
  const { taskIds, action } = req.body;

  try {
    if (!taskIds || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No tasks selected",
      });
    }

    if (action === "delete") {
      await db.query(`DELETE FROM tasks WHERE id IN (?) AND user_id = ?`, [
        taskIds,
        userId,
      ]);

      return res.json({
        success: true,
        message: "Tasks deleted successfully",
      });
    }

    if (action === "done") {
      await db.query(
        `UPDATE tasks SET status = 'done' WHERE id IN (?) AND user_id = ?`,
        [taskIds, userId],
      );

      return res.json({
        success: true,
        message: "Tasks marked as done",
      });
    }

    if (action === "priority") {
      const { priority } = req.body;

      await db.query(
        `UPDATE tasks SET priority = ? WHERE id IN (?) AND user_id = ?`,
        [priority, taskIds, userId],
      );

      return res.json({
        success: true,
        message: "Priority updated successfully",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid action",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getDashboard = async (req, res) => {
  const userId = req.user.userId;

  try {
    const today = new Date().toISOString().split("T")[0];

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM tasks WHERE user_id = ?`,
      [userId],
    );

    const [[{ completed }]] = await db.query(
      `SELECT COUNT(*) as completed FROM tasks WHERE user_id = ? AND status = "done"`,
      [userId],
    );

    const [[{ pending }]] = await db.query(
      'SELECT COUNT(*) as pending FROM tasks WHERE user_id = ? AND status != "done"',
      [userId],
    );

    const [[{ overdue }]] = await db.query(
      'SELECT COUNT(*) as overdue FROM tasks WHERE user_id = ? AND due_date < ? AND status != "done"',
      [userId, today],
    );

    const [recentTasks] = await db.query(
      "SELECT *, is_repeated AS `repeat` FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [userId],
    );

    const [byCategory] = await db.query(
      "SELECT category, COUNT(*) as count FROM tasks WHERE user_id = ? GROUP BY category",
      [userId],
    );

    const [weeklyActivity] = await db.query(
      `SELECT DAYNAME(created_at) as day, COUNT(*) as count 
       FROM tasks 
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DAYNAME(created_at), DAYOFWEEK(created_at)
       ORDER BY DAYOFWEEK(created_at)`,
      [userId],
    );

    // Last week total for growth comparison
    const [[{ lastWeekTotal }]] = await db.query(
      `SELECT COUNT(*) as lastWeekTotal FROM tasks
       WHERE user_id = ?
       AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId],
    );

    res.json({
      success: true,
      stats: { total, completed, pending, overdue },
      recentTasks,
      byCategory,
      weeklyActivity,
      lastWeekTotal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getTaskById,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  bulkAction,
  getDashboard,
};
