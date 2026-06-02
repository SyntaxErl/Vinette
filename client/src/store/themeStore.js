import { create } from 'zustand'

// Theme preference (light / dark / system). Persisted to localStorage and the
// server (users.theme). NOTE: this only stores + persists the preference — the
// app is not yet restyled for dark mode (that's a separate pass). Seeded on
// auth from the user's saved theme so the choice survives reloads.
const STORAGE_KEY = 'tf-theme'

const useThemeStore = create((set) => ({
  theme: localStorage.getItem(STORAGE_KEY) || 'light',

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    set({ theme })
  },

  reset: () => set({ theme: localStorage.getItem(STORAGE_KEY) || 'light' }),
}))

export default useThemeStore
