import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import { deleteAccount } from '@/services/authService'
import { errMsg } from '@/components/taskDetail/utils'
import SettingsCard from './SettingsCard'

// Simple yes/no confirmation modal (used for logout).
function ConfirmModal({ icon, iconClass, title, message, confirmLabel, confirmClass, busy, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={busy ? undefined : onCancel} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
            <span className="material-icons" style={{ fontSize: '24px' }}>{icon}</span>
          </div>
          <h2 className="font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`px-4 py-2 rounded-xl text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// Modal asking the user to type a confirmation word before deleting.
function DeleteConfirmModal({ onCancel, onConfirm, deleting }) {
  const [text, setText] = useState('')
  const ready = text.trim().toUpperCase() === 'DELETE' && !deleting

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={deleting ? undefined : onCancel} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-red-50 dark:bg-red-500/15">
            <span className="material-icons text-red-600 dark:text-red-400" style={{ fontSize: '24px' }}>warning</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100">Delete account</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
          This permanently deletes your account along with all your tasks, comments and team memberships.
          Type <span className="font-semibold text-gray-800 dark:text-gray-100">DELETE</span> to confirm.
        </p>

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="DELETE"
          autoFocus
          disabled={deleting}
          className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-red-300 dark:focus:border-red-500 focus:ring-2 focus:ring-red-50 dark:focus:ring-red-500/20 transition"
        />

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!ready}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium bg-red-600 hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Account-level actions: log out of the current session, or permanently
// delete the account.
export default function AccountActions() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      toast.success('Your account has been deleted')
      logout()
      navigate('/login')
    } catch (err) {
      toast.error(errMsg(err, 'Could not delete your account'))
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  return (
    <SettingsCard icon="manage_accounts" title="Account" subtitle="Manage your session and account">
      <div className="space-y-3">
        {/* Logout */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Log out</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Sign out of your account on this device</p>
          </div>
          <button
            onClick={() => setLogoutOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition flex-shrink-0"
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>logout</span>
            Log out
          </button>
        </div>

        {/* Delete account */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-100 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5 p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Delete account</p>
            <p className="text-xs text-red-500/80 dark:text-red-400/70">Permanently remove your account and all data</p>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition flex-shrink-0"
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>delete_forever</span>
            Delete
          </button>
        </div>
      </div>

      {logoutOpen && (
        <ConfirmModal
          icon="logout"
          iconClass="bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-300"
          title="Log out"
          message="Are you sure you want to log out of your account on this device?"
          confirmLabel="Log out"
          confirmClass="bg-purple-600 hover:bg-purple-700"
          onCancel={() => setLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      )}

      {confirmOpen && (
        <DeleteConfirmModal
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </SettingsCard>
  )
}
