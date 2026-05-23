const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getTeam,
  getAssignableUsers,
  inviteMember,
  resendInvite,
  acceptInvite,
  removeMember,
  updateMemberRole,
  getMemberTasks,
  getMemberActivity,
  getInviteLink,
  regenerateInviteLink,
  joinTeam,
} = require("../controllers/team.controller");

// Specific routes before param routes.
router.get("/members", authMiddleware, getTeam);
router.get("/assignable", authMiddleware, getAssignableUsers);

// Shareable invite link flow
router.get("/invite-link", authMiddleware, getInviteLink);
router.post("/invite-link/regenerate", authMiddleware, regenerateInviteLink);
router.post("/join", authMiddleware, joinTeam);

// Legacy email-invite flow (kept for compatibility)
router.post("/invite", authMiddleware, inviteMember);
router.post("/accept", authMiddleware, acceptInvite);
router.post("/resend/:id", authMiddleware, resendInvite);

// :userId = member user id (task/activity lookups, scoped to caller's own tasks)
router.get("/members/:userId/tasks", authMiddleware, getMemberTasks);
router.get("/members/:userId/activity", authMiddleware, getMemberActivity);

// :id = membership row id (mutations)
router.put("/members/:id/role", authMiddleware, updateMemberRole);
router.delete("/members/:id", authMiddleware, removeMember);

module.exports = router;
