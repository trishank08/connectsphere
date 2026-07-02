import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, FileText, MessageSquare, Clock, ShieldOff, ShieldCheck, Trash2 } from 'lucide-react'
import { adminApi } from '../api/endpoints'
import { useToast } from '../context/ToastContext'
import Avatar from '../components/Avatar'
import ConfirmDialog from '../components/ConfirmDialog'
import { SkeletonUserCard } from '../components/SkeletonCard'

const STAT_CARDS = [
  { key: 'totalUsers', label: 'Total users', icon: Users, color: 'text-accent' },
  { key: 'activeUsers', label: 'Active users', icon: ShieldCheck, color: 'text-success' },
  { key: 'totalPosts', label: 'Total posts', icon: FileText, color: 'text-accent-secondary' },
  { key: 'totalComments', label: 'Total comments', icon: MessageSquare, color: 'text-accent' },
  { key: 'totalMessages', label: 'Messages sent', icon: MessageSquare, color: 'text-accent-secondary' },
  { key: 'pendingFriendRequests', label: 'Pending requests', icon: Clock, color: 'text-error' },
]

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const { showToast } = useToast()

  const load = async () => {
    setLoading(true)
    const [{ data: dashboard }, { data: userList }] = await Promise.all([adminApi.dashboard(), adminApi.users(0, 20)])
    setStats(dashboard.data)
    setUsers(userList.data.content)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleEnabled = async (u) => {
    try {
      u.enabled ? await adminApi.disable(u.id) : await adminApi.enable(u.id)
      showToast(u.enabled ? 'User disabled' : 'User enabled', 'success')
      load()
    } catch { showToast('Action failed', 'error') }
  }

  const deleteUser = async () => {
    try {
      await adminApi.deleteUser(confirmTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== confirmTarget.id))
      showToast('User deleted', 'success')
    } catch { showToast('Could not delete user', 'error') }
    setConfirmTarget(null)
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl mb-1">Admin dashboard</h1>
      <p className="text-text-secondary text-sm mb-6">Platform analytics and user moderation</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map(({ key, label, icon: Icon, color }, i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
            <Icon size={18} className={color} />
            <p className="text-2xl font-display font-bold mt-3">{loading ? '—' : stats?.[key]}</p>
            <p className="text-xs text-text-secondary mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="font-display font-bold">User management</h2>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonUserCard key={i} />)}</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                <Avatar src={u.profilePictureUrl} name={u.fullName} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.fullName}</p>
                  <p className="text-xs text-text-secondary truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${u.roles.includes('ROLE_ADMIN') ? 'bg-accent-secondary/10 text-accent-secondary' : 'bg-bg-secondary text-text-secondary'}`}>
                  {u.roles.includes('ROLE_ADMIN') ? 'Admin' : 'Member'}
                </span>
                <button onClick={() => toggleEnabled(u)} className="btn-ghost p-2" title={u.enabled ? 'Disable' : 'Enable'}>
                  {u.enabled ? <ShieldOff size={16} className="text-error" /> : <ShieldCheck size={16} className="text-success" />}
                </button>
                <button onClick={() => setConfirmTarget(u)} className="btn-ghost p-2 text-error"><Trash2 size={16} /></button>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmTarget} title={`Delete ${confirmTarget?.fullName}?`}
        description="This permanently removes the account and all associated content." confirmLabel="Delete" danger
        onConfirm={deleteUser} onCancel={() => setConfirmTarget(null)}
      />
    </div>
  )
}
