import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import AuthLayout from './AuthLayout'
import FloatingInput from '../components/FloatingInput'
import { authApi } from '../api/endpoints'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {sent ? (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-4">
            <MailCheck size={26} />
          </div>
          <h2 className="font-display font-bold text-xl mb-2">Check your inbox</h2>
          <p className="text-text-secondary text-sm mb-6">If an account exists for {email}, a reset link is on its way.</p>
          <Link to="/login" className="text-accent text-sm font-medium hover:underline">Back to login</Link>
        </div>
      ) : (
        <>
          <h2 className="font-display font-bold text-2xl mb-1">Reset your password</h2>
          <p className="text-text-secondary text-sm mb-8">Enter your email and we'll send you a reset link</p>
          <form onSubmit={submit}>
            <FloatingInput label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />} Send reset link
            </button>
          </form>
          <p className="text-center text-sm text-text-secondary mt-8">
            <Link to="/login" className="text-accent font-medium hover:underline">Back to login</Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
