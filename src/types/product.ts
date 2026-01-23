/**
 * Product-related types
 */

export interface Product {
  id: string
  name: string
  groupName?: string
  description?: string
  basePrice: number
  stock: number
  unit: string
  inStock: boolean
  categoryId: string
  image?: string
  images?: string[]
  category?: {
    id: string
    name: string
    description?: string
  }
  variations?: ProductVariation[]
  createdAt?: Date
  updatedAt?: Date
}

export interface ProductVariation {
  id?: string
  name: string
  type?: string
  price: number
  stock: number
  unit?: string
  quantity?: number
  image?: string
  productId?: string
}

export interface ProductFormData {
  groupName?: string
  name: string
  description: string
  basePrice: number
  categoryId: string
  stock: number
  unit: string
  inStock: boolean
  images: string[]
  variations: ProductVariation[]
}

export interface ProductFilters {
  categoryId?: string
  groupName?: string
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  search?: string
}
