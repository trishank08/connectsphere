export default function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-white/10 border-t-accent ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
