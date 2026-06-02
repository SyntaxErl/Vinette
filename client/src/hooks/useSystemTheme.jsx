import { useEffect } from 'react'
import useThemeStore, { applyTheme } from '@/store/themeStore'

// While the preference is `system`, re-apply the resolved theme whenever the OS
// color scheme flips, so the app tracks it live without a reload.
export default function useSystemTheme() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme])
}
