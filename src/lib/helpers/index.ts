/**
 * Helpers barrel: re-exports from utils + domain-specific helpers
 * Use @/lib/helpers for backward compatibility; prefer @/lib/utils for formatting/validation.
 */

export {
  cn,
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  getRelativeTime,
  truncateText,
  formatCurrencyNoDecimals,
  formatRelativeTime,
  formatFileSize,
  toCharmPrice,
} from "../utils"

export { validateEmail, validatePhone, isValidEmail, isValidPhone } from "../utils/validation"

export * from "./domain"
