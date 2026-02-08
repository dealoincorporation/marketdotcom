/**
 * API-related types
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  error: string
  message?: string
  statusCode?: number
  field?: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ApiValidationResponse {
  success: false
  errors: ValidationError[]
}
