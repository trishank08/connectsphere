import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-center px-4">
      <h1 className="font-display font-extrabold text-7xl bg-gradient-brand bg-clip-text text-transparent mb-3">404</h1>
      <p className="text-text-secondary mb-6">This page drifted out of your network.</p>
      <Link to="/" className="btn-primary">Back to feed</Link>
    </div>
  )
}
