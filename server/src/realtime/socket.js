const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const presence = require("./presence");

let ioInstance = null;

// Attaches a Socket.IO server to the given HTTP server and wires real-time presence.
function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });
  ioInstance = io;

  // Authenticate the handshake with the same JWT the REST API uses.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = Number(decoded.userId);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    // Per-user room so we can push notifications to all of a user's tabs.
    socket.join(`user:${userId}`);

    const firstConnection = presence.addSocket(userId, socket.id);
    if (firstConnection) {
      socket.broadcast.emit("presence:update", { userId, status: "online" });
    }
    // Seed the joiner with everyone's current status.
    socket.emit("presence:snapshot", presence.snapshot());

    socket.on("presence:away", () => {
      presence.setStatus(userId, "away");
      io.emit("presence:update", { userId, status: "away" });
    });

    socket.on("presence:active", () => {
      presence.setStatus(userId, "online");
      io.emit("presence:update", { userId, status: "online" });
    });

    socket.on("disconnect", async () => {
      const nowOffline = presence.removeSocket(userId, socket.id);
      if (nowOffline) {
        io.emit("presence:update", { userId, status: "offline" });
        try {
          await db.query("UPDATE users SET last_active = NOW() WHERE id = ?", [userId]);
        } catch (error) {
          console.error("[socket disconnect]", error);
        }
      }
    });
  });

  return io;
}

// Push an event to every live socket of a specific user.
function emitToUser(userId, event, payload) {
  if (ioInstance) ioInstance.to(`user:${Number(userId)}`).emit(event, payload);
}

module.exports = { initSocket, emitToUser };
