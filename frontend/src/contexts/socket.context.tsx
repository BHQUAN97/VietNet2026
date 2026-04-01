'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './auth.context'
import type { RealtimeNotification } from '@/types'

interface SocketContextValue {
  connected: boolean
  notifications: RealtimeNotification[]
  unreadCount: number
  clearNotifications: () => void
}

const SocketContext = createContext<SocketContextValue>({
  connected: false,
  notifications: [],
  unreadCount: 0,
  clearNotifications: () => {},
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) {
      // Disconnect when logged out
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setConnected(false)
      }
      return
    }

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null

    if (!token) return

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      window.location.origin

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      setConnected(true)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('notification', (data: RealtimeNotification) => {
      setNotifications((prev) => [data, ...prev].slice(0, 50))
      setUnreadCount((prev) => prev + 1)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])

  const clearNotifications = useCallback(() => {
    setUnreadCount(0)
  }, [])

  return (
    <SocketContext.Provider
      value={{ connected, notifications, unreadCount, clearNotifications }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
