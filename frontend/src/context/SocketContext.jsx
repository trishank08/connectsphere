import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const clientRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [messageHandlers] = useState(new Set())
  const [notificationHandlers] = useState(new Set())
  const [typingHandlers] = useState(new Set())

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!user || !token) return

    const client = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL || '/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/user/queue/messages', (frame) => {
          const body = JSON.parse(frame.body)
          messageHandlers.forEach((fn) => fn(body))
        })
        client.subscribe('/user/queue/notifications', (frame) => {
          const body = JSON.parse(frame.body)
          notificationHandlers.forEach((fn) => fn(body))
        })
        client.subscribe('/user/queue/typing', (frame) => {
          const body = JSON.parse(frame.body)
          typingHandlers.forEach((fn) => fn(body))
        })
      },
      onDisconnect: () => setConnected(false)
    })

    client.activate()
    clientRef.current = client

    return () => client.deactivate()
  }, [user])

  const sendChatMessage = useCallback((receiverId, content) => {
    clientRef.current?.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ receiverId, content })
    })
  }, [])

  const sendTyping = useCallback((receiverEmail, typing) => {
    clientRef.current?.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify({ receiverEmail, senderEmail: user?.email, typing })
    })
  }, [user])

  const onMessage = useCallback((fn) => {
    messageHandlers.add(fn)
    return () => messageHandlers.delete(fn)
  }, [messageHandlers])

  const onNotification = useCallback((fn) => {
    notificationHandlers.add(fn)
    return () => notificationHandlers.delete(fn)
  }, [notificationHandlers])

  const onTyping = useCallback((fn) => {
    typingHandlers.add(fn)
    return () => typingHandlers.delete(fn)
  }, [typingHandlers])

  return (
    <SocketContext.Provider value={{ connected, sendChatMessage, sendTyping, onMessage, onNotification, onTyping }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
