'use client'

import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import type { User, ApiResponse } from '@/types'

interface UserFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null // null = create, User = edit
  onSuccess: () => void
}

interface FormData {
  full_name: string
  email: string
  password: string
  phone: string
  role: User['role']
}

interface FormErrors {
  full_name?: string
  email?: string
  password?: string
}

const ROLES: { value: User['role']; label: string }[] = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
]

const inputBaseClasses =
  'w-full rounded-xl bg-surface-container px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 outline-none transition-all duration-300 focus:bg-surface-container-high focus:ring-2 focus:ring-primary/20 min-h-[44px]'

const labelClasses =
  'block font-label text-label-lg tracking-label-wide text-on-surface-variant mb-2'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function UserFormModal({ open, onOpenChange, user, onSuccess }: UserFormModalProps) {
  const isEdit = !!user
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'viewer',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        password: '',
        phone: user.phone || '',
        role: user.role,
      })
    } else {
      setFormData({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'viewer',
      })
    }
    setErrors({})
    setApiError(null)
  }, [user, open])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (apiError) setApiError(null)
  }

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Vui lòng nhập họ tên'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'Vui lòng nhập mật khẩu'
    } else if (!isEdit && formData.password.length < 8) {
      newErrors.password = 'Mật khẩu tối thiểu 8 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setApiError(null)

    try {
      if (isEdit && user) {
        const { password, ...updateData } = formData
        const payload = password ? { ...updateData, password } : updateData
        await api.patch<ApiResponse<User>>(`/users/${user.id}`, payload)
      } else {
        await api.post<ApiResponse<User>>('/users', formData)
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.'
      setApiError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-on-surface/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[var(--z-modal)] w-[calc(100%-2rem)] max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-ambient-lg md:p-8 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="font-headline text-headline-sm text-on-surface">
              {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-high"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {apiError && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-error-container px-4 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-on-error-container" />
              <p className="text-body-sm text-on-error-container">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="modal-full_name" className={labelClasses}>
                Họ tên <span className="text-error">*</span>
              </label>
              <input
                id="modal-full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className={cn(inputBaseClasses, errors.full_name && 'ring-2 ring-error/30')}
              />
              {errors.full_name && (
                <p className="mt-1.5 text-body-sm text-error">{errors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="modal-email" className={labelClasses}>
                Email <span className="text-error">*</span>
              </label>
              <input
                id="modal-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className={cn(inputBaseClasses, errors.email && 'ring-2 ring-error/30')}
              />
              {errors.email && (
                <p className="mt-1.5 text-body-sm text-error">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="modal-password" className={labelClasses}>
                Mật khẩu {!isEdit && <span className="text-error">*</span>}
                {isEdit && (
                  <span className="ml-1 text-body-sm text-on-surface-variant font-normal normal-case tracking-normal">
                    (để trống nếu không thay đổi)
                  </span>
                )}
              </label>
              <input
                id="modal-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEdit ? 'Để trống nếu không thay đổi' : 'Tối thiểu 8 ký tự'}
                className={cn(inputBaseClasses, errors.password && 'ring-2 ring-error/30')}
              />
              {errors.password && (
                <p className="mt-1.5 text-body-sm text-error">{errors.password}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="modal-phone" className={labelClasses}>
                Điện thoại
              </label>
              <input
                id="modal-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0909 xxx xxx"
                className={inputBaseClasses}
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="modal-role" className={labelClasses}>
                Vai trò
              </label>
              <select
                id="modal-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={cn(inputBaseClasses, 'appearance-none cursor-pointer')}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="ghost" type="button">
                  Hủy
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                {isEdit ? 'Cập nhật' : 'Tạo người dùng'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
