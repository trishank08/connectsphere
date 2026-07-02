import { NavLink } from 'react-router-dom'
import { Home, Users, Bell, MessageCircle, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', icon: Home, end: true },
  { to: '/friends', icon: Users },
  { to: '/notifications', icon: Bell },
  { to: '/chat', icon: MessageCircle },
]

export default function BottomNav() {
  const { user } = useAuth()
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 flex items-center justify-around h-16 px-2">
      {links.map(({ to, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `p-3 rounded-control ${isActive ? 'text-accent' : 'text-text-secondary'}`}
        >
          <Icon size={22} />
        </NavLink>
      ))}
      <NavLink to={`/profile/${user?.id}`} className={({ isActive }) => `p-2 rounded-full ${isActive ? 'ring-2 ring-accent' : ''}`}>
        <User size={22} className="text-text-secondary" />
      </NavLink>
    </nav>
  )
}
