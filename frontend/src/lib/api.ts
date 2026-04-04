import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Track refresh state to prevent race conditions
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: AxiosError | null, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor: attach access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Chuyen relative media URLs (/uploads/...) thanh absolute URLs.
 * Can thiet vi backend tra relative path khi dung local storage.
 */
function normalizeMediaUrls(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(normalizeMediaUrls)

  const mediaFields = ['original_url', 'preview_url', 'thumbnail_url']
  const result = { ...obj }
  for (const field of mediaFields) {
    if (typeof result[field] === 'string' && result[field].startsWith('/uploads/')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      result[field] = origin + result[field]
    }
  }
  // Duyet cac nested objects (cover_image, og_image, media, etc.)
  for (const key of Object.keys(result)) {
    if (result[key] && typeof result[key] === 'object') {
      result[key] = normalizeMediaUrls(result[key])
    }
  }
  return result
}

// Response interceptor: handle 401 + token refresh
api.interceptors.response.use(
  (response) => {
    // Unwrap API response envelope + normalize media URLs
    const data = response.data
    if (data?.data) data.data = normalizeMediaUrls(data.data)
    return data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // If 401 and not already retrying, attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        const newToken = data.data?.accessToken
        if (newToken && typeof window !== 'undefined') {
          localStorage.setItem('access_token', newToken)
        }

        processQueue(null, newToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError)

        // Clear auth state on refresh failure
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
