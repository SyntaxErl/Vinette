// In-memory presence registry — the source of truth for live online/away status.
// Sockets are ref-counted per user so multiple tabs don't flip someone offline early.
// Keys are numeric user ids.

const registry = new Map(); // userId -> { sockets: Set<socketId>, status: 'online' | 'away' }

function addSocket(userId, socketId) {
  const id = Number(userId);
  let entry = registry.get(id);
  const firstConnection = !entry || entry.sockets.size === 0;
  if (!entry) {
    entry = { sockets: new Set(), status: "online" };
    registry.set(id, entry);
  }
  entry.sockets.add(socketId);
  if (firstConnection) entry.status = "online";
  return firstConnection;
}

// Returns true when the user has no sockets left (now offline).
function removeSocket(userId, socketId) {
  const id = Number(userId);
  const entry = registry.get(id);
  if (!entry) return true;
  entry.sockets.delete(socketId);
  if (entry.sockets.size === 0) {
    registry.delete(id);
    return true;
  }
  return false;
}

function setStatus(userId, status) {
  const entry = registry.get(Number(userId));
  if (entry) entry.status = status;
}

function getStatus(userId) {
  const entry = registry.get(Number(userId));
  return entry && entry.sockets.size > 0 ? entry.status : "offline";
}

function snapshot() {
  const out = {};
  for (const [userId, entry] of registry) {
    if (entry.sockets.size > 0) out[userId] = entry.status;
  }
  return out;
}

module.exports = { addSocket, removeSocket, setStatus, getStatus, snapshot };
