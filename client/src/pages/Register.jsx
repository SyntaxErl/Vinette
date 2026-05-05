import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { label: '', color: '', width: '0%' }
    if (password.length < 6) return { label: 'Weak', color: '#ef4444', width: '25%' }
    if (password.length < 8) return { label: 'Fair', color: '#f97316', width: '50%' }

    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[^A-Za-z0-9]/.test(password)
    const strongCount = [hasUpper, hasNumber, hasSymbol].filter(Boolean).length

    if (strongCount === 3) return { label: 'Strong', color: '#22c55e', width: '100%' }
    if (strongCount === 2) return { label: 'Good', color: '#84cc16', width: '75%' }
    return { label: 'Fair', color: '#f97316', width: '50%' }
  }

  const strength = getPasswordStrength(formData.password)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match')
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters')
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
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
      <div className="hidden md:flex w-1/2 flex-col justify-between p-10 bg-purple-100">
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20 animate-float bg-indigo-600" />
        <div className="absolute top-40 right-32 w-10 h-10 rounded-full opacity-30 animate-float-delay bg-violet-600" />
        <div className="absolute bottom-20 right-10 w-20 h-20 rounded-full opacity-15 animate-float bg-indigo-600" />
        <div className="absolute bottom-40 left-6 w-14 h-14 rounded-full opacity-20 animate-float-delay bg-violet-600" />
        <div className="absolute top-1/2 right-6 w-6 h-6 rounded-full opacity-25 animate-float bg-indigo-600" />

        {/* Logo */}
        <div className="flex items-center gap-2">
           <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="font-bold text-lg" style={{ color: '#5b4fcf' }}>TaskFlow</span>
        </div>

        {/* Hero Image */}
        <div className="flex animate-fadeInUp">
          <img
            src="/register.png"
            alt="TaskFlow"
            className="w-130 object-contain"
          />
        </div>

        {/* Text */}
        <div className="mb-4 animate-fadeInUp-delay">
          <h2 className="text-4xl font-bold text-gray-800">Organize your work.</h2>
          <h2 className="text-4xl font-bold text-purple-600">Achieve more.</h2>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            TaskFlow helps teams and individuals stay organized, collaborate, and get things done efficiently.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 animate-fadeInUp-delay">
          {[
            { icon: 'task_alt', label: 'Stay Organized', desc: 'Manage tasks and projects in one place.' },
            { icon: 'groups', label: 'Collaborate', desc: 'Work together with your team seamlessly.' },
            { icon: 'bar_chart', label: 'Track Progress', desc: 'Monitor progress and hit your goals.' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-200">
                <span className="material-icons" style={{ fontSize: '20px', color: '#5b4fcf' }}>
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-purple-100 min-h-screen ">

        <div className="absolute top-6 right-6 w-16 h-16 rounded-full opacity-20 animate-float bg-indigo-600" />
        <div className="absolute bottom-10 left-6 w-10 h-10 rounded-full opacity-15 animate-float-delay bg-violet-600" />
        <div className="absolute top-1/3 left-4 w-6 h-6 rounded-full opacity-20 animate-float bg-indigo-600" />

        {/* Card */}
        <div className="w-full max-w-md bg-purple-50 rounded-2xl shadow-lg p-8 animate-fadeInUp">


          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-2">
            Join TaskFlow and start managing your tasks the smart way.
          </p>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <Link
              to="/login"
              className="pb-3 px-4 text-sm text-gray-400 hover:text-gray-600 transition"
            >
              Log In
            </Link>
            <button
              className="pb-3 px-4 text-sm font-semibold border-b-2"
              style={{ color: '#5b4fcf', borderColor: '#5b4fcf' }}
            >
              Register
            </button>
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

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-3 bg-gray-50 focus-within:border-purple-400 focus-within:bg-white transition-all">
                <span className="material-icons text-gray-400 mr-2" style={{ fontSize: '20px' }}>person</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-3 bg-gray-50 focus-within:border-purple-400 focus-within:bg-white transition-all">
                <span className="material-icons text-gray-400 mr-2" style={{ fontSize: '20px' }}>mail</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
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

              {/* Strength bar */}
              {formData.password.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex gap-1.5">
                    {['25%', '50%', '75%', '100%'].map((w, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          background: parseFloat(strength.width) >= parseFloat(w)
                            ? strength.color
                            : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">Use letters, numbers & symbols</p>
                    <span className="text-xs font-semibold" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3.5 py-3 bg-gray-50 focus-within:border-purple-400 focus-within:bg-white transition-all">
                <span className="material-icons text-gray-400 mr-2" style={{ fontSize: '20px' }}>lock</span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder-gray-400 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-gray-400 hover:text-gray-500 transition ml-1"
                >
                  <span className="material-icons" style={{ fontSize: '20px' }}>
                    {showConfirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span className="material-icons" style={{ fontSize: '14px' }}>error</span>
                  Passwords must match
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-500 mt-1.5 flex items-center gap-1">
                  <span className="material-icons" style={{ fontSize: '14px' }}>check_circle</span>
                  Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-60 mt-2"
              style={{ backgroundColor: '#5b4fcf' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-icons animate-spin" style={{ fontSize: '16px' }}>refresh</span>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#5b4fcf' }}>
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}