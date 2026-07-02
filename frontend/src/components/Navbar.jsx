import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, MessageCircle, Search, Sparkles, LogOut, Settings as SettingsIcon, User as UserIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { notificationApi, messageApi, userApi } from '../api/endpoints'
import Avatar from './Avatar'
import NotificationDropdown from './NotificationDropdown'

export default function Navbar() {
  const { user, logout } = useAuth()
  const socket = useSocket()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadNotif, setUnreadNotif] = useState(0)
  const [unreadMsg, setUnreadMsg] = useState(0)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    notificationApi.unreadCount().then(({ data }) => setUnreadNotif(data.data))
    messageApi.unreadCount().then(({ data }) => setUnreadMsg(data.data))
  }, [])

  useEffect(() => {
    if (!socket) return
    const offNotif = socket.onNotification(() => setUnreadNotif((c) => c + 1))
    const offMsg = socket.onMessage(() => setUnreadMsg((c) => c + 1))
    return () => { offNotif(); offMsg() }
  }, [socket])

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const t = setTimeout(() => {
      userApi.search(query).then(({ data }) => setResults(data.data.content.slice(0, 6)))
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-control bg-gradient-brand flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-display font-extrabold text-lg tracking-tight hidden sm:block">ConnectSphere</span>
        </Link>

        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            placeholder="Search people…"
            className="input-field pl-10 py-2 text-sm"
          />
          <AnimatePresence>
            {searchOpen && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-11 left-0 right-0 card overflow-hidden z-50"
              >
                {results.map((u) => (
                  <button
                    key={u.id}
                    onMouseDown={() => navigate(`/profile/${u.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 text-left"
                  >
                    <Avatar src={u.profilePictureUrl} name={u.fullName} size={32} />
                    <div>
                      <p className="text-sm font-medium">{u.fullName}</p>
                      <p className="text-xs text-text-secondary">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex items-center gap-1 ml-auto">
          <Link to="/chat" className="relative btn-ghost" onClick={() => setUnreadMsg(0)}>
            <MessageCircle size={20} />
            {unreadMsg > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadMsg > 9 ? '9+' : unreadMsg}
              </span>
            )}
          </Link>

          <div className="relative">
            <button className="relative btn-ghost" onClick={() => setNotifOpen((o) => !o)}>
              <Bell size={20} />
              {unreadNotif > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-error text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pop">
                  {unreadNotif > 9 ? '9+' : unreadNotif}
                </span>
              )}
            </button>
            <NotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} onUnreadChange={setUnreadNotif} />
          </div>

          <div className="relative">
            <button onClick={() => setProfileOpen((o) => !o)} className="ml-1 flex items-center">
              <Avatar src={user?.profilePictureUrl} name={user?.fullName} size={34} online />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-56 card z-50 p-2"
                  >
                    <Link to={`/profile/${user?.id}`} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-control hover:bg-white/5 text-sm">
                      <UserIcon size={16} /> View profile
                    </Link>
                    <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-control hover:bg-white/5 text-sm">
                      <SettingsIcon size={16} /> Settings
                    </Link>
                    <button onClick={() => { logout(); navigate('/login') }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-control hover:bg-error/10 text-error text-sm">
                      <LogOut size={16} /> Log out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </header>
  )
}
