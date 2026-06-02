import { useState } from 'react'
import toast from 'react-hot-toast'
import { changePassword } from '@/services/authService'
import { errMsg } from '@/components/taskDetail/utils'
import SettingsCard from './SettingsCard'

function PasswordField({ label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 pr-10 text-sm text-gray-700 outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>{show ? 'visibility_off' : 'visibility'}</span>
        </button>
      </div>
    </div>
  )
}

export default function ChangePassword() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [saving, setSaving] = useState(false)

  const reset = () => { setCurrent(''); setNext(''); setConfirm('') }

  const handleSave = async () => {
    if (!current || !next) return toast.error('Fill in both password fields')
    if (next.length < 6) return toast.error('New password must be at least 6 characters')
    if (next !== confirm) return toast.error('New passwords don’t match')
    setSaving(true)
    try {
      await changePassword(current, next)
      toast.success('Password changed')
      reset()
    } catch (err) {
      toast.error(errMsg(err, 'Could not change your password'))
    } finally {
      setSaving(false)
    }
  }

  const canSave = current && next && confirm && !saving

  return (
    <SettingsCard icon="lock" title="Password" subtitle="Change your account password">
      <div className="space-y-4">
        <PasswordField label="Current Password" value={current} onChange={setCurrent} show={show} onToggle={() => setShow((s) => !s)} placeholder="••••••••" />
        <PasswordField label="New Password" value={next} onChange={setNext} show={show} onToggle={() => setShow((s) => !s)} placeholder="At least 6 characters" />
        <PasswordField label="Confirm New Password" value={confirm} onChange={setConfirm} show={show} onToggle={() => setShow((s) => !s)} placeholder="Re-enter new password" />

        <div className="flex justify-end pt-1">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#5b4fcf' }}
          >
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </div>
      </div>
    </SettingsCard>
  )
}
