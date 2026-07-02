import { useRef, useState } from 'react'
import { Image as ImageIcon, Smile, X, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { postApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Avatar from './Avatar'

export default function CreatePostCard({ onPostCreated }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [posting, setPosting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const submit = async () => {
    if (!content.trim() && !imageFile) return
    setPosting(true)
    try {
      let imageUrl = null
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const { data } = await postApi.uploadImage(formData)
        imageUrl = data.data
      }
      const { data } = await postApi.create({ content: content.trim(), imageUrl, sharedPostId: null })
      onPostCreated?.(data.data)
      setContent(''); setImageFile(null); setImagePreview(null); setExpanded(false)
      showToast('Post published', 'success')
    } catch (e) {
      showToast(e.response?.data?.message || 'Could not create post', 'error')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="card p-5">
      <div className="flex gap-3">
        <Avatar src={user?.profilePictureUrl} name={user?.fullName} size={44} />
        <div className="flex-1">
          <textarea
            value={content}
            onFocus={() => setExpanded(true)}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0]}?`}
            rows={expanded ? 3 : 1}
            className="w-full bg-transparent resize-none outline-none placeholder:text-text-secondary/70 text-[15px] leading-relaxed"
          />

          {imagePreview && (
            <div className="relative mt-2 rounded-control overflow-hidden">
              <img src={imagePreview} alt="preview" className="w-full max-h-72 object-cover" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null) }}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 hover:bg-black/80"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          )}

          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-1">
                <button onClick={() => fileInputRef.current?.click()} className="btn-ghost flex items-center gap-1.5 text-sm">
                  <ImageIcon size={17} className="text-success" /> Photo
                </button>
                <button className="btn-ghost flex items-center gap-1.5 text-sm">
                  <Smile size={17} className="text-accent-secondary" /> Feeling
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFile} />
              </div>
              <button onClick={submit} disabled={posting || (!content.trim() && !imageFile)} className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
                {posting && <Loader2 size={14} className="animate-spin" />}
                Post
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
