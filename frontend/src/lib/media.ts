import axios from 'axios'
import type { Media } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * Validate file ảnh trước khi upload.
 * Trả về message lỗi hoặc null nếu hợp lệ.
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Chỉ chấp nhận file hình ảnh.'
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Định dạng không hỗ trợ. Chấp nhận: JPEG, PNG, WebP, GIF.'
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return `File quá lớn (tối đa ${MAX_IMAGE_SIZE / (1024 * 1024)}MB).`
  }
  return null
}

/**
 * Chuyển URL relative (/uploads/...) thành absolute URL trỏ về backend
 * Cần thiết vì frontend và backend chạy khác origin
 */
export function toAbsoluteUrl(url: string | null | undefined): string {
  if (!url) return ''
  // Đã absolute hoặc base64 → giữ nguyên
  if (url.startsWith('http') || url.startsWith('data:')) return url

  // Handle relative API_URL in browser
  let origin = API_URL
  if (typeof window !== 'undefined' && !origin.startsWith('http')) {
    origin = window.location.origin + (origin.startsWith('/') ? origin : '/' + origin)
  }
  origin = origin.replace(/\/api\/?$/, '')

  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * Upload file lên server, trả về Media object với URL đã normalize
 * Dùng axios riêng vì cần Content-Type: multipart/form-data
 */
export async function uploadMedia(file: File): Promise<Media> {
  const formData = new FormData()
  formData.append('file', file)

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const res = await axios.post(`${API_URL}/media/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: true,
  })

  const media: Media = res.data?.data || res.data
  // Normalize relative URLs → absolute
  media.original_url = toAbsoluteUrl(media.original_url) || media.original_url
  media.thumbnail_url = toAbsoluteUrl(media.thumbnail_url) || media.thumbnail_url || ''
  media.preview_url = toAbsoluteUrl(media.preview_url) || media.preview_url || ''
  return media
}

/** Chuyển File thành base64 data URL (dùng cho preview trước khi upload) */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Upload ảnh, trả về URL. Lỗi sẽ propagate lên caller để xử lý UI. */
export async function uploadImageGetUrl(file: File): Promise<string> {
  const media = await uploadMedia(file)
  return media.preview_url || media.original_url
}
