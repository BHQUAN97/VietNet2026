/**
 * Form validation utilities.
 * Thay the inline validation trong ConsultationForm va cac form khac.
 */

export type ValidationResult = string | null

/** Required field */
export function validateRequired(
  value: string | null | undefined,
  fieldName = 'Trường này',
): ValidationResult {
  if (!value || value.trim() === '') {
    return `${fieldName} không được để trống.`
  }
  return null
}

/** Email validation */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return 'Email không được để trống.'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Email không hợp lệ.'
  }
  return null
}

/** Vietnam phone validation: 0xxx hoac +84xxx, 10 so */
export function validatePhoneVN(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') return null // optional field
  const cleaned = phone.replace(/[\s\-.()+]/g, '')
  // Chap nhan: 0xxxxxxxxx (10 so) hoac 84xxxxxxxxx (11 so) hoac +84xxxxxxxxx
  if (!/^\d{10,11}$/.test(cleaned)) {
    return 'Số điện thoại cần đủ 10 số (VD: 0909 123 456)'
  }
  if (!/^(0|84)/.test(cleaned)) {
    return 'Số điện thoại phải bắt đầu bằng 0 hoặc +84'
  }
  return null
}

/** Min length */
export function validateMinLength(
  value: string,
  min: number,
  fieldName = 'Trường này',
): ValidationResult {
  if (value && value.trim().length < min) {
    return `${fieldName} phải có ít nhất ${min} ký tự.`
  }
  return null
}

/** Max length */
export function validateMaxLength(
  value: string,
  max: number,
  fieldName = 'Trường này',
): ValidationResult {
  if (value && value.trim().length > max) {
    return `${fieldName} không được vượt quá ${max} ký tự.`
  }
  return null
}

/** URL validation */
export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim() === '') return null // optional
  try {
    new URL(url)
    return null
  } catch {
    return 'URL không hợp lệ.'
  }
}

/**
 * Validate nhieu field cung luc.
 * Returns Record<fieldName, errorMessage> — chi chua cac field co loi.
 *
 * Usage:
 * const errors = validateFields({
 *   name: [validateRequired(name, 'Tên')],
 *   email: [validateRequired(email, 'Email'), validateEmail(email)],
 *   phone: [validatePhoneVN(phone)],
 * })
 * if (Object.keys(errors).length > 0) { ... }
 */
export function validateFields(
  rules: Record<string, ValidationResult[]>,
): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const [field, results] of Object.entries(rules)) {
    // Lay loi dau tien cua moi field
    const firstError = results.find((r) => r !== null)
    if (firstError) {
      errors[field] = firstError
    }
  }
  return errors
}
