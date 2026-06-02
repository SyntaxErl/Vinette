import { useState } from 'react'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import { updateProfile } from '@/services/authService'
import { errMsg } from '@/components/taskDetail/utils'
import SettingsCard from './SettingsCard'

// Edit name + bio. Email is shown read-only (immutable here).
export default function ProfileInfoForm({ user }) {
  const updateUser = useAuthStore((s) => s.updateUser)
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)

  const dirty = name.trim() !== (user?.name || '') || (bio || '') !== (user?.bio || '')

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Name cannot be empty')
    setSaving(true)
    try {
      const res = await updateProfile({ name: name.trim(), bio })
      updateUser(res.data.user)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(errMsg(err, 'Could not update your profile'))
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setName(user?.name || '')
    setBio(user?.bio || '')
  }

  return (
    <SettingsCard icon="person" title="Profile Information" subtitle="Update your personal details">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
          <div className="flex items-center gap-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5">
            <span className="material-icons text-gray-400" style={{ fontSize: '18px' }}>lock</span>
            <span className="text-sm text-gray-500 truncate">{user?.email}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Email can’t be changed.</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bio</label>
          <textarea
            value={bio || ''}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Tell your team a little about yourself…"
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{(bio || '').length}/280</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          {dirty && (
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#5b4fcf' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </SettingsCard>
  )
}
