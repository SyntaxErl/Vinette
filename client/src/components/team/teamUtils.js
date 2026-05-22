// Stable unique key for a member/pending row (owner has no row id).
export const memberKey = (m) => (m.isOwner ? 'owner' : `${m.isPending ? 'p' : 'm'}${m.rowId}`)
