import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, MessageCircle, UserPlus, Reply, Mail, Bell, CheckCheck } from 'lucide-react'
import { notificationApi } from '../api/endpoints'
import { formatDistanceToNow } from 'date-fns'
import Avatar from './Avatar'
import { useNavigate } from 'react-router-dom'

const ICONS = {
  FRIEND_REQUEST: <UserPlus size={16} className="text-accent" />,
  FRIEND_REQUEST_ACCEPTED: <UserPlus size={16} className="text-success" />,
  POST_LIKE: <Heart size={16} className="text-error" />,
  POST_COMMENT: <MessageCircle size={16} className="text-accent-secondary" />,
  COMMENT_REPLY: <Reply size={16} className="text-accent-secondary" />,
  NEW_MESSAGE: <Mail size={16} className="text-accent" />,
  SYSTEM: <Bell size={16} className="text-text-secondary" />
}

export default function NotificationDropdown({ open, onClose, onUnreadChange }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    setLoading(true)
    notificationApi.list(0, 15)
      .then(({ data }) => setItems(data.data.content))
      .finally(() => setLoading(false))
  }, [open])

  const markAllRead = async () => {
    await notificationApi.markAllRead()
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    onUnreadChange?.(0)
  }

  const handleClick = async (n) => {
    if (!n.read) {
      await notificationApi.markRead(n.id)
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    }
    onClose()
    if (n.type === 'NEW_MESSAGE' && n.actor) navigate(`/chat/${n.actor.id}`)
    else if (n.referenceId) navigate('/')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-[22rem] max-w-[90vw] card z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="font-display font-bold">Notifications</h3>
              <button onClick={markAllRead} className="text-xs text-accent hover:underline flex items-center gap-1">
                <CheckCheck size={13} /> Mark all read
              </button>
            </div>
            <div className="max-h-[24rem] overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-text-secondary text-sm">Loading…</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-text-secondary text-sm">You're all caught up.</div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                      !n.read ? 'bg-accent/5' : ''
                    }`}
                  >
                    <Avatar src={n.actor?.profilePictureUrl} name={n.actor?.fullName} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary leading-snug">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {ICONS[n.type]}
                        <span className="text-xs text-text-secondary">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
