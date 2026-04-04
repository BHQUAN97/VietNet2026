'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/auth.context'
import { Button } from '@/components/ui/Button'
import { PageContainer } from '@/components/layout/PageContainer'
import { AxiosError } from 'axios'
import { validateEmail, validateMinLength } from '@/lib/form-validation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
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
    setFieldErrors({})

    // Validate tung field
    const errors: { email?: string; password?: string } = {}
    const emailErr = validateEmail(email)
    if (emailErr) errors.email = emailErr
    const pwErr = validateMinLength(password, 6, 'Mật khẩu')
    if (!password.trim()) {
      errors.password = 'Mật khẩu không được để trống.'
    } else if (pwErr) {
      errors.password = pwErr
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
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
          setError('Quá nhiều lần thử. Vui lòng đợi 30 phút.')
        } else if (status === 401) {
          setError('Email hoặc mật khẩu không chính xác')
        } else {
          setError(message || 'Đăng nhập thất bại. Vui lòng thử lại.')
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại.')
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
          Đăng nhập
        </h1>
        <p className="mt-2 text-center text-body-sm text-on-surface-variant">
          Đăng nhập vào hệ thống quản trị VietNet Interior
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
                onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined })) }}
                className={`w-full rounded-xl bg-surface-container focus:ring-2 focus:ring-primary/30 py-3 pl-11 pr-4 text-body-md text-on-surface outline-none transition-colors ${fieldErrors.email ? 'ring-2 ring-error/30' : ''}`}
                placeholder="admin@vietnetinterior.vn"
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {fieldErrors.email && <p className="mt-1 text-body-sm text-error">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block font-label text-label-lg uppercase tracking-label-wide text-on-surface-variant">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined })) }}
                className={`w-full rounded-xl bg-surface-container focus:ring-2 focus:ring-primary/30 py-3 pl-11 pr-12 text-body-md text-on-surface outline-none transition-colors ${fieldErrors.password ? 'ring-2 ring-error/30' : ''}`}
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
            {fieldErrors.password && <p className="mt-1 text-body-sm text-error">{fieldErrors.password}</p>}
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Đăng nhập
          </Button>
        </form>
      </div>
    </PageContainer>
  )
}
