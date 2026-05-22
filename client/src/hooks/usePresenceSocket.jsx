import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'
import usePresenceStore from '@/store/presenceStore'
import { connectSocket, getSocket } from '@/api/socket'

const IDLE_MS = 5 * 60 * 1000 // mark "away" after 5 min of no activity

// Connects the presence socket while authenticated, mirrors presence events into
// the store, and emits away/active based on idle + tab visibility.
export default function usePresenceSocket() {
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const setSnapshot = usePresenceStore((s) => s.setSnapshot)
  const setStatus = usePresenceStore((s) => s.setStatus)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const socket = connectSocket(token)
    if (!socket) return

    const onSnapshot = (map) => setSnapshot(map)
    const onUpdate = ({ userId, status }) => setStatus(userId, status)
    socket.on('presence:snapshot', onSnapshot)
    socket.on('presence:update', onUpdate)

    // ── Idle / visibility → away/active ──
    let idleTimer = null
    let isAway = false

    const goActive = () => {
      if (isAway) {
        isAway = false
        socket.emit('presence:active')
      }
    }
    const goAway = () => {
      if (!isAway) {
        isAway = true
        socket.emit('presence:away')
      }
    }
    const resetIdle = () => {
      goActive()
      clearTimeout(idleTimer)
      idleTimer = setTimeout(goAway, IDLE_MS)
    }
    const onVisibility = () => {
      if (document.hidden) goAway()
      else resetIdle()
    }

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    activityEvents.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }))
    document.addEventListener('visibilitychange', onVisibility)
    resetIdle()

    return () => {
      clearTimeout(idleTimer)
      activityEvents.forEach((e) => window.removeEventListener(e, resetIdle))
      document.removeEventListener('visibilitychange', onVisibility)
      const s = getSocket()
      if (s) {
        s.off('presence:snapshot', onSnapshot)
        s.off('presence:update', onUpdate)
      }
    }
  }, [isAuthenticated, token, setSnapshot, setStatus])
}
