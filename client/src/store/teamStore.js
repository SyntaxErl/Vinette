import { create } from 'zustand'

// Invite modal visibility + a version counter the Team page watches to refetch
// after a mutation (invite / remove / role change), mirroring taskVersion.
const useTeamStore = create((set) => ({
  isInviteModalOpen: false,
  openInviteModal: () => set({ isInviteModalOpen: true }),
  closeInviteModal: () => set({ isInviteModalOpen: false }),

  // Whether the current user owns the team being viewed (gates invite/manage UI).
  // Set by the Team page after it loads; read by the navbar invite button.
  canManage: true,
  setCanManage: (v) => set({ canManage: v }),

  teamVersion: 0,
  incrementTeamVersion: () => set((state) => ({ teamVersion: state.teamVersion + 1 })),
}))

export default useTeamStore
