import { io } from 'socket.io-client'

// Socket connects to the bare origin (the REST baseURL has the /api suffix).
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000')

let socket = null

export function connectSocket(token) {
  if (!token) return null
  if (socket) {
    // Refresh auth + reconnect if the token changed.
    socket.auth = { token }
    if (!socket.connected) socket.connect()
    return socket
  }
  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket', 'polling'],
  })
  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
