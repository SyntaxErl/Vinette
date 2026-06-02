const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    // Create JWT token
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({
      success: true,
      message: "Login successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, avatar, bio, theme, created_at FROM users WHERE id = ?",
      [req.user.userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, avatar FROM users ORDER BY name ASC",
    );
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update the current user's profile (name, bio, theme). Email is immutable here.
const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { name, bio, theme } = req.body;
  const ALLOWED_THEMES = ["light", "dark", "system"];

  try {
    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Name cannot be empty" });
    }
    if (theme !== undefined && !ALLOWED_THEMES.includes(theme)) {
      return res.status(400).json({ success: false, message: "Invalid theme" });
    }

    const [[current]] = await db.query(
      "SELECT name, bio, theme FROM users WHERE id = ?",
      [userId],
    );
    if (!current) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const next = {
      name: name !== undefined ? String(name).trim() : current.name,
      bio: bio !== undefined ? bio : current.bio,
      theme: theme !== undefined ? theme : current.theme,
    };

    await db.query("UPDATE users SET name = ?, bio = ?, theme = ? WHERE id = ?", [
      next.name,
      next.bio,
      next.theme,
      userId,
    ]);

    const [[user]] = await db.query(
      "SELECT id, name, email, avatar, bio, theme, created_at FROM users WHERE id = ?",
      [userId],
    );

    res.json({ success: true, message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Change the current user's password (verifies the current one first).
const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both passwords are required" });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const [[user]] = await db.query("SELECT password FROM users WHERE id = ?", [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, userId]);

    res.json({ success: true, message: "Password changed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { register, login, getMe, getUsers, updateProfile, changePassword };