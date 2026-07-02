import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, MapPin, UserPlus, UserCheck, UserX, MessageCircle, Pencil } from 'lucide-react'
import { userApi, postApi, friendApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import { SkeletonPostCard } from '../components/SkeletonCard'
import EditProfileModal from '../components/EditProfileModal'
import { Link } from 'react-router-dom'

const TABS = ['Posts', 'About', 'Media', 'Friends']

export default function Profile() {
  const { userId } = useParams()
  const { user: currentUser, setUser } = useAuth()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [friends, setFriends] = useState([])
  const [tab, setTab] = useState('Posts')
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const coverInputRef = useRef(null)
  const avatarInputRef = useRef(null)
  const isOwnProfile = String(currentUser?.id) === String(userId)

  const load = async () => {
    setLoading(true)
    const [{ data: profileData }, { data: postsData }] = await Promise.all([
      userApi.getProfile(userId),
      postApi.timeline(userId, 0, 10),
    ])
    setProfile(profileData.data)
    setPosts(postsData.data.content)
    setLoading(false)
  }

  useEffect(() => { load() }, [userId])

  useEffect(() => { if (tab === 'Friends') friendApi.list().then(({ data }) => setFriends(data.data)) }, [tab])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData(); formData.append('file', file)
    const { data } = await userApi.uploadProfilePicture(formData)
    setProfile((p) => ({ ...p, profilePictureUrl: data.data }))
    if (isOwnProfile) setUser((u) => ({ ...u, profilePictureUrl: data.data }))
    showToast('Profile picture updated', 'success')
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData(); formData.append('file', file)
    const { data } = await userApi.uploadCoverPhoto(formData)
    setProfile((p) => ({ ...p, coverPhotoUrl: data.data }))
    showToast('Cover photo updated', 'success')
  }

  const handleFriendAction = async () => {
    try {
      if (profile.friendshipStatus === 'NONE') {
        await friendApi.send(profile.id)
        setProfile((p) => ({ ...p, friendshipStatus: 'REQUEST_SENT' }))
        showToast('Friend request sent', 'success')
      } else if (profile.friendshipStatus === 'FRIENDS') {
        await friendApi.remove(profile.id)
        setProfile((p) => ({ ...p, friendshipStatus: 'NONE', friendCount: p.friendCount - 1 }))
        showToast('Friend removed', 'info')
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Action failed', 'error')
    }
  }

  if (loading || !profile) {
    return <div className="max-w-3xl mx-auto space-y-4"><SkeletonPostCard /><SkeletonPostCard /></div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card overflow-hidden">
        <div className="relative h-52 sm:h-64 bg-gradient-brand group">
          {profile.coverPhotoUrl && <img src={profile.coverPhotoUrl} alt="cover" className="w-full h-full object-cover" />}
          {isOwnProfile && (
            <button onClick={() => coverInputRef.current?.click()} className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white text-xs font-medium rounded-control px-3 py-2 flex items-center gap-1.5 transition-colors">
              <Camera size={14} /> Edit cover
            </button>
          )}
          <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={handleCoverUpload} />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-14">
            <div className="relative w-fit">
              <Avatar src={profile.profilePictureUrl} name={profile.fullName} size={112} online={profile.online} className="border-4 border-card rounded-full" />
              {isOwnProfile && (
                <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-1 right-1 bg-accent text-white rounded-full p-2 hover:brightness-110">
                  <Camera size={13} />
                </button>
              )}
              <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
            </div>

            <div className="flex gap-2 mt-4 sm:mt-0">
              {isOwnProfile ? (
                <button onClick={() => setEditOpen(true)} className="btn-secondary text-sm flex items-center gap-2"><Pencil size={14} /> Edit profile</button>
              ) : (
                <>
                  <Link to={`/chat/${profile.id}`} className="btn-secondary text-sm flex items-center gap-2"><MessageCircle size={14} /> Message</Link>
                  {profile.friendshipStatus === 'FRIENDS' && (
                    <button onClick={handleFriendAction} className="btn-secondary text-sm flex items-center gap-2 text-error"><UserX size={14} /> Remove friend</button>
                  )}
                  {profile.friendshipStatus === 'NONE' && (
                    <button onClick={handleFriendAction} className="btn-primary text-sm flex items-center gap-2"><UserPlus size={14} /> Add friend</button>
                  )}
                  {profile.friendshipStatus === 'REQUEST_SENT' && (
                    <button disabled className="btn-secondary text-sm flex items-center gap-2 opacity-60"><UserCheck size={14} /> Request sent</button>
                  )}
                  {profile.friendshipStatus === 'REQUEST_RECEIVED' && (
                    <span className="btn-secondary text-sm flex items-center gap-2 opacity-80"><UserCheck size={14} /> Respond in Friends tab</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h1 className="font-display font-bold text-2xl">{profile.fullName}</h1>
            <p className="text-text-secondary text-sm">@{profile.username}</p>
            {profile.bio && <p className="mt-3 text-[15px] text-text-primary/90 max-w-xl">{profile.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-text-secondary">
              {profile.location && <span className="flex items-center gap-1"><MapPin size={13} /> {profile.location}</span>}
              <span><strong className="text-text-primary">{profile.friendCount}</strong> friends</span>
              <span><strong className="text-text-primary">{profile.postCount}</strong> posts</span>
            </div>
          </div>

          <div className="flex gap-1 mt-6 border-b border-white/5">
            {TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {tab === 'Posts' && (posts.length === 0
          ? <div className="card p-10 text-center text-text-secondary text-sm">No posts yet.</div>
          : posts.map((p) => <PostCard key={p.id} post={p} onDeleted={(id) => setPosts((prev) => prev.filter((x) => x.id !== id))} />))}

        {tab === 'About' && (
          <div className="card p-6 space-y-5">
            <div>
              <h3 className="font-display font-bold text-sm mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length ? profile.skills.map((s) => (
                  <span key={s} className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full">{s}</span>
                )) : <p className="text-text-secondary text-sm">No skills added yet.</p>}
              </div>
            </div>
            <div>
              <h3 className="font-display font-bold text-sm mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.length ? profile.interests.map((s) => (
                  <span key={s} className="text-xs bg-accent-secondary/10 text-accent-secondary px-3 py-1.5 rounded-full">{s}</span>
                )) : <p className="text-text-secondary text-sm">No interests added yet.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'Media' && (
          <div className="grid grid-cols-3 gap-2">
            {posts.filter((p) => p.imageUrl).map((p) => (
              <img key={p.id} src={p.imageUrl} alt="media" className="rounded-control aspect-square object-cover" />
            ))}
            {posts.filter((p) => p.imageUrl).length === 0 && <p className="col-span-3 text-text-secondary text-sm text-center py-10">No media yet.</p>}
          </div>
        )}

        {tab === 'Friends' && (
          <div className="grid sm:grid-cols-2 gap-3">
            {friends.map((f) => (
              <Link key={f.id} to={`/profile/${f.id}`} className="card p-4 flex items-center gap-3 hover:border-accent/30 transition-colors">
                <Avatar src={f.profilePictureUrl} name={f.fullName} size={44} online={f.online} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{f.fullName}</p>
                  <p className="text-xs text-text-secondary truncate">@{f.username}</p>
                </div>
              </Link>
            ))}
            {friends.length === 0 && <p className="col-span-2 text-text-secondary text-sm text-center py-10">No friends yet.</p>}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <EditProfileModal
          open={editOpen}
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => { setProfile(updated); setEditOpen(false) }}
        />
      )}
    </div>
  )
}
