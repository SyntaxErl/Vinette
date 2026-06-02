import { create } from 'zustand'

// Theme preference (light / dark / system). Persisted to localStorage and the
// server (users.theme). The choice toggles a `.dark` class on <html>, which the
// app's `dark:` Tailwind variants respond to. `system` resolves to the OS
// preference via matchMedia (and tracks live changes — see useSystemTheme).
//
// NOTE: dark styling is being rolled out shell-first (layout, sidebar, navbar,
// page backgrounds, cards). Some inner pages / charts still use inline hex
// colors and aren't dark yet — that's a later pass.
const STORAGE_KEY = 'tf-theme'

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches

// Resolve a preference to an actual mode, then toggle the root class.
export const applyTheme = (theme) => {
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark())
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
}

const initial = localStorage.getItem(STORAGE_KEY) || 'light'
// Apply immediately on module load so there's no flash before React mounts.
if (typeof document !== 'undefined') applyTheme(initial)

const useThemeStore = create((set) => ({
  theme: initial,

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },

  reset: () => {
    const theme = localStorage.getItem(STORAGE_KEY) || 'light'
    applyTheme(theme)
    set({ theme })
  },
}))

export default useThemeStore
