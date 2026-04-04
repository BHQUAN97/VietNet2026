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
import api from '@/lib/api'
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

  // Load notification history + unread count tu DB khi dang nhap
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    async function loadHistory() {
      try {
        const res = await api.get('/notifications?limit=50')
        const result = (res as any).data
        if (result?.data) {
          setNotifications(result.data)
        }
        if (typeof result?.unreadCount === 'number') {
          setUnreadCount(result.unreadCount)
        }
      } catch {
        // Non-critical — khong block UI
      }
    }

    loadHistory()
  }, [user])

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

  // Danh dau tat ca da doc — goi API backend + cap nhat UI
  const clearNotifications = useCallback(async () => {
    setUnreadCount(0)
    try {
      await api.patch('/notifications/read-all')
    } catch {
      // Non-critical
    }
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
