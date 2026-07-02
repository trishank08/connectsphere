import { Bookmark } from 'lucide-react'

export default function Saved() {
  return (
    <div className="max-w-2xl mx-auto card p-12 text-center">
      <Bookmark size={28} className="mx-auto text-accent mb-3" />
      <h2 className="font-display font-bold text-lg mb-1">Saved posts</h2>
      <p className="text-text-secondary text-sm">Posts you save will show up here. This feature is coming soon.</p>
    </div>
  )
}
