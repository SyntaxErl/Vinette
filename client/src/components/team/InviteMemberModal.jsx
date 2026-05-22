import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import useTeamStore from '@/store/teamStore'
import { inviteMember } from '@/services/teamService'
import { errMsg } from '@/components/taskDetail/utils'

export default function InviteMemberModal() {
  const { isInviteModalOpen, closeInviteModal, incrementTeamVersion } = useTeamStore()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const emailRef = useRef(null)

  useEffect(() => {
    if (isInviteModalOpen) {
      setEmail('')
      setRole('member')
      setError('')
      setTimeout(() => emailRef.current?.focus(), 50)
    }
  }, [isInviteModalOpen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeInviteModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeInviteModal])

  if (!isInviteModalOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Please enter an email address.')
      return
    }
    setLoading(true)
    try {
      const res = await inviteMember(email.trim(), role)
      incrementTeamVersion()
      if (res.data.emailSent) {
        toast.success('Invitation sent')
      } else {
        toast('Invite created, but the email failed to send')
      }
      if (res.data.previewUrl) {
        console.log('[invite] email preview:', res.data.previewUrl)
      }
      closeInviteModal()
    } catch (err) {
      setError(errMsg(err, 'Could not send the invitation.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      style={{ backgroundColor: 'rgba(15,15,35,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => e.target === e.currentTarget && closeInviteModal()}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Invite Member</h2>
            <p className="text-sm text-gray-400 mt-0.5">Send an invite by email to join your team.</p>
          </div>
          <button onClick={closeInviteModal} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
            <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              <span className="material-icons" style={{ fontSize: '16px' }}>error_outline</span>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <div className="relative">
              <span className="material-icons absolute left-3 top-2.5 text-gray-400 pointer-events-none" style={{ fontSize: '18px' }}>mail</span>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <div className="flex gap-2">
              {['member', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition capitalize"
                  style={{
                    backgroundColor: role === r ? '#ede9fe' : 'white',
                    color: role === r ? '#5b4fcf' : '#6b7280',
                    borderColor: role === r ? '#c4b5fd' : '#e5e7eb',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={closeInviteModal}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: '#5b4fcf' }}
          >
            {loading ? (
              <>
                <span className="material-icons animate-spin" style={{ fontSize: '16px' }}>refresh</span>
                Sending...
              </>
            ) : (
              <>
                <span className="material-icons" style={{ fontSize: '16px' }}>send</span>
                Send Invite
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
