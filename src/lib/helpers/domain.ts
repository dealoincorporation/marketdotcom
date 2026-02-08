/**
 * Domain-specific helpers: order, product, env, generators, etc.
 */
import { format } from "date-fns"

// --- Generators ---
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// --- Formatting / display ---
export function getInitials(name: string): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function capitalize(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function toTitleCase(text: string): string {
  if (!text) return ""
  return text
    .split(/[-_\s]+/)
    .map((word) => capitalize(word))
    .join(" ")
}

// --- Numbers ---
export function calculateDiscount(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0) return 0
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
}

export function calculateTotal(
  subtotal: number,
  taxRate: number = 0,
  deliveryFee: number = 0,
  discount: number = 0
): number {
  const tax = subtotal * taxRate
  return subtotal + tax + deliveryFee - discount
}

// --- Function ---
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// --- User ---
export function isAdmin(role: string): boolean {
  return role === "ADMIN"
}

// --- Order status ---
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    on_delivery: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  }
  return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
}

export function getOrderStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    on_delivery: "On Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  }
  return statusTexts[status.toLowerCase()] || toTitleCase(status)
}

export function getDeliveryStatusText(status: string): string {
  const statusTexts: Record<string, string> = {
    scheduled: "Scheduled",
    in_transit: "In Transit",
    delivered: "Delivered",
  }
  return statusTexts[status.toLowerCase()] || toTitleCase(status)
}

export function canCancelOrder(orderDate: Date, windowMinutes: number = 30): boolean {
  const now = new Date()
  const orderTime = new Date(orderDate)
  const diffInMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60)
  return diffInMinutes <= windowMinutes
}

export function getEstimatedDeliveryTime(): string {
  const now = new Date()
  const minTime = new Date(now.getTime() + 30 * 60 * 1000)
  const maxTime = new Date(now.getTime() + 2 * 60 * 60 * 1000)
  const formatTime = (date: Date) => format(date, "hh:mm a")
  return `${formatTime(minTime)} - ${formatTime(maxTime)}`
}

// --- Product ---
export function validateProductForm(form: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  if (!form.name?.trim()) {
    errors.name = "Product name is required"
  } else if (form.name.length < 2) {
    errors.name = "Product name must be at least 2 characters"
  }
  if (!form.categoryId) errors.categoryId = "Category is required"
  if (form.basePrice < 0) errors.basePrice = "Price cannot be negative"
  if (form.stock < 0) errors.stock = "Stock cannot be negative"
  if (!form.unit?.trim()) errors.unit = "Unit is required"
  return { isValid: Object.keys(errors).length === 0, errors }
}

// --- Env / runtime ---
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isClient(): boolean {
  return typeof window !== "undefined"
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  // Use localhost in development, production domain in production
  return process.env.NODE_ENV === 'production' 
    ? 'https://marketdotcom.ng' 
    : 'http://localhost:3000'
}

// --- Pagination ---
export function getPaginationInfo(
  currentPage: number,
  totalItems: number,
  pageSize: number
): {
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  startItem: number
  endItem: number
} {
  const totalPages = Math.ceil(totalItems / pageSize)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)
  return { totalPages, hasNextPage, hasPrevPage, startItem, endItem }
}

// --- Object ---
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as unknown as T
  const clonedObj = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }
  return clonedObj
}
