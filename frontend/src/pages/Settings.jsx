import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Bell, Shield, LogOut, Loader2 } from 'lucide-react'
import { authApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../components/ConfirmDialog'

const SECTIONS = [
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'privacy', label: 'Privacy', icon: Shield },
]

export default function Settings() {
  const [section, setSection] = useState('security')
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' })
  const [saving, setSaving] = useState(false)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const { logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const changePassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authApi.changePassword(form)
      showToast('Password changed successfully', 'success')
      setForm({ currentPassword: '', newPassword: '' })
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not change password', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display font-bold text-2xl mb-1">Settings</h1>
      <p className="text-text-secondary text-sm mb-6">Manage your account, privacy and notification preferences</p>

      <div className="flex gap-6">
        <div className="w-52 shrink-0 space-y-1">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setSection(key)} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-control text-sm font-medium transition-colors ${section === key ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-white/5'}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
          <button onClick={() => setLogoutConfirm(true)} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-control text-sm font-medium text-error hover:bg-error/10 mt-4">
            <LogOut size={16} /> Log out
          </button>
        </div>

        <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex-1 card p-6">
          {section === 'security' && (
            <>
              <h3 className="font-display font-bold mb-4">Change password</h3>
              <form onSubmit={changePassword} className="max-w-sm space-y-4">
                <div>
                  <label className="text-xs text-text-secondary font-medium mb-1.5 block">Current password</label>
                  <input type="password" required className="input-field" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium mb-1.5 block">New password</label>
                  <input type="password" required minLength={8} className="input-field" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
                </div>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />} Update password
                </button>
              </form>
            </>
          )}

          {section === 'notifications' && (
            <>
              <h3 className="font-display font-bold mb-4">Notification preferences</h3>
              <div className="space-y-4">
                {['Friend requests', 'Likes and comments', 'New messages', 'Product updates'].map((label) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-text-primary">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-[22px] bg-bg-secondary rounded-full peer-checked:bg-accent transition-colors relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-transform peer-checked:after:translate-x-[18px]" />
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 'privacy' && (
            <>
              <h3 className="font-display font-bold mb-4">Privacy</h3>
              <div className="space-y-4 text-sm text-text-secondary">
                <p>Control who can see your profile, send you friend requests, and message you directly.</p>
                <p className="text-xs">More granular privacy controls are on the roadmap.</p>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={logoutConfirm} title="Log out of ConnectSphere?" description="You'll need to log in again to access your account."
        confirmLabel="Log out" danger
        onConfirm={async () => { await logout(); navigate('/login') }}
        onCancel={() => setLogoutConfirm(false)}
      />
    </div>
  )
}
