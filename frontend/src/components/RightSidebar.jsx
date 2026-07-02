import { useEffect, useState } from 'react'
import { UserPlus, TrendingUp } from 'lucide-react'
import { userApi, friendApi } from '../api/endpoints'
import { useToast } from '../context/ToastContext'
import Avatar from './Avatar'
import { Link } from 'react-router-dom'
import { SkeletonUserCard } from './SkeletonCard'

export default function RightSidebar() {
  const [suggested, setSuggested] = useState([])
  const [loading, setLoading] = useState(true)
  const [sentIds, setSentIds] = useState(new Set())
  const { showToast } = useToast()

  useEffect(() => {
    userApi.suggested(6)
      .then(({ data }) => setSuggested(data.data))
      .finally(() => setLoading(false))
  }, [])

  const sendRequest = async (userId) => {
    try {
      await friendApi.send(userId)
      setSentIds((prev) => new Set(prev).add(userId))
      showToast('Friend request sent', 'success')
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not send request', 'error')
    }
  }

  return (
    <aside className="hidden xl:flex flex-col w-80 shrink-0 sticky top-20 self-start gap-4">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-accent-secondary" />
          <h3 className="font-display font-bold text-sm">Trending on ConnectSphere</h3>
        </div>
        <ul className="space-y-3">
          {['#ProductDesign', '#RemoteWork', '#IndieHackers', '#GenerativeAI'].map((tag, i) => (
            <li key={tag} className="flex items-center justify-between text-sm">
              <span className="text-text-primary font-medium">{tag}</span>
              <span className="text-text-secondary text-xs">{(4 - i) * 1.2}k posts</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-5">
        <h3 className="font-display font-bold text-sm mb-4">People you may know</h3>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonUserCard key={i} />)
          ) : suggested.length === 0 ? (
            <p className="text-xs text-text-secondary">No suggestions right now — check back soon.</p>
          ) : (
            suggested.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <Link to={`/profile/${u.id}`}>
                  <Avatar src={u.profilePictureUrl} name={u.fullName} size={40} online={u.online} />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${u.id}`} className="text-sm font-medium hover:underline block truncate">{u.fullName}</Link>
                  <p className="text-xs text-text-secondary truncate">@{u.username}</p>
                </div>
                <button
                  onClick={() => sendRequest(u.id)}
                  disabled={sentIds.has(u.id)}
                  className="p-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 disabled:opacity-40 transition-colors"
                  title="Add friend"
                >
                  <UserPlus size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  )
}
