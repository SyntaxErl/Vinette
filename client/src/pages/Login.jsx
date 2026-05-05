import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 flex-col justify-between p-10 bg-purple-100 relative overflow-hidden">

        {/* Floating decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20 animate-float bg-indigo-600" />
        <div className="absolute top-40 right-32 w-10 h-10 rounded-full opacity-30 animate-float-delay bg-violet-600" />
        <div className="absolute bottom-20 right-10 w-20 h-20 rounded-full opacity-15 animate-float bg-indigo-600" />
        <div className="absolute bottom-40 left-6 w-14 h-14 rounded-full opacity-20 animate-float-delay bg-violet-600" />
        <div className="absolute top-1/2 right-6 w-6 h-6 rounded-full opacity-25 animate-float bg-indigo-600" />

        {/* Logo */}
        <div className="flex items-center gap-2 relative z-10">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="font-bold text-lg" style={{ color: '#5b4fcf' }}>TaskFlow</span>
        </div>

        {/* Hero Image */}
        <div className="flex relative z-10 animate-fadeInUp">
          <img
            src="/login.png"
            alt="TaskFlow"
            className="w-130 object-contain"
          />
        </div>

        {/* Text */}
        <div className="mb-4 relative z-10 animate-fadeInUp-delay">
          <h2 className="text-4xl font-bold text-gray-800">Organize Your Tasks,</h2>
          <h2 className="text-4xl font-bold text-purple-600">Boost Your Productivity</h2>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            TaskFlow helps you manage your tasks, stay organized, and get more done every day.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 relative z-10 animate-fadeInUp-delay">
          {[
            { icon: 'check_box', label: 'Create and manage tasks' },
            { icon: 'calendar_today', label: 'Set priorities and due dates' },
            { icon: 'bar_chart', label: 'Track progress and stay organized' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200">
                <span className="material-icons" style={{ fontSize: '20px', color: '#5b4fcf' }}>
                  {item.icon}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-purple-100 min-h-screen relative overflow-hidden">

        {/* Floating decorative elements */}
        <div className="absolute top-6 right-6 w-16 h-16 rounded-full opacity-20 animate-float bg-indigo-600" />
        <div className="absolute bottom-10 left-6 w-10 h-10 rounded-full opacity-15 animate-float-delay bg-violet-600" />
        <div className="absolute top-1/3 left-4 w-6 h-6 rounded-full opacity-20 animate-float bg-indigo-600" />

        {/* Mobile logo */}
        <div className="fixed top-4 left-4 flex items-center gap-2 md:hidden z-50">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="font-bold text-xl" style={{ color: '#5b4fcf' }}>TaskFlow</span>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-purple-50 rounded-2xl shadow-lg p-8 animate-fadeInUp">

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h1>
          <p className="text-sm text-gray-500 mb-2">
            Login to continue to your account
          </p>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className="pb-3 px-4 text-sm font-semibold border-b-2"
              style={{ color: '#5b4fcf', borderColor: '#5b4fcf' }}
            >
              Log In
            </button>
            <Link
              to="/register"
              className="pb-3 px-4 text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Register
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              <span className="material-icons" style={{ fontSize: '16px' }}>error_outline</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-3 bg-gray-50 focus-within:border-purple-400 focus-within:bg-white transition-all">
                <span className="material-icons text-gray-400 mr-2" style={{ fontSize: '20px' }}>mail</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-3 bg-gray-50 focus-within:border-purple-400 focus-within:bg-white transition-all">
                <span className="material-icons text-gray-400 mr-2" style={{ fontSize: '20px' }}>lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 transition ml-1"
                >
                  <span className="material-icons" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-purple-600 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-semibold hover:underline"
                style={{ color: '#5b4fcf' }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#5b4fcf' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-icons animate-spin" style={{ fontSize: '16px' }}>refresh</span>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#5b4fcf' }}>
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}