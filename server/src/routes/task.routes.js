const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getTaskById,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  bulkAction,
  getDashboard,
} = require("../controllers/task.controller");

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.patch("/bulk", authMiddleware, bulkAction);
router.get("/dashboard/stats", authMiddleware, getDashboard);
router.get("/:id", authMiddleware, getTaskById);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;
