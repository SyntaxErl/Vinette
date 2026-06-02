import toast from 'react-hot-toast'
import useThemeStore from '@/store/themeStore'
import useAuthStore from '@/store/authStore'
import { updateProfile } from '@/services/authService'
import { errMsg } from '@/components/taskDetail/utils'
import SettingsCard from './SettingsCard'
import { THEME_OPTIONS } from './profileUtils'

// Theme preference picker. Saves to localStorage (instant) + the server.
// NOTE: only persists the choice for now — full dark-mode restyle is a
// separate pass, so the UI stays light regardless of selection.
export default function ThemeSetting() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const updateUser = useAuthStore((s) => s.updateUser)

  const choose = async (value) => {
    if (value === theme) return
    const prev = theme
    setTheme(value) // optimistic
    try {
      const res = await updateProfile({ theme: value })
      updateUser(res.data.user)
    } catch (err) {
      setTheme(prev) // revert on failure
      toast.error(errMsg(err, 'Could not save your theme'))
    }
  }

  return (
    <SettingsCard icon="palette" title="Appearance" subtitle="Choose how TaskFlow looks">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {THEME_OPTIONS.map((opt) => {
          const active = theme === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => choose(opt.value)}
              className="flex items-center gap-3 rounded-xl border p-3.5 text-left transition"
              style={{
                borderColor: active ? '#5b4fcf' : '#e5e7eb',
                backgroundColor: active ? '#f5f3ff' : 'white',
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: active ? '#ede9fe' : '#f3f4f6' }}
              >
                <span className="material-icons" style={{ fontSize: '20px', color: active ? '#5b4fcf' : '#9ca3af' }}>
                  {opt.icon}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: active ? '#5b4fcf' : '#374151' }}>{opt.label}</p>
                <p className="text-xs text-gray-400">{opt.desc}</p>
              </div>
              {active && (
                <span className="material-icons ml-auto text-purple-600" style={{ fontSize: '18px' }}>check_circle</span>
              )}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Your preference is saved. A full dark theme is coming soon.
      </p>
    </SettingsCard>
  )
}
