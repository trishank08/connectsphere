import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AuthLayout from './AuthLayout'
import FloatingInput from '../components/FloatingInput'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Register() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      await register(form)
      showToast('Account created — welcome to ConnectSphere!', 'success')
      navigate('/')
    } catch (err) {
      const payload = err.response?.data
      if (payload?.data?.errors) setErrors(payload.data.errors)
      else showToast(payload?.message || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display font-bold text-2xl mb-1">Create your account</h2>
      <p className="text-text-secondary text-sm mb-8">Join a network built around real people</p>

      <form onSubmit={submit}>
        <FloatingInput label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} error={errors.fullName} required />
        <FloatingInput label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} error={errors.username} required />
        <FloatingInput label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} required />
        <FloatingInput label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} required />

        <p className="text-xs text-text-secondary mb-6 -mt-2">
          Use 8+ characters with a mix of upper/lowercase letters and a number.
        </p>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />} Create account
        </button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-8">
        Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  )
}
