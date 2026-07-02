import { NavLink } from 'react-router-dom'
import { Home, Users, Bell, MessageCircle, Settings, ShieldCheck, Bookmark } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/friends', label: 'Friend network', icon: Users },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/chat', label: 'Messages', icon: MessageCircle },
  { to: '/saved', label: 'Saved posts', icon: Bookmark },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { user, isAdmin } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-20 self-start gap-1">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-control text-sm font-medium transition-all ${
              isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}

      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-control text-sm font-medium transition-all ${
              isActive ? 'bg-accent-secondary/10 text-accent-secondary' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            }`
          }
        >
          <ShieldCheck size={18} />
          Admin dashboard
        </NavLink>
      )}

      <div className="mt-4 card p-4">
        <p className="text-xs text-text-secondary leading-relaxed">
          Signed in as <span className="text-text-primary font-medium">{user?.fullName}</span>
        </p>
      </div>
    </aside>
  )
}
