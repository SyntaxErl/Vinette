import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import useTeamStore from '@/store/teamStore'
import { getInviteLink, regenerateInviteLink } from '@/services/teamService'
import { errMsg } from '@/components/taskDetail/utils'

export default function InviteMemberModal() {
  const { isInviteModalOpen, closeInviteModal } = useTeamStore()
  const [link, setLink] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isInviteModalOpen) return
    setLink('')
    setLoading(true)
    getInviteLink()
      .then((res) => setLink(res.data.link))
      .catch((err) => toast.error(errMsg(err, 'Could not load the invite link')))
      .finally(() => setLoading(false))
  }, [isInviteModalOpen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeInviteModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeInviteModal])

  if (!isInviteModalOpen) return null

  const copy = () => {
    navigator.clipboard?.writeText(link)
      .then(() => toast.success('Invite link copied'))
      .catch(() => toast.error('Could not copy — select the link and copy manually'))
  }

  const regenerate = async () => {
    setLoading(true)
    try {
      const res = await regenerateInviteLink()
      setLink(res.data.link)
      toast.success('New link generated — the old one no longer works')
    } catch (err) {
      toast.error(errMsg(err, 'Could not regenerate the link'))
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
            <h2 className="text-lg font-bold text-gray-900">Invite to your team</h2>
            <p className="text-sm text-gray-400 mt-0.5">Share this link — anyone who opens it can join.</p>
          </div>
          <button onClick={closeInviteModal} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
            <span className="material-icons" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50 border border-purple-100">
            <span className="material-icons text-purple-500" style={{ fontSize: '20px' }}>link</span>
            <p className="text-sm text-purple-700">
              Send this link to anyone you want on your team. When they open it, they'll create an account
              (or log in) and join automatically.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Invite link</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
              <span className="material-icons text-gray-400 flex-shrink-0" style={{ fontSize: '18px' }}>link</span>
              <input
                readOnly
                value={loading ? 'Generating link…' : link}
                onFocus={(e) => e.target.select()}
                className="flex-1 text-sm text-gray-600 bg-transparent outline-none truncate"
              />
              <button
                onClick={copy}
                disabled={loading || !link}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex-shrink-0 transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#5b4fcf' }}
              >
                <span className="material-icons" style={{ fontSize: '14px' }}>content_copy</span>
                Copy
              </button>
            </div>
          </div>

          <button
            onClick={regenerate}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition disabled:opacity-50"
          >
            <span className="material-icons" style={{ fontSize: '14px' }}>autorenew</span>
            Generate a new link (disables the current one)
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={closeInviteModal}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            style={{ backgroundColor: '#5b4fcf' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
