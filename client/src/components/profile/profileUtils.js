// Shared constants + helpers for the Profile / Settings page (no JSX).

export const THEME_OPTIONS = [
  { value: 'light',  label: 'Light',  icon: 'light_mode',       desc: 'Bright and clean' },
  { value: 'dark',   label: 'Dark',   icon: 'dark_mode',        desc: 'Easy on the eyes' },
  { value: 'system', label: 'System', icon: 'settings_suggest', desc: 'Match your device' },
]

// Notification preference toggles — stored locally only (see NotificationPrefs).
export const NOTIF_PREFS = [
  { key: 'assigned',  label: 'Task assignments',  desc: 'When a task is assigned to you' },
  { key: 'completed', label: 'Task completions',  desc: 'When a task you own is completed' },
  { key: 'comments',  label: 'Comments',          desc: 'New comments on your tasks' },
  { key: 'mentions',  label: 'Mentions',          desc: 'When someone @mentions you' },
]

export const NOTIF_PREFS_KEY = 'tf-notif-prefs'

export const loadNotifPrefs = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(NOTIF_PREFS_KEY) || '{}')
    return NOTIF_PREFS.reduce((acc, p) => ({ ...acc, [p.key]: saved[p.key] !== false }), {})
  } catch {
    return NOTIF_PREFS.reduce((acc, p) => ({ ...acc, [p.key]: true }), {})
  }
}

export const saveNotifPrefs = (prefs) =>
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs))

export const formatJoinDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'
