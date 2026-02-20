/**
 * Validation utilities for forms and data
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates phone number (basic validation)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10
}

/** Nigerian phone format - alias for backward compatibility */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+234|234|0)[789]\d{9}$/
  return phoneRegex.test(phone)
}

/** Alias for validateEmail */
export function isValidEmail(email: string): boolean {
  return validateEmail(email)
}

/**
 * Validates required field
 */
export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`
  }
  return null
}

/**
 * Validates number range
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`
  }
  return null
}

/**
 * Validates file size
 */
export function validateFileSize(file: File, maxSizeMB: number): string | null {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB`
  }
  return null
}

/**
 * Validates file type
 */
export function validateFileType(file: File, allowedTypes: string[]): string | null {
  const fileType = file.type
  const isValid = allowedTypes.some(type => fileType.startsWith(type))
  if (!isValid) {
    return `File type must be one of: ${allowedTypes.join(', ')}`
  }
  return null
}
