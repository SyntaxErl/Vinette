import { Avatar, SubtaskRow, timeAgo } from './utils'

export default function OverviewTab({
  task, user,
  editingDesc, descDraft, setDescDraft, saveDesc, setEditingDesc,
  subtasks, completedCount, progress,
  addingSubtask, setAddingSubtask, newSubtaskTitle, setNewSubtaskTitle,
  savingSubtask, handleAddSubtask, handleToggleSubtask, handleDeleteSubtask, subtaskInputRef,
  comments, commentText, setCommentText, postingComment, handlePostComment,
}) {
  return (
    <div className="space-y-6">

      {/* Description */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</p>
          {!editingDesc && (
            <button
              onClick={() => { setEditingDesc(true); setDescDraft(task.description || '') }}
              className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium transition"
            >
              <span className="material-icons" style={{ fontSize: 13 }}>edit</span>Edit
            </button>
          )}
        </div>
        {editingDesc ? (
          <div>
            <textarea
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              placeholder="Add a description…"
              rows={4}
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 resize-none transition bg-white"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button onClick={saveDesc} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition" style={{ backgroundColor: '#5b4fcf' }}>Save</button>
              <button onClick={() => { setEditingDesc(false); setDescDraft(task.description || '') }} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition">Cancel</button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => { setEditingDesc(true); setDescDraft(task.description || '') }}
            className="cursor-text min-h-[44px] rounded-xl px-3.5 py-2.5 hover:bg-gray-50 transition border border-transparent hover:border-gray-200 group"
          >
            {task.description
              ? <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              : <p className="text-sm text-gray-300 italic">Add a description…</p>
            }
          </div>
        )}
      </section>

      {/* Subtasks */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Subtasks
            {subtasks.length > 0 && (
              <span className="ml-1.5 normal-case font-normal">({completedCount}/{subtasks.length})</span>
            )}
          </p>
          <button
            onClick={() => setAddingSubtask(true)}
            className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium transition"
          >
            <span className="material-icons" style={{ fontSize: 13 }}>add</span>Add
          </button>
        </div>

        {subtasks.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#22c55e' : '#5b4fcf' }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: progress === 100 ? '#22c55e' : '#5b4fcf' }}>
                {progress}%
              </span>
            </div>
          </div>
        )}

        <div className="space-y-0.5">
          {subtasks.map((subtask) => (
            <SubtaskRow
              key={subtask.id}
              subtask={subtask}
              onToggle={() => handleToggleSubtask(subtask)}
              onDelete={() => handleDeleteSubtask(subtask)}
            />
          ))}

          {subtasks.length === 0 && !addingSubtask && (
            <p className="text-xs text-gray-300 italic px-3 py-2">No subtasks yet.</p>
          )}

          {addingSubtask && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50/40 mt-1">
              <span className="material-icons text-gray-300 flex-shrink-0" style={{ fontSize: 20 }}>radio_button_unchecked</span>
              <input
                ref={subtaskInputRef}
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Subtask title…"
                className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-300 min-w-0"
                disabled={savingSubtask}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask()
                  if (e.key === 'Escape') { setAddingSubtask(false); setNewSubtaskTitle('') }
                }}
              />
              <button
                onClick={handleAddSubtask}
                disabled={savingSubtask || !newSubtaskTitle.trim()}
                className="text-xs font-semibold text-white px-2.5 py-1 rounded-lg disabled:opacity-40 transition flex-shrink-0"
                style={{ backgroundColor: '#5b4fcf' }}
              >{savingSubtask ? '…' : 'Add'}</button>
              <button onClick={() => { setAddingSubtask(false); setNewSubtaskTitle('') }} className="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                <span className="material-icons" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Comments */}
      <section>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Comments {comments.length > 0 && `(${comments.length})`}
        </p>

        <div className="space-y-4 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Avatar name={c.author_name} size={32} />
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800">{c.author_name}</span>
                    <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="flex flex-col items-center py-6 gap-2">
              <span className="material-icons text-gray-200" style={{ fontSize: 36 }}>chat_bubble_outline</span>
              <p className="text-xs text-gray-300 italic">No comments yet.</p>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Avatar name={user?.name} size={32} />
          <div className="flex-1 border border-gray-200 rounded-2xl overflow-hidden focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-50 transition bg-white">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              className="w-full px-4 pt-3 pb-1 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none bg-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment() }
              }}
            />
            <div className="flex items-center justify-end px-3 pb-2.5 gap-2">
              <span className="text-xs text-gray-300 mr-auto hidden sm:block">Enter to send · Shift+Enter newline</span>
              <button
                onClick={handlePostComment}
                disabled={!commentText.trim() || postingComment}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: '#5b4fcf' }}
              >
                <span className="material-icons" style={{ fontSize: 14 }}>send</span>
                {postingComment ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
