const express = require("express");
const { register, login, getMe, getUsers, updateProfile, changePassword } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.get("/users", authMiddleware, getUsers);
router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);

module.exports = router;