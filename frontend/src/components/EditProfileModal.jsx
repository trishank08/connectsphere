import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Plus, Loader2 } from 'lucide-react'
import { userApi } from '../api/endpoints'
import { useToast } from '../context/ToastContext'

export default function EditProfileModal({ open, profile, onClose, onSaved }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({ fullName: '', bio: '', location: '', skills: [], interests: [] })
  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        location: profile.location || '',
        skills: profile.skills ? [...profile.skills] : [],
        interests: profile.interests ? [...profile.interests] : [],
      })
    }
  }, [profile, open])

  const addTag = (field, value, setValue) => {
    if (!value.trim()) return
    setForm((f) => ({ ...f, [field]: [...new Set([...f[field], value.trim()])] }))
    setValue('')
  }

  const removeTag = (field, value) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((v) => v !== value) }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await userApi.updateProfile(form)
      onSaved(data.data)
      showToast('Profile updated', 'success')
    } catch {
      showToast('Could not update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="card w-full max-w-lg max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg">Edit profile</h3>
              <button onClick={onClose} className="btn-ghost p-2"><X size={18} /></button>
            </div>

            <label className="text-xs text-text-secondary font-medium mb-1.5 block">Full name</label>
            <input className="input-field mb-4" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />

            <label className="text-xs text-text-secondary font-medium mb-1.5 block">Bio</label>
            <textarea rows={3} className="input-field mb-4 resize-none" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />

            <label className="text-xs text-text-secondary font-medium mb-1.5 block">Location</label>
            <input className="input-field mb-4" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

            <label className="text-xs text-text-secondary font-medium mb-1.5 block">Skills</label>
            <div className="flex gap-2 mb-2">
              <input className="input-field flex-1" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('skills', skillInput, setSkillInput))}
                placeholder="e.g. Product Design" />
              <button onClick={() => addTag('skills', skillInput, setSkillInput)} className="btn-secondary px-3"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {form.skills.map((s) => (
                <span key={s} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  {s} <button onClick={() => removeTag('skills', s)}><X size={11} /></button>
                </span>
              ))}
            </div>

            <label className="text-xs text-text-secondary font-medium mb-1.5 block">Interests</label>
            <div className="flex gap-2 mb-2">
              <input className="input-field flex-1" value={interestInput} onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('interests', interestInput, setInterestInput))}
                placeholder="e.g. Photography" />
              <button onClick={() => addTag('interests', interestInput, setInterestInput)} className="btn-secondary px-3"><Plus size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {form.interests.map((s) => (
                <span key={s} className="text-xs bg-accent-secondary/10 text-accent-secondary px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  {s} <button onClick={() => removeTag('interests', s)}><X size={11} /></button>
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />} Save changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
