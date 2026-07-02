import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { userApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function StoryHighlights() {
  const { user } = useAuth()
  const [people, setPeople] = useState([])

  useEffect(() => {
    userApi.suggested(10).then(({ data }) => setPeople(data.data))
  }, [])

  return (
    <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="relative">
          <Avatar src={user?.profilePictureUrl} name={user?.fullName} size={64} />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center border-2 border-bg">
            <Plus size={13} className="text-white" />
          </div>
        </div>
        <span className="text-xs text-text-secondary">Your story</span>
      </div>
      {people.map((p) => (
        <div key={p.id} className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="p-[2.5px] rounded-full bg-gradient-brand">
            <div className="p-[2px] rounded-full bg-bg">
              <Avatar src={p.profilePictureUrl} name={p.fullName} size={60} />
            </div>
          </div>
          <span className="text-xs text-text-secondary max-w-[64px] truncate">{p.fullName.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  )
}
