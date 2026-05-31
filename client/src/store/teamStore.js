import { create } from 'zustand'
import { getTeamMembers } from '@/services/teamService'

// Invite modal visibility + team directory cache.
//
// teamData is the cached `{ members, pending, stats, viewerIsOwner }` response,
// tagged with the teamVersion it was fetched at (teamCacheVersion). Any mutation
// (invite / remove / role) calls incrementTeamVersion(), which bumps teamVersion
// and so invalidates the cache — fetchTeam refetches on the next visit. A revisit
// with no mutation since is a cache hit (no network call), mirroring the
// taskStore boardCache/tasksCache pattern.
const useTeamStore = create((set, get) => ({
  isInviteModalOpen: false,
  openInviteModal: () => set({ isInviteModalOpen: true }),
  closeInviteModal: () => set({ isInviteModalOpen: false }),

  // Whether the current user owns the team being viewed (gates invite/manage UI).
  // Set by fetchTeam from the response; read by the navbar invite button.
  canManage: true,
  setCanManage: (v) => set({ canManage: v }),

  // Refetch counter — mutations bump it; the Team page watches it.
  teamVersion: 0,
  incrementTeamVersion: () => set((state) => ({ teamVersion: state.teamVersion + 1 })),

  // ── Directory cache ──────────────────────────────────────────────────────
  teamData: null,         // { members, pending, stats, viewerIsOwner }
  teamCacheVersion: -1,   // teamVersion the cache was fetched at
  teamLoading: false,

  fetchTeam: async (force = false) => {
    const { teamData, teamCacheVersion, teamVersion } = get()
    if (!force && teamData && teamCacheVersion === teamVersion) {
      // Cache hit — still sync canManage in case we navigated here from elsewhere.
      set({ canManage: teamData.viewerIsOwner !== false })
      return
    }
    set({ teamLoading: true })
    try {
      const res = await getTeamMembers()
      const viewerIsOwner = res.data.viewerIsOwner !== false
      const data = {
        members: res.data.members || [],
        pending: res.data.pending || [],
        stats: res.data.stats,
        viewerIsOwner,
      }
      set({
        teamData: data,
        teamCacheVersion: get().teamVersion,
        teamLoading: false,
        canManage: viewerIsOwner,
      })
    } catch (err) {
      set({ teamLoading: false })
      throw err // let the page surface the error toast
    }
  },

  reset: () =>
    set({
      isInviteModalOpen: false,
      canManage: true,
      teamVersion: 0,
      teamData: null,
      teamCacheVersion: -1,
      teamLoading: false,
    }),
}))

export default useTeamStore
