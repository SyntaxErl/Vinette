const crypto = require("crypto");
const db = require("../config/db");
const presence = require("../realtime/presence");
const { sendInviteEmail } = require("../utils/email");

// Shape an active membership row (or the synthesized owner) for the client.
function shapeMember({ rowId, userId, name, email, avatar, role, joined_at, last_active, isOwner = false }) {
  return {
    rowId,
    userId,
    name,
    email,
    avatar: avatar || null,
    role,
    status: presence.getStatus(userId),
    joined_at,
    last_active: last_active || null,
    isOwner,
    isPending: false,
  };
}

const getTeam = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [[owner]] = await db.query(
      "SELECT id, name, email, avatar, created_at FROM users WHERE id = ?",
      [userId],
    );

    const [rows] = await db.query(
      `SELECT tm.id, tm.member_id, tm.role, tm.status, tm.invite_email, tm.joined_at,
              u.name AS member_name, u.email AS member_email, u.avatar AS member_avatar,
              u.last_active AS last_active
       FROM team_members tm
       LEFT JOIN users u ON tm.member_id = u.id
       WHERE tm.owner_id = ?
       ORDER BY tm.joined_at ASC`,
      [userId],
    );

    // Owner is always the top admin row.
    const members = [
      shapeMember({
        rowId: null,
        userId: owner.id,
        name: owner.name,
        email: owner.email,
        avatar: owner.avatar,
        role: "admin",
        joined_at: owner.created_at,
        isOwner: true,
      }),
    ];
    const pending = [];

    for (const r of rows) {
      if (r.status === "active" && r.member_id) {
        members.push(
          shapeMember({
            rowId: r.id,
            userId: r.member_id,
            name: r.member_name,
            email: r.member_email,
            avatar: r.member_avatar,
            role: r.role,
            joined_at: r.joined_at,
            last_active: r.last_active,
          }),
        );
      } else {
        pending.push({
          rowId: r.id,
          userId: r.member_id || null,
          name: r.member_name || null,
          email: r.member_email || r.invite_email,
          avatar: r.member_avatar || null,
          role: r.role,
          status: "pending",
          joined_at: r.joined_at,
          isOwner: false,
          isPending: true,
        });
      }
    }

    const admins = members.filter((m) => m.role === "admin").length;
    const stats = {
      total: members.length + pending.length,
      active: members.length,
      pending: pending.length,
      admins,
    };

    res.json({ success: true, members, pending, stats });
  } catch (error) {
    console.error("[getTeam]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const inviteMember = async (req, res) => {
  const userId = req.user.userId;
  const role = req.body.role === "admin" ? "admin" : "member";
  const email = (req.body.email || "").trim().toLowerCase();

  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "A valid email is required" });
    }

    const [[me]] = await db.query("SELECT name, email FROM users WHERE id = ?", [userId]);
    if (email === me.email.toLowerCase()) {
      return res.status(400).json({ success: false, message: "You can't invite yourself" });
    }

    // Does this email belong to an existing account?
    const [[existingUser]] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    const memberId = existingUser ? existingUser.id : null;

    // Already invited / already a member?
    const [[dup]] = await db.query(
      `SELECT id FROM team_members
       WHERE owner_id = ? AND (invite_email = ? OR (member_id IS NOT NULL AND member_id = ?))`,
      [userId, email, memberId || 0],
    );
    if (dup) {
      return res.status(409).json({ success: false, message: "That person is already invited or a member" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const [result] = await db.query(
      `INSERT INTO team_members (owner_id, member_id, role, status, invite_email, invite_token, token_expires)
       VALUES (?, ?, ?, 'pending', ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [userId, memberId, role, email, token],
    );

    let emailSent = true;
    let previewUrl = null;
    try {
      const result2 = await sendInviteEmail({ to: email, token, inviterName: me.name });
      previewUrl = result2?.previewUrl || null;
    } catch (mailErr) {
      emailSent = false;
      console.error("[inviteMember:email]", mailErr);
    }

    res.status(201).json({
      success: true,
      message: emailSent ? "Invitation sent" : "Invite created, but the email failed to send",
      emailSent,
      previewUrl,
      invite: {
        rowId: result.insertId,
        userId: memberId,
        email,
        name: null,
        role,
        status: "pending",
        isPending: true,
      },
    });
  } catch (error) {
    console.error("[inviteMember]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const resendInvite = async (req, res) => {
  const userId = req.user.userId;
  const rowId = req.params.id;

  try {
    const [[row]] = await db.query(
      "SELECT * FROM team_members WHERE id = ? AND owner_id = ? AND status = 'pending'",
      [rowId, userId],
    );
    if (!row) {
      return res.status(404).json({ success: false, message: "Pending invite not found" });
    }

    const [[me]] = await db.query("SELECT name FROM users WHERE id = ?", [userId]);
    const token = crypto.randomBytes(24).toString("hex");
    await db.query(
      "UPDATE team_members SET invite_token = ?, token_expires = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE id = ?",
      [token, rowId],
    );

    let emailSent = true;
    let previewUrl = null;
    try {
      const result = await sendInviteEmail({ to: row.invite_email, token, inviterName: me.name });
      previewUrl = result?.previewUrl || null;
    } catch (mailErr) {
      emailSent = false;
      console.error("[resendInvite:email]", mailErr);
    }

    res.json({
      success: true,
      message: emailSent ? "Invitation resent" : "Could not resend the email",
      emailSent,
      previewUrl,
    });
  } catch (error) {
    console.error("[resendInvite]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// The invitee (logged in) accepts via the token from the email link.
const acceptInvite = async (req, res) => {
  const userId = req.user.userId;
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ success: false, message: "Missing token" });
    }

    const [[row]] = await db.query(
      `SELECT * FROM team_members
       WHERE invite_token = ? AND status = 'pending'
       AND (token_expires IS NULL OR token_expires > NOW())`,
      [token],
    );
    if (!row) {
      return res.status(400).json({ success: false, message: "This invite is invalid or has expired" });
    }

    if (row.owner_id === userId) {
      return res.status(400).json({ success: false, message: "You can't accept your own invite" });
    }

    await db.query(
      "UPDATE team_members SET member_id = ?, status = 'active', invite_token = NULL, token_expires = NULL WHERE id = ?",
      [userId, row.id],
    );

    const [[owner]] = await db.query("SELECT name FROM users WHERE id = ?", [row.owner_id]);
    res.json({ success: true, message: `You joined ${owner?.name || "the"}'s team` });
  } catch (error) {
    console.error("[acceptInvite]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const removeMember = async (req, res) => {
  const userId = req.user.userId;
  const rowId = req.params.id;

  try {
    const [result] = await db.query(
      "DELETE FROM team_members WHERE id = ? AND owner_id = ?",
      [rowId, userId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("[removeMember]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const updateMemberRole = async (req, res) => {
  const userId = req.user.userId;
  const rowId = req.params.id;
  const role = req.body.role === "admin" ? "admin" : "member";

  try {
    const [result] = await db.query(
      "UPDATE team_members SET role = ? WHERE id = ? AND owner_id = ?",
      [role, rowId, userId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    res.json({ success: true, message: "Role updated", role });
  } catch (error) {
    console.error("[updateMemberRole]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// :userId here is the member's user id. The query is scoped to the requester's
// own tasks (user_id = me), so it can only ever return the caller's tasks.
const getMemberTasks = async (req, res) => {
  const userId = req.user.userId;
  const memberUserId = req.params.userId;

  try {
    const [tasks] = await db.query(
      `SELECT t.*, t.is_repeated AS \`repeat\`
       FROM tasks t
       WHERE t.assigned_to = ? AND t.user_id = ?
       ORDER BY t.due_date IS NULL, t.due_date ASC`,
      [memberUserId, userId],
    );
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("[getMemberTasks]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Activity that this member performed on the requester's own tasks.
const getMemberActivity = async (req, res) => {
  const userId = req.user.userId;
  const memberUserId = req.params.userId;

  try {
    const [activity] = await db.query(
      `SELECT a.*, t.title AS task_title
       FROM activity_log a
       JOIN tasks t ON a.task_id = t.id
       WHERE a.user_id = ? AND t.user_id = ?
       ORDER BY a.created_at DESC
       LIMIT 30`,
      [memberUserId, userId],
    );
    res.json({ success: true, activity });
  } catch (error) {
    console.error("[getMemberActivity]", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getTeam,
  inviteMember,
  resendInvite,
  acceptInvite,
  removeMember,
  updateMemberRole,
  getMemberTasks,
  getMemberActivity,
};
