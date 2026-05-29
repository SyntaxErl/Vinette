const db = require("../config/db");
const { createNotification } = require("../utils/notify");

const getTaskById = async (req, res) => {
  const userId = req.user.userId;
  const taskId = req.params.id;

  try {
    const [[task]] = await db.query(
      `SELECT t.*, t.is_repeated AS \`repeat\`, u.name AS assignee_name, u.email AS assignee_email
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ? AND (t.user_id = ? OR t.assigned_to = ?)`,
      [taskId, userId, userId]
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
    // Tasks you own OR tasks assigned to you (so assignees see their work).
    let baseWhere = "WHERE (user_id = ? OR assigned_to = ?)";
    let params = [userId, userId];

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

    // Notify the assignee (unless you assigned it to yourself).
    if (assigned_to && Number(assigned_to) !== userId) {
      const [[actor]] = await db.query("SELECT name FROM users WHERE id = ?", [userId]);
      await createNotification({
        userId: assigned_to,
        actorId: userId,
        type: "task",
        title: "Task assigned to you",
        message: `${actor?.name || "Someone"} assigned you "${title}"`,
        relatedTaskId: result.insertId,
      });
    }

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
      "SELECT *, is_repeated AS `repeat` FROM tasks WHERE id = ? AND (user_id = ? OR assigned_to = ?)",
      [taskId, userId, userId],
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
       WHERE id = ? AND (user_id = ? OR assigned_to = ?)`,
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
        userId,
      ],
    );

    for (const action of changes) {
      await db.query(
        "INSERT INTO activity_log (task_id, user_id, action) VALUES (?, ?, ?)",
        [taskId, userId, action]
      );
    }

    // Notifications: reassignment + completion
    const notifTitle = title || task.title;
    let actorName = null;
    const getActor = async () => {
      if (actorName === null) {
        const [[actor]] = await db.query("SELECT name FROM users WHERE id = ?", [userId]);
        actorName = actor?.name || "Someone";
      }
      return actorName;
    };

    if (
      assigned_to !== undefined && assigned_to &&
      Number(assigned_to) !== Number(task.assigned_to) &&
      Number(assigned_to) !== userId
    ) {
      await createNotification({
        userId: assigned_to,
        actorId: userId,
        type: "task",
        title: "Task assigned to you",
        message: `${await getActor()} assigned you "${notifTitle}"`,
        relatedTaskId: taskId,
      });
    }
    if (status && status === "done" && task.status !== "done" && Number(task.user_id) !== userId) {
      await createNotification({
        userId: task.user_id,
        actorId: userId,
        type: "task",
        title: "Task completed",
        message: `${await getActor()} completed "${notifTitle}"`,
        relatedTaskId: taskId,
      });
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
      `SELECT COUNT(*) as total FROM tasks WHERE (user_id = ? OR assigned_to = ?)`,
      [userId, userId],
    );

    const [[{ completed }]] = await db.query(
      `SELECT COUNT(*) as completed FROM tasks WHERE (user_id = ? OR assigned_to = ?) AND status = 'done'`,
      [userId, userId],
    );

    const [[{ pending }]] = await db.query(
      `SELECT COUNT(*) as pending FROM tasks WHERE (user_id = ? OR assigned_to = ?) AND status != 'done'`,
      [userId, userId],
    );

    const [[{ overdue }]] = await db.query(
      `SELECT COUNT(*) as overdue FROM tasks WHERE (user_id = ? OR assigned_to = ?) AND due_date < ? AND status != 'done'`,
      [userId, userId, today],
    );

    const [recentTasks] = await db.query(
      "SELECT *, is_repeated AS `repeat` FROM tasks WHERE (user_id = ? OR assigned_to = ?) ORDER BY created_at DESC LIMIT 5",
      [userId, userId],
    );

    const [byCategory] = await db.query(
      "SELECT category, COUNT(*) as count FROM tasks WHERE (user_id = ? OR assigned_to = ?) GROUP BY category",
      [userId, userId],
    );

    const [weeklyActivity] = await db.query(
      `SELECT DAYNAME(created_at) as day, COUNT(*) as count
       FROM tasks
       WHERE (user_id = ? OR assigned_to = ?) AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DAYNAME(created_at), DAYOFWEEK(created_at)
       ORDER BY DAYOFWEEK(created_at)`,
      [userId, userId],
    );

    const [[{ lastWeekTotal }]] = await db.query(
      `SELECT COUNT(*) as lastWeekTotal FROM tasks
       WHERE (user_id = ? OR assigned_to = ?)
       AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
       AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId, userId],
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

// The activity_log row written when a task is moved to Done (see updateTask).
// We use it as the only available "completed at" signal, since tasks have no
// completed_at / updated_at column — only created_at.
const DONE_ACTION = 'changed status to "Done"';

const getAnalytics = async (req, res) => {
  const userId = req.user.userId;
  const owner = [userId, userId];

  try {
    // ── Totals ────────────────────────────────────────────────────────────
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) total FROM tasks WHERE (user_id = ? OR assigned_to = ?)",
      owner,
    );
    const [[{ completed }]] = await db.query(
      "SELECT COUNT(*) completed FROM tasks WHERE (user_id = ? OR assigned_to = ?) AND status = 'done'",
      owner,
    );
    const [[{ overdue }]] = await db.query(
      `SELECT COUNT(*) overdue FROM tasks
       WHERE (user_id = ? OR assigned_to = ?)
       AND status != 'done' AND due_date IS NOT NULL AND due_date < CURDATE()`,
      owner,
    );

    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    // ── Distributions ─────────────────────────────────────────────────────
    const [byPriority] = await db.query(
      "SELECT priority, COUNT(*) count FROM tasks WHERE (user_id = ? OR assigned_to = ?) GROUP BY priority",
      owner,
    );
    const [byCategory] = await db.query(
      "SELECT category, COUNT(*) count FROM tasks WHERE (user_id = ? OR assigned_to = ?) GROUP BY category",
      owner,
    );

    // First time each task was marked Done — our "completed at" timeline.
    const doneEvents = `
      SELECT a.task_id, MIN(a.created_at) AS doneAt
      FROM activity_log a
      JOIN tasks t ON t.id = a.task_id
      WHERE (t.user_id = ? OR t.assigned_to = ?) AND a.action = ?
      GROUP BY a.task_id`;
    const doneParams = [...owner, DONE_ACTION];

    // ── Completed: last 30 days vs the 30 before that ─────────────────────
    const [[{ c30 }]] = await db.query(
      `SELECT COUNT(*) c30 FROM (${doneEvents}) d
       WHERE d.doneAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      doneParams,
    );
    const [[{ cPrev30 }]] = await db.query(
      `SELECT COUNT(*) cPrev30 FROM (${doneEvents}) d
       WHERE d.doneAt >= DATE_SUB(NOW(), INTERVAL 60 DAY)
       AND d.doneAt < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      doneParams,
    );

    // ── Average completion time (days), created_at → first doneAt ─────────
    const [[{ avgDays }]] = await db.query(
      `SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR, t.created_at, d.doneAt)) / 24, 1) avgDays
       FROM (${doneEvents}) d JOIN tasks t ON t.id = d.task_id
       WHERE d.doneAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      doneParams,
    );
    const [[{ avgDaysPrev }]] = await db.query(
      `SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR, t.created_at, d.doneAt)) / 24, 1) avgDaysPrev
       FROM (${doneEvents}) d JOIN tasks t ON t.id = d.task_id
       WHERE d.doneAt >= DATE_SUB(NOW(), INTERVAL 60 DAY)
       AND d.doneAt < DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      doneParams,
    );

    // ── Weekly buckets (last 5 rolling 7-day windows) ─────────────────────
    // wago 0 = this week (last 7 days), 1 = the week before, … up to 4.
    const [doneWeeks] = await db.query(
      `SELECT FLOOR(DATEDIFF(CURDATE(), DATE(d.doneAt)) / 7) wago, COUNT(*) completed
       FROM (${doneEvents}) d
       WHERE d.doneAt >= DATE_SUB(CURDATE(), INTERVAL 34 DAY)
       GROUP BY wago`,
      doneParams,
    );
    const [createdWeeks] = await db.query(
      `SELECT FLOOR(DATEDIFF(CURDATE(), DATE(created_at)) / 7) wago, COUNT(*) created
       FROM tasks
       WHERE (user_id = ? OR assigned_to = ?)
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 34 DAY)
       GROUP BY wago`,
      owner,
    );

    const doneByWago = Object.fromEntries(doneWeeks.map((r) => [r.wago, r.completed]));
    const createdByWago = Object.fromEntries(createdWeeks.map((r) => [r.wago, r.created]));

    const today = new Date();
    const fmt = (d) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    // Build 5 points, oldest → newest, so the line reads left-to-right.
    const completionTrend = [];
    for (let wago = 4; wago >= 0; wago--) {
      const end = new Date(today);
      end.setDate(end.getDate() - wago * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      const c = doneByWago[wago] || 0;
      const cr = createdByWago[wago] || 0;
      completionTrend.push({
        label: `${fmt(start)} - ${fmt(end)}`,
        completed: c,
        created: cr,
        // "That week's throughput" — completed vs created, capped at 100%.
        rate: cr ? Math.min(100, Math.round((c / cr) * 100)) : 0,
      });
    }

    const thisWeekCompleted = doneByWago[0] || 0;
    const lastWeekCompleted = doneByWago[1] || 0;

    // ── Most productive weekday (by completions, last 30 days) ────────────
    const [[bestRow]] = await db.query(
      `SELECT DAYNAME(d.doneAt) day, COUNT(*) c FROM (${doneEvents}) d
       WHERE d.doneAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DAYNAME(d.doneAt), DAYOFWEEK(d.doneAt)
       ORDER BY c DESC LIMIT 1`,
      doneParams,
    );

    // ── Productivity score (0–100), transparent blend ─────────────────────
    //   60% how much you finish · 25% staying on time · 15% recent throughput
    const onTimeRate = total ? (1 - overdue / total) * 100 : 100;
    const activityRate = Math.min(100, (c30 / 30) * 100); // ~1 completion/day target
    const productivityScore = Math.round(
      completionRate * 0.6 + onTimeRate * 0.25 + activityRate * 0.15,
    );

    res.json({
      success: true,
      summary: {
        total,
        completed,
        overdue,
        completionRate,
        completedThis30: c30,
        completedPrev30: cPrev30,
        avgCompletionDays: avgDays, // null when nothing completed in window
        avgCompletionDaysPrev: avgDaysPrev,
        productivityScore,
      },
      completionTrend,
      byPriority,
      byCategory,
      weeklyPerformance: {
        thisWeek: thisWeekCompleted,
        lastWeek: lastWeekCompleted,
      },
      bestDay: bestRow?.day || null,
    });
  } catch (error) {
    console.error("[getAnalytics]", error);
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
  getAnalytics,
};
