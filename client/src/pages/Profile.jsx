import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'
import useThemeStore from '@/store/themeStore'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileInfoForm from '@/components/profile/ProfileInfoForm'
import ThemeSetting from '@/components/profile/ThemeSetting'
import NotificationPrefs from '@/components/profile/NotificationPrefs'
import ChangePassword from '@/components/profile/ChangePassword'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const setTheme = useThemeStore((s) => s.setTheme)

  // Seed the theme store from the user's saved preference once loaded, so the
  // picker reflects the server value (and survives a fresh login on this page).
  useEffect(() => {
    if (user?.theme) setTheme(user.theme)
  }, [user?.theme, setTheme])

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-3xl mx-auto w-full space-y-5 px-1 sm:px-2 py-2 animate-fadeInUp">
        <ProfileHeader user={user} />
        <ProfileInfoForm user={user} />
        <ThemeSetting />
        <NotificationPrefs />
        <ChangePassword />
      </div>
    </div>
  )
}
