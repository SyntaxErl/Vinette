import api from '../api/axios'

// Get all users (for assignee dropdown)
export const getUsers = () =>
  api.get('/auth/users')

// Get all tasks — supports filters, sort, search, pagination
export const getTasks = (params) =>
  api.get('/tasks', { params })

// Get a single task by ID
export const getTaskById = (id) =>
  api.get(`/tasks/${id}`)

// Create a new task
export const createTask = (data) =>
  api.post('/tasks', data)

// Update a task by ID
export const updateTask = (id, data) =>
  api.put(`/tasks/${id}`, data)

// Delete a task by ID
export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`)

// Bulk action — done, delete, or priority
export const bulkAction = (taskIds, action, extra = {}) =>
  api.patch('/tasks/bulk', { taskIds, action, ...extra })

// Dashboard stats
export const getDashboardStats = () =>
  api.get('/tasks/dashboard/stats')

// ── Subtasks ────────────────────────────────────────────────────────────────────
export const getSubtasks = (taskId) =>
  api.get(`/tasks/${taskId}/subtasks`)

export const createSubtask = (taskId, title) =>
  api.post(`/tasks/${taskId}/subtasks`, { title })

export const toggleSubtask = (taskId, subtaskId) =>
  api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`)

export const deleteSubtask = (taskId, subtaskId) =>
  api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)

// ── Comments ────────────────────────────────────────────────────────────────────
export const getComments = (taskId) =>
  api.get(`/tasks/${taskId}/comments`)

export const createComment = (taskId, content) =>
  api.post(`/tasks/${taskId}/comments`, { content })

// ── Activity log ────────────────────────────────────────────────────────────────
export const getActivity = (taskId) =>
  api.get(`/tasks/${taskId}/activity`)