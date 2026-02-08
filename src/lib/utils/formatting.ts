/**
 * Formatting utilities for display
 */
import { format, formatDistanceToNow, isValid } from "date-fns"

/**
 * Converts round prices to charm pricing (e.g. 7000 → 6999) for psychological effect.
 * Applies to whole numbers >= 10 that end in 0 (round figures).
 */
export function toCharmPrice(amount: number): number {
  const n = typeof amount === "number" && !Number.isNaN(amount) ? amount : 0
  if (n < 10) return n
  const isWhole = Math.floor(n) === n
  const isRound = isWhole && n % 10 === 0
  return isRound ? n - 1 : n
}

/**
 * Formats currency to Nigerian Naira (Intl)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-NG").format(num)
}

/**
 * Get relative time (e.g. "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  if (!isValid(dateObj)) return "Invalid date"
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Formats currency without decimals
 */
export function formatCurrencyNoDecimals(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`
}

/**
 * Formats date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  if (!isValid(d)) return "Invalid date"
  return format(d, "MMM dd, yyyy")
}

/**
 * Formats date and time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formats relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(d)
}

/**
 * Truncates text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + "..."
}

/**
 * Formats file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
