import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'
import { acceptInvite } from '@/services/teamService'
import { errMsg } from '@/components/taskDetail/utils'

export default function AcceptInvite() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [status, setStatus] = useState('working') // working | error
  const [message, setMessage] = useState('Accepting your invitation...')
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const token = params.get('token')
    const email = params.get('email') || ''

    if (!token) {
      setStatus('error')
      setMessage('This invitation link is missing its token.')
      return
    }

    // Not logged in → stash the token and send them to register (prefilled).
    if (!isAuthenticated) {
      localStorage.setItem('pendingInviteToken', token)
      navigate(`/register?email=${encodeURIComponent(email)}&invited=1`, { replace: true })
      return
    }

    acceptInvite(token)
      .then((res) => {
        toast.success(res.data.message || 'Invitation accepted')
        navigate('/team', { replace: true })
      })
      .catch((err) => {
        setStatus('error')
        setMessage(errMsg(err, 'This invite is invalid or has expired.'))
      })
  }, [params, isAuthenticated, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-8 text-center">
        {status === 'working' ? (
          <>
            <span className="material-icons animate-spin text-purple-400" style={{ fontSize: '40px' }}>autorenew</span>
            <p className="text-sm text-gray-500 mt-4">{message}</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <span className="material-icons text-red-400" style={{ fontSize: '28px' }}>error_outline</span>
            </div>
            <p className="text-base font-semibold text-gray-800 mt-4">Invitation problem</p>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="mt-5 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: '#5b4fcf' }}
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
