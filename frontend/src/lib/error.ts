/**
 * Error extraction & formatting utilities.
 * Thay the inline error handling scattered across 8+ pages.
 */

import type { AxiosError } from 'axios'

interface ApiErrorResponse {
  success: false
  message: string
  statusCode: number
}

/** Extract user-friendly error message tu bat ky error type nao */
export function getErrorMessage(error: unknown): string {
  // AxiosError voi response tu API
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined
    if (data?.message) return data.message

    // HTTP status fallback
    const status = error.response?.status
    if (status) return getHttpErrorMessage(status)

    // Network error
    if (error.code === 'ERR_NETWORK') {
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
    }
    if (error.code === 'ECONNABORTED') {
      return 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.'
    }
  }

  // Standard Error
  if (error instanceof Error) {
    return error.message
  }

  // String error
  if (typeof error === 'string') {
    return error
  }

  return 'Có lỗi xảy ra. Vui lòng thử lại sau.'
}

/** Map HTTP status code -> user-friendly message VN */
export function getHttpErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: 'Dữ liệu không hợp lệ.',
    401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
    403: 'Bạn không có quyền thực hiện hành động này.',
    404: 'Không tìm thấy dữ liệu.',
    409: 'Dữ liệu bị trùng lặp.',
    413: 'File quá lớn.',
    429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    500: 'Lỗi hệ thống. Vui lòng thử lại sau.',
    502: 'Server đang bảo trì. Vui lòng thử lại sau.',
    503: 'Dịch vụ tạm thời không khả dụng.',
  }
  return messages[status] || `Lỗi ${status}. Vui lòng thử lại.`
}

/** Type guard cho AxiosError */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}
