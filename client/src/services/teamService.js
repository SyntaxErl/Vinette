import api from '../api/axios'

// Full team directory: { members, pending, stats, viewerIsOwner }
export const getTeamMembers = () =>
  api.get('/team/members')

// Shareable team invite link
export const getInviteLink = () =>
  api.get('/team/invite-link')

export const regenerateInviteLink = () =>
  api.post('/team/invite-link/regenerate')

// Join a team via its invite token
export const joinTeam = (token) =>
  api.post('/team/join', { token })

// Invite someone by email (role: 'member' | 'admin')
export const inviteMember = (email, role = 'member') =>
  api.post('/team/invite', { email, role })

// Resend a pending invite (rowId = membership row id)
export const resendInvite = (rowId) =>
  api.post(`/team/resend/${rowId}`)

// Accept an invite via the token from the email link
export const acceptInvite = (token) =>
  api.post('/team/accept', { token })

// Remove a member (rowId = membership row id)
export const removeMember = (rowId) =>
  api.delete(`/team/members/${rowId}`)

// Change a member's role (rowId = membership row id)
export const updateMemberRole = (rowId, role) =>
  api.put(`/team/members/${rowId}/role`, { role })

// Tasks assigned to a member (userId = member user id)
export const getMemberTasks = (userId) =>
  api.get(`/team/members/${userId}/tasks`)

// Activity by a member on your tasks (userId = member user id)
export const getMemberActivity = (userId) =>
  api.get(`/team/members/${userId}/activity`)
