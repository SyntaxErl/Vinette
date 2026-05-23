const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  markRead,
  markAllRead,
  clearAll,
} = require("../controllers/notification.controller");

router.get("/", authMiddleware, getNotifications);
router.patch("/read-all", authMiddleware, markAllRead);
router.patch("/:id/read", authMiddleware, markRead);
router.delete("/", authMiddleware, clearAll);

module.exports = router;
