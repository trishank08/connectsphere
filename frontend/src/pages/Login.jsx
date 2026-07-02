import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AuthLayout from './AuthLayout'
import FloatingInput from '../components/FloatingInput'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      showToast('Welcome back!', 'success')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display font-bold text-2xl mb-1">Welcome back</h2>
      <p className="text-text-secondary text-sm mb-8">Log in to continue to ConnectSphere</p>

      <form onSubmit={submit}>
        <FloatingInput label="Email address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <FloatingInput label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        {error && <p className="text-error text-sm mb-4 -mt-2">{error}</p>}

        <div className="flex justify-end mb-6">
          <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />} Log in
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-text-secondary">or continue with</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="btn-secondary text-sm">Google</button>
        <button type="button" className="btn-secondary text-sm">GitHub</button>
      </div>

      <p className="text-center text-sm text-text-secondary mt-8">
        New here? <Link to="/register" className="text-accent font-medium hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
