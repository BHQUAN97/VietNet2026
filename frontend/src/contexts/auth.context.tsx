'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { User, ApiResponse, LoginResponse } from '@/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin'

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token')
          : null

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = (await api.get('/auth/me')) as ApiResponse<User>
        if (response.success && response.data) {
          setUser(response.data)
        } else {
          localStorage.removeItem('access_token')
          document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax; Secure'
          setUser(null)
        }
      } catch {
        localStorage.removeItem('access_token')
        document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax; Secure'
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = (await api.post('/auth/login', {
        email,
        password,
      })) as ApiResponse<LoginResponse>

      if (response.success && response.data) {
        localStorage.setItem('access_token', response.data.accessToken)
        // Set cookie hint for server-side middleware redirect
        document.cookie = 'auth_session=1; path=/; max-age=604800; SameSite=Lax; Secure'
        setUser(response.data.user)
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại')
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore logout API errors — clear local state regardless
    } finally {
      localStorage.removeItem('access_token')
      // Remove cookie hint for server-side middleware redirect
      document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax; Secure'
      setUser(null)
      router.push('/admin/login')
    }
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
