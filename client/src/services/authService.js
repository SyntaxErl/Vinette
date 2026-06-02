import api from '../api/axios'

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password })

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password })

export const getMe = () =>
  api.get('/auth/me')

// Update name / bio / theme
export const updateProfile = (data) =>
  api.put('/auth/profile', data)

// Change password (verifies the current one server-side)
export const changePassword = (currentPassword, newPassword) =>
  api.put('/auth/password', { currentPassword, newPassword })