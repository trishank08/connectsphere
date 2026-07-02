import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Pencil, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import { postApi, commentApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Avatar from './Avatar'
import ConfirmDialog from './ConfirmDialog'

function CommentThread({ comment, postId, onReplyAdded, depth = 0 }) {
  const [replying, setReplying] = useState(false)
  const [text, setText] = useState('')
  const { showToast } = useToast()

  const submitReply = async () => {
    if (!text.trim()) return
    try {
      const { data } = await commentApi.add(postId, { content: text.trim(), parentCommentId: comment.id })
      onReplyAdded(comment.id, data.data)
      setText(''); setReplying(false)
    } catch {
      showToast('Could not post reply', 'error')
    }
  }

  return (
    <div className={depth > 0 ? 'ml-9 mt-2' : ''}>
      <div className="flex gap-2.5">
        <Avatar src={comment.author.profilePictureUrl} name={comment.author.fullName} size={30} />
        <div className="flex-1">
          <div className="bg-bg-secondary rounded-control px-3 py-2 inline-block">
            <p className="text-xs font-semibold">{comment.author.fullName}</p>
            <p className="text-sm text-text-primary/90">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1">
            <span className="text-[11px] text-text-secondary">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
            <button onClick={() => setReplying((r) => !r)} className="text-[11px] text-text-secondary hover:text-accent font-medium">Reply</button>
          </div>
          {replying && (
            <div className="flex gap-2 mt-2">
              <input
                value={text} onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitReply()}
                placeholder="Write a reply…" className="input-field py-1.5 text-xs flex-1"
              />
              <button onClick={submitReply} className="btn-primary py-1.5 px-3"><Send size={13} /></button>
            </div>
          )}
          {comment.replies?.map((r) => (
            <CommentThread key={r.id} comment={r} postId={postId} onReplyAdded={onReplyAdded} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PostCard({ post, onDeleted }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [liked, setLiked] = useState(post.likedByCurrentUser)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const isOwner = post.author.id === user?.id

  const toggleLike = async () => {
    setLiked((l) => !l)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
    try {
      liked ? await postApi.unlike(post.id) : await postApi.like(post.id)
    } catch {
      setLiked((l) => !l)
      setLikeCount((c) => (liked ? c + 1 : c - 1))
    }
  }

  const loadComments = async () => {
    setCommentsOpen((o) => !o)
    if (!comments) {
      const { data } = await commentApi.list(post.id)
      setComments(data.data)
    }
  }

  const submitComment = async () => {
    if (!commentText.trim()) return
    try {
      const { data } = await commentApi.add(post.id, { content: commentText.trim(), parentCommentId: null })
      setComments((prev) => [...(prev || []), data.data])
      setCommentText('')
    } catch {
      showToast('Could not post comment', 'error')
    }
  }

  const addReply = (parentId, reply) => {
    setComments((prev) =>
      prev.map((c) => (c.id === parentId ? { ...c, replies: [...(c.replies || []), reply] } : c))
    )
  }

  const deletePost = async () => {
    try {
      await postApi.remove(post.id)
      onDeleted?.(post.id)
      showToast('Post deleted', 'success')
    } catch {
      showToast('Could not delete post', 'error')
    }
    setConfirmDelete(false)
  }

  return (
    <motion.article layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Link to={`/profile/${post.author.id}`}>
            <Avatar src={post.author.profilePictureUrl} name={post.author.fullName} size={44} online={post.author.online} />
          </Link>
          <div>
            <Link to={`/profile/${post.author.id}`} className="font-semibold text-sm hover:underline">{post.author.fullName}</Link>
            <p className="text-xs text-text-secondary">@{post.author.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)} className="btn-ghost p-2"><MoreHorizontal size={18} /></button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-9 w-40 card p-1.5 z-50">
                  {isOwner && (
                    <button onClick={() => { setConfirmDelete(true); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 rounded-control hover:bg-error/10 text-error text-sm">
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                  {!isOwner && <p className="px-3 py-2 text-xs text-text-secondary">No actions available</p>}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {post.content && <p className="mt-4 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>}
      {post.imageUrl && (
        <div className="mt-3 rounded-control overflow-hidden">
          <img src={post.imageUrl} alt="post" className="w-full max-h-[30rem] object-cover" />
        </div>
      )}

      {post.sharedPost && (
        <div className="mt-3 border border-white/10 rounded-control p-4">
          <div className="flex items-center gap-2.5">
            <Avatar src={post.sharedPost.author.profilePictureUrl} name={post.sharedPost.author.fullName} size={28} />
            <span className="text-sm font-medium">{post.sharedPost.author.fullName}</span>
          </div>
          {post.sharedPost.content && <p className="text-sm mt-2 text-text-secondary">{post.sharedPost.content}</p>}
          {post.sharedPost.imageUrl && <img src={post.sharedPost.imageUrl} alt="shared" className="mt-2 rounded-control max-h-56 w-full object-cover" />}
        </div>
      )}

      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/5">
        <button onClick={toggleLike} className={`flex items-center gap-2 px-3 py-1.5 rounded-control text-sm font-medium transition-colors ${liked ? 'text-error' : 'text-text-secondary hover:bg-white/5'}`}>
          <Heart size={17} fill={liked ? 'currentColor' : 'none'} /> {likeCount > 0 && likeCount}
        </button>
        <button onClick={loadComments} className="flex items-center gap-2 px-3 py-1.5 rounded-control text-sm font-medium text-text-secondary hover:bg-white/5">
          <MessageCircle size={17} /> {post.commentCount > 0 && post.commentCount}
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-control text-sm font-medium text-text-secondary hover:bg-white/5 ml-auto">
          <Share2 size={17} /> Share
        </button>
      </div>

      <AnimatePresence>
        {commentsOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pt-4 mt-1 border-t border-white/5 space-y-3">
            {comments?.map((c) => (
              <CommentThread key={c.id} comment={c} postId={post.id} onReplyAdded={addReply} />
            ))}
            <div className="flex gap-2.5 items-center">
              <Avatar src={user?.profilePictureUrl} name={user?.fullName} size={30} />
              <input
                value={commentText} onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                placeholder="Write a comment…" className="input-field py-2 text-sm flex-1"
              />
              <button onClick={submitComment} className="btn-primary p-2.5"><Send size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmDelete} title="Delete this post?" description="This action cannot be undone."
        confirmLabel="Delete" danger onConfirm={deletePost} onCancel={() => setConfirmDelete(false)}
      />
    </motion.article>
  )
}
