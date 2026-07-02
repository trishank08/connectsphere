export function SkeletonPostCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 bg-bg-secondary rounded" />
          <div className="h-2.5 w-1/4 bg-bg-secondary rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full bg-bg-secondary rounded" />
        <div className="h-3 w-5/6 bg-bg-secondary rounded" />
      </div>
      <div className="mt-4 h-48 w-full bg-bg-secondary rounded-control" />
    </div>
  )
}

export function SkeletonUserCard() {
  return (
    <div className="card p-4 flex items-center gap-3 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-bg-secondary" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-2/3 bg-bg-secondary rounded" />
        <div className="h-2.5 w-1/2 bg-bg-secondary rounded" />
      </div>
    </div>
  )
}
