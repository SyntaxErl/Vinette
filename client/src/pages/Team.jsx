import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import useTeamStore from '@/store/teamStore'
import usePresenceStore from '@/store/presenceStore'
import { getTeamMembers, removeMember, updateMemberRole } from '@/services/teamService'
import { errMsg } from '@/components/taskDetail/utils'
import TeamStats from '@/components/team/TeamStats'
import TeamFilters from '@/components/team/TeamFilters'
import TeamTable from '@/components/team/TeamTable'
import { memberKey } from '@/components/team/teamUtils'
import TeamMemberCard from '@/components/team/TeamMemberCard'
import MemberSidebar from '@/components/team/MemberSidebar'

const PAGE_SIZE = 10

export default function Team() {
  const teamVersion = useTeamStore((s) => s.teamVersion)
  const incrementTeamVersion = useTeamStore((s) => s.incrementTeamVersion)
  const openInviteModal = useTeamStore((s) => s.openInviteModal)
  const setCanManage = useTeamStore((s) => s.setCanManage)
  const presence = usePresenceStore((s) => s.statuses)

  const [data, setData] = useState({ members: [], pending: [], stats: null, viewerIsOwner: true })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedKey, setSelectedKey] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    getTeamMembers()
      .then((res) => {
        if (!active) return
        const viewerIsOwner = res.data.viewerIsOwner !== false
        setData({ members: res.data.members || [], pending: res.data.pending || [], stats: res.data.stats, viewerIsOwner })
        setCanManage(viewerIsOwner)
      })
      .catch((err) => { if (active) toast.error(errMsg(err, 'Could not load your team')) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false; setCanManage(true) }
  }, [teamVersion, setCanManage])

  const canManage = data.viewerIsOwner !== false

  // Overlay live presence onto the server-seeded status.
  const members = useMemo(
    () => data.members.map((m) => ({ ...m, status: presence[m.userId] || m.status })),
    [data.members, presence],
  )

  // Filtering
  const s = search.trim().toLowerCase()
  const matchText = (m) => !s || (m.name || '').toLowerCase().includes(s) || (m.email || '').toLowerCase().includes(s)

  const filteredMembers = members.filter(
    (m) => matchText(m) && (!roleFilter || m.role === roleFilter) && (!statusFilter || statusFilter === m.status),
  )

  const totalShown = filteredMembers.length
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedMembers = filteredMembers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Selected member (derived from fresh data so it survives refetches).
  // If it was removed, the lookup yields null and the sidebar simply unmounts.
  const selected = useMemo(() => {
    if (!selectedKey) return null
    return members.find((m) => memberKey(m) === selectedKey) || null
  }, [selectedKey, members])

  // Actions
  const handleRemove = async (m) => {
    const label = m.name || m.email
    if (!window.confirm(`Remove ${label} from your team?`)) return
    try {
      await removeMember(m.rowId)
      toast.success(m.isPending ? 'Invite cancelled' : 'Member removed')
      setSelectedKey(null)
      incrementTeamVersion()
    } catch (err) {
      toast.error(errMsg(err, 'Could not remove the member'))
    }
  }

  const handleRoleChange = async (rowId, role) => {
    try {
      await updateMemberRole(rowId, role)
      toast.success(`Role updated to ${role}`)
      incrementTeamVersion()
    } catch (err) {
      toast.error(errMsg(err, 'Could not update the role'))
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-7xl mx-auto w-full space-y-4 px-1 sm:px-2 py-2 animate-fadeInUp">

        <TeamStats stats={data.stats} />

        {/* Filter bar + invite (invite also lives in the navbar) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex-1">
            <TeamFilters
              search={search} setSearch={setSearch}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              roleFilter={roleFilter} setRoleFilter={setRoleFilter}
            />
          </div>
          {canManage && (
            <button
              onClick={openInviteModal}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-white text-sm font-medium transition hover:opacity-90 flex-shrink-0"
              style={{ backgroundColor: '#5b4fcf' }}
            >
              <span className="material-icons" style={{ fontSize: '18px' }}>person_add</span>
              Invite Member
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-20">
            <span className="material-icons animate-spin text-purple-400" style={{ fontSize: '32px' }}>autorenew</span>
          </div>
        ) : totalShown === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 text-center">
            <span className="material-icons text-gray-200 mb-3" style={{ fontSize: '48px' }}>group_off</span>
            <p className="text-sm font-medium text-gray-400">No members found</p>
            <p className="text-xs text-gray-300 mt-1">Try adjusting your filters or invite someone</p>
          </div>
        ) : (
          <>
            {/* ── Card view (below xl) ── */}
            <div className="xl:hidden space-y-3">
              {pagedMembers.map((m) => (
                <TeamMemberCard
                  key={memberKey(m)}
                  member={m}
                  isSelected={selectedKey === memberKey(m)}
                  onSelect={(mm) => setSelectedKey(memberKey(mm))}
                  canManage={canManage}
                />
              ))}
            </div>

            {/* ── Table view (xl+) ── */}
            <div className="hidden xl:block">
              <TeamTable
                members={pagedMembers}
                pending={[]}
                selectedKey={selectedKey}
                onSelect={(m) => setSelectedKey(memberKey(m))}
                canManage={canManage}
              />
            </div>

            {/* Footer / pagination */}
            <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-between px-5 py-3">
              <p className="text-sm text-gray-500">
                Showing {filteredMembers.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {Math.min(safePage * PAGE_SIZE, filteredMembers.length)} of {totalShown} members
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <span className="material-icons" style={{ fontSize: '16px' }}>chevron_left</span>
                  </button>
                  <span className="w-8 h-8 rounded-lg text-sm font-medium border flex items-center justify-center"
                    style={{ backgroundColor: '#5b4fcf', color: 'white', borderColor: '#5b4fcf' }}>
                    {safePage}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <span className="material-icons" style={{ fontSize: '16px' }}>chevron_right</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selected && (
        <MemberSidebar
          key={memberKey(selected)}
          member={selected}
          canManage={canManage}
          onClose={() => setSelectedKey(null)}
          onRemove={handleRemove}
          onRoleChange={handleRoleChange}
        />
      )}
    </div>
  )
}
