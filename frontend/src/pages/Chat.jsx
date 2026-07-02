import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Smile, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { friendApi, messageApi } from '../api/endpoints'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Avatar from '../components/Avatar'

const EMOJIS = ['😀', '😂', '❤️', '👍', '🔥', '🎉', '😮', '😢', '🙏', '👏', '💯', '✨']

export default function Chat() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const socket = useSocket()
  const [contacts, setContacts] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [typingFrom, setTypingFrom] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [search, setSearch] = useState('')
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    friendApi.list().then(({ data }) => setContacts(data.data))
  }, [])

  useEffect(() => {
    if (!userId || contacts.length === 0) return
    const c = contacts.find((f) => String(f.id) === String(userId))
    if (c) setActive(c)
  }, [userId, contacts])

  const loadConversation = useCallback(async (otherUserId) => {
    const { data } = await messageApi.conversation(otherUserId, 0, 50)
    setMessages([...data.data.content].reverse())
    messageApi.markRead(otherUserId)
  }, [])

  useEffect(() => {
    if (active) loadConversation(active.id)
  }, [active, loadConversation])

  useEffect(() => {
    if (!socket) return
    const offMsg = socket.onMessage((msg) => {
      if (active && (msg.senderId === active.id || msg.receiverId === active.id)) {
        setMessages((prev) => [...prev, msg])
      }
    })
    const offTyping = socket.onTyping((event) => {
      if (event.typing) {
        setTypingFrom(event.fromEmail)
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => setTypingFrom(null), 2500)
      } else {
        setTypingFrom(null)
      }
    })
    return () => { offMsg(); offTyping() }
  }, [socket, active])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = () => {
    if (!text.trim() || !active) return
    socket?.sendChatMessage(active.id, text.trim())
    setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, senderId: user.id, receiverId: active.id, content: text.trim(), createdAt: new Date().toISOString() }])
    setText('')
    setShowEmoji(false)
  }

  const handleTyping = (val) => {
    setText(val)
    if (active) socket?.sendTyping(active.email, true)
  }

  const filteredContacts = contacts.filter((c) => c.fullName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="card overflow-hidden flex h-[calc(100vh-9.5rem)] lg:h-[calc(100vh-7rem)]">
      {/* Conversation list — Discord-style */}
      <div className={`w-full sm:w-72 shrink-0 border-r border-white/5 flex flex-col ${active ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/5">
          <h2 className="font-display font-bold mb-3">Messages</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search friends…" className="input-field pl-9 py-2 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((c) => (
            <button key={c.id} onClick={() => navigate(`/chat/${c.id}`)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${active?.id === c.id ? 'bg-accent/10' : ''}`}>
              <Avatar src={c.profilePictureUrl} name={c.fullName} size={42} online={c.online} />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{c.fullName}</p>
                <p className="text-xs text-text-secondary truncate">{c.online ? 'Online' : 'Offline'}</p>
              </div>
            </button>
          ))}
          {filteredContacts.length === 0 && <p className="text-center text-text-secondary text-xs py-8">No friends to chat with yet.</p>}
        </div>
      </div>

      {/* Active conversation */}
      <div className={`flex-1 flex flex-col ${active ? 'flex' : 'hidden sm:flex'}`}>
        {active ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
              <button className="sm:hidden text-text-secondary text-sm" onClick={() => navigate('/chat')}>←</button>
              <Avatar src={active.profilePictureUrl} name={active.fullName} size={38} online={active.online} />
              <div>
                <p className="text-sm font-semibold">{active.fullName}</p>
                <p className="text-xs text-text-secondary">
                  {typingFrom === active.email ? <span className="text-accent">typing…</span> : active.online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((m) => {
                const mine = m.senderId === user.id
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${mine ? 'bg-gradient-brand text-white rounded-br-md' : 'bg-bg-secondary text-text-primary rounded-bl-md'}`}>
                      <p>{m.content}</p>
                      <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-text-secondary'}`}>
                        {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <div className="relative p-4 border-t border-white/5 flex items-center gap-2">
              {showEmoji && (
                <div className="absolute bottom-16 left-4 card p-3 grid grid-cols-6 gap-1 z-10">
                  {EMOJIS.map((e) => (
                    <button key={e} onClick={() => setText((t) => t + e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                  ))}
                </div>
              )}
              <button onClick={() => setShowEmoji((s) => !s)} className="btn-ghost p-2.5"><Smile size={19} /></button>
              <input
                value={text} onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message…" className="input-field flex-1 py-2.5 text-sm"
              />
              <button onClick={send} className="btn-primary p-2.5"><Send size={17} /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">Select a conversation to start chatting</div>
        )}
      </div>
    </div>
  )
}
