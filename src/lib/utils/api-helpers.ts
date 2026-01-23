/**
 * API helper utilities
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

/**
 * Creates a success API response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  }
}

/**
 * Creates an error API response
 */
export function createErrorResponse(error: string, message?: string): ApiResponse {
  return {
    success: false,
    error,
    message,
  }
}

/**
 * Handles API errors consistently
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      error: error.message,
      message: error.message,
    }
  }
  
  return {
    error: 'An unknown error occurred',
    message: 'Please try again later',
  }
}

/**
 * Validates request body
 */
export function validateRequestBody(body: any, requiredFields: string[]): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    if (!body || body[field] === undefined || body[field] === null || body[field] === '') {
      missingFields.push(field)
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  }
}
