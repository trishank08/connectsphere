export default function Avatar({ src, name, size = 40, online, className = '' }) {
  const initials = (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover border border-white/10"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="w-full h-full rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold border border-white/10"
          style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-card ${online ? 'bg-success' : 'bg-text-secondary/50'}`}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  )
}
