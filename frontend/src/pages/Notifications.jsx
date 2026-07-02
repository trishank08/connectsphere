import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, UserPlus, Reply, Mail, Bell, CheckCheck } from 'lucide-react'
import { notificationApi } from '../api/endpoints'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import { SkeletonUserCard } from '../components/SkeletonCard'

const ICONS = {
  FRIEND_REQUEST: <UserPlus size={18} className="text-accent" />,
  FRIEND_REQUEST_ACCEPTED: <UserPlus size={18} className="text-success" />,
  POST_LIKE: <Heart size={18} className="text-error" />,
  POST_COMMENT: <MessageCircle size={18} className="text-accent-secondary" />,
  COMMENT_REPLY: <Reply size={18} className="text-accent-secondary" />,
  NEW_MESSAGE: <Mail size={18} className="text-accent" />,
  SYSTEM: <Bell size={18} className="text-text-secondary" />
}

const CATEGORY = {
  FRIEND_REQUEST: 'Friends', FRIEND_REQUEST_ACCEPTED: 'Friends',
  POST_LIKE: 'Engagement', POST_COMMENT: 'Engagement', COMMENT_REPLY: 'Engagement',
  NEW_MESSAGE: 'Messages', SYSTEM: 'System'
}

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const navigate = useNavigate()

  useEffect(() => {
    notificationApi.list(0, 50).then(({ data }) => setItems(data.data.content)).finally(() => setLoading(false))
  }, [])

  const categories = ['All', ...new Set(Object.values(CATEGORY))]
  const filtered = filter === 'All' ? items : items.filter((n) => CATEGORY[n.type] === filter)

  const markAllRead = async () => {
    await notificationApi.markAllRead()
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleClick = async (n) => {
    if (!n.read) {
      await notificationApi.markRead(n.id)
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    }
    if (n.type === 'NEW_MESSAGE' && n.actor) navigate(`/chat/${n.actor.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1">Notifications</h1>
          <p className="text-text-secondary text-sm">Stay on top of everything happening in your network</p>
        </div>
        <button onClick={markAllRead} className="btn-secondary text-xs flex items-center gap-1.5"><CheckCheck size={14} /> Mark all read</button>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === c ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary hover:text-text-primary'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="card divide-y divide-white/5 overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonUserCard key={i} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-text-secondary text-sm">Nothing here yet.</div>
        ) : (
          filtered.map((n) => (
            <button key={n.id} onClick={() => handleClick(n)} className={`w-full text-left flex items-start gap-3 px-5 py-4 hover:bg-white/5 transition-colors ${!n.read ? 'bg-accent/5' : ''}`}>
              <Avatar src={n.actor?.profilePictureUrl} name={n.actor?.fullName} size={42} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary leading-snug">{n.message}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {ICONS[n.type]}
                  <span className="text-xs text-text-secondary">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
              {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-accent mt-1.5 shrink-0" />}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
