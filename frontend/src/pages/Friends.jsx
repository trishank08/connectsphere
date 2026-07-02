import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, UserX, Clock, Users, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { friendApi, userApi } from '../api/endpoints'
import { useToast } from '../context/ToastContext'
import Avatar from '../components/Avatar'
import { SkeletonUserCard } from '../components/SkeletonCard'

const TABS = [
  { key: 'suggestions', label: 'Suggestions', icon: UserPlus },
  { key: 'pending', label: 'Requests', icon: Clock },
  { key: 'friends', label: 'All friends', icon: Users },
]

export default function Friends() {
  const [tab, setTab] = useState('suggestions')
  const [suggestions, setSuggestions] = useState([])
  const [pending, setPending] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [mutuals, setMutuals] = useState({})
  const { showToast } = useToast()

  const loadAll = async () => {
    setLoading(true)
    const [{ data: sug }, { data: pend }, { data: fr }] = await Promise.all([
      userApi.suggested(12), friendApi.pending(), friendApi.list(),
    ])
    setSuggestions(sug.data)
    setPending(pend.data)
    setFriends(fr.data)
    setLoading(false)

    const mutualEntries = await Promise.all(sug.data.map(async (u) => [u.id, (await friendApi.mutualCount(u.id)).data.data]))
    setMutuals(Object.fromEntries(mutualEntries))
  }

  useEffect(() => { loadAll() }, [])

  const sendRequest = async (userId) => {
    try {
      await friendApi.send(userId)
      setSuggestions((prev) => prev.filter((u) => u.id !== userId))
      showToast('Friend request sent', 'success')
    } catch (e) { showToast(e.response?.data?.message || 'Could not send request', 'error') }
  }

  const accept = async (requestId) => {
    await friendApi.accept(requestId)
    setPending((prev) => prev.filter((r) => r.id !== requestId))
    showToast('Friend request accepted', 'success')
    loadAll()
  }

  const reject = async (requestId) => {
    await friendApi.reject(requestId)
    setPending((prev) => prev.filter((r) => r.id !== requestId))
    showToast('Friend request declined', 'info')
  }

  const removeFriend = async (friendId) => {
    await friendApi.remove(friendId)
    setFriends((prev) => prev.filter((f) => f.id !== friendId))
    showToast('Friend removed', 'info')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display font-bold text-2xl mb-1">Friend network</h1>
      <p className="text-text-secondary text-sm mb-6">Discover new people and manage your connections</p>

      <div className="flex gap-1 mb-6 card p-1.5 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-control text-sm font-medium transition-colors ${tab === key ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}>
            <Icon size={15} /> {label}
            {key === 'pending' && pending.length > 0 && <span className="bg-error text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{pending.length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonUserCard key={i} />)}</div>
      ) : (
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {tab === 'suggestions' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {suggestions.map((u) => (
                <div key={u.id} className="card p-4 flex items-center gap-3">
                  <Link to={`/profile/${u.id}`}><Avatar src={u.profilePictureUrl} name={u.fullName} size={48} online={u.online} /></Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${u.id}`} className="text-sm font-semibold hover:underline block truncate">{u.fullName}</Link>
                    <p className="text-xs text-text-secondary">{mutuals[u.id] > 0 ? `${mutuals[u.id]} mutual friends` : `@${u.username}`}</p>
                  </div>
                  <button onClick={() => sendRequest(u.id)} className="btn-primary text-xs py-2 px-3">Add</button>
                </div>
              ))}
              {suggestions.length === 0 && <p className="text-text-secondary text-sm col-span-2 text-center py-10">No suggestions right now.</p>}
            </div>
          )}

          {tab === 'pending' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {pending.map((r) => (
                <div key={r.id} className="card p-4 flex items-center gap-3">
                  <Avatar src={r.sender.profilePictureUrl} name={r.sender.fullName} size={48} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{r.sender.fullName}</p>
                    <p className="text-xs text-text-secondary">{r.mutualFriendCount > 0 ? `${r.mutualFriendCount} mutual friends` : `wants to connect`}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => accept(r.id)} className="p-2 rounded-full bg-success/10 text-success hover:bg-success/20"><UserCheck size={16} /></button>
                    <button onClick={() => reject(r.id)} className="p-2 rounded-full bg-error/10 text-error hover:bg-error/20"><UserX size={16} /></button>
                  </div>
                </div>
              ))}
              {pending.length === 0 && <p className="text-text-secondary text-sm col-span-2 text-center py-10">No pending requests.</p>}
            </div>
          )}

          {tab === 'friends' && (
            <div className="grid sm:grid-cols-2 gap-3">
              {friends.map((f) => (
                <div key={f.id} className="card p-4 flex items-center gap-3">
                  <Link to={`/profile/${f.id}`}><Avatar src={f.profilePictureUrl} name={f.fullName} size={48} online={f.online} /></Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${f.id}`} className="text-sm font-semibold hover:underline block truncate">{f.fullName}</Link>
                    <p className="text-xs text-text-secondary truncate">@{f.username}</p>
                  </div>
                  <button onClick={() => removeFriend(f.id)} className="btn-ghost text-xs text-error">Remove</button>
                </div>
              ))}
              {friends.length === 0 && <p className="text-text-secondary text-sm col-span-2 text-center py-10">No friends yet — start connecting!</p>}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
