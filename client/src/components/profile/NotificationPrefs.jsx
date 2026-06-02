import { useState } from 'react'
import toast from 'react-hot-toast'
import SettingsCard from './SettingsCard'
import Toggle from './Toggle'
import { NOTIF_PREFS, loadNotifPrefs, saveNotifPrefs } from './profileUtils'

// Notification preference toggles. Stored locally only for now — the server
// still sends every notification; this just records the user's intent.
export default function NotificationPrefs() {
  const [prefs, setPrefs] = useState(loadNotifPrefs)

  const toggle = (key, value) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    saveNotifPrefs(next)
    toast.success('Preferences saved')
  }

  return (
    <SettingsCard icon="notifications" title="Notifications" subtitle="Choose what you’re notified about">
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {NOTIF_PREFS.map((p) => (
          <div key={p.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{p.label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{p.desc}</p>
            </div>
            <Toggle checked={prefs[p.key]} onChange={(v) => toggle(p.key, v)} />
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        Saved on this device. Server-side filtering is coming soon.
      </p>
    </SettingsCard>
  )
}
