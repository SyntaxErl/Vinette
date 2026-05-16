const express = require("express");
const { register, login, getMe, getUsers } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.get("/users", authMiddleware, getUsers);

module.exports = router;