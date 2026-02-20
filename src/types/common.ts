/**
 * Common shared types
 */

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface TabItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

export interface FilterOption {
  id: string
  label: string
  value: string | number | boolean
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
  label: string
}
