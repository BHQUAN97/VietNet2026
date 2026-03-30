'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/auth.context'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { AxiosError } from 'axios'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/admin')
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Vui long nhap email va mat khau')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      router.push('/admin')
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status
        const message = err.response?.data?.message

        if (status === 429) {
          setError('Qua nhieu lan thu. Vui long doi 30 phut.')
        } else if (status === 401) {
          setError('Email hoac mat khau khong chinh xac')
        } else {
          setError(message || 'Dang nhap that bai. Vui long thu lai.')
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Dang nhap that bai. Vui long thu lai.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Don't render form if auth is still loading or user is already logged in
  if (authLoading || user) {
    return null
  }

  return (
    <PageContainer className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-low p-8 shadow-ambient">
        <h1 className="text-center font-headline text-headline-md text-primary">
          Dang nhap
        </h1>
        <p className="mt-2 text-center text-body-sm text-on-surface-variant">
          Dang nhap vao he thong quan tri VietNet Interior
        </p>

        {error && (
          <div className="mt-6 rounded-xl bg-error-container px-4 py-3 text-body-sm text-on-error-container">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block font-label text-label-lg uppercase tracking-label-wide text-on-surface-variant">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-surface-container ring-1 ring-outline-variant/10 focus:ring-primary/30 py-3 pl-11 pr-4 text-body-md text-on-surface outline-none transition-colors focus:ring-primary"
                placeholder="admin@vietnetinterior.vn"
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-label text-label-lg uppercase tracking-label-wide text-on-surface-variant">
              Mat khau
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-surface-container ring-1 ring-outline-variant/10 focus:ring-primary/30 py-3 pl-11 pr-12 text-body-md text-on-surface outline-none transition-colors focus:ring-primary"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Dang nhap
          </Button>
        </form>
      </div>
    </PageContainer>
  )
}
