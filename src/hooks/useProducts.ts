'use client'

import { useState } from 'react'
import { Product } from '@prisma/client'

interface ProductForm {
  name: string
  groupName?: string
  description: string
  basePrice: number
  categoryId: string
  stock: number
  unit: string
  inStock: boolean
  images: string[]
  variations: Array<{
    id?: string
    name: string
    price: number
    stock: number
    unit?: string
    quantity?: number
    image?: string
  }>
}

interface UseProductsReturn {
  // State
  products: Product[]
  loading: boolean
  error: string | null

  // Actions
  createProduct: (formData: ProductForm) => Promise<Product | null>
  updateProduct: (id: string, formData: ProductForm) => Promise<Product | null>
  deleteProduct: (id: string) => Promise<boolean>
  refreshProducts: () => Promise<void>
}

export function useProducts(initialProducts: Product[] = []): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProduct = async (formData: ProductForm): Promise<Product | null> => {
    setLoading(true)
    setError(null)

    try {
      // Get auth token from localStorage (same logic as image upload)
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Product creation error:', errorData)

        // Handle expired token
        if (response.status === 401 && errorData.message?.includes('Unauthorized')) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          alert('Your session has expired. Please log in again.')
          window.location.href = '/auth/login'
          return null
        }

        // Show validation errors if available
        if (errorData.details || errorData.issues || errorData.fieldErrors) {
          const errors = errorData.fieldErrors || errorData.issues || []
          const validationErrors = errors.map((issue: any) => {
            const path = issue.path?.join('.') || issue.path || 'unknown'
            return `${path}: ${issue.message}`
          }).join('\n') || JSON.stringify(errorData.details)
          
          const errorMessage = `Validation failed:\n${validationErrors}`
          console.error('Validation errors:', errorMessage)
          throw new Error(errorMessage)
        }

        const errorMessage = errorData.error || errorData.message || 'Failed to create product'
        console.error('Product creation error:', errorMessage, errorData)
        throw new Error(errorMessage)
      }

      const newProduct = await response.json()
      setProducts(prev => [...prev, newProduct])
      return newProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = async (id: string, formData: ProductForm): Promise<Product | null> => {
    setLoading(true)
    setError(null)

    try {
      // Get auth token from localStorage (same logic as image upload)
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()

        // Handle expired token
        if (response.status === 401 && errorData.message?.includes('Unauthorized')) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          alert('Your session has expired. Please log in again.')
          window.location.href = '/auth/login'
          return null
        }

        throw new Error(errorData.message || 'Failed to update product')
      }

      const updatedProduct = await response.json()
      setProducts(prev =>
        prev.map(product => product.id === id ? updatedProduct : product)
      )
      return updatedProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Get auth token from localStorage (same logic as image upload)
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      } else {
        throw new Error('No authentication token found. Please log in again.')
      }

      console.log('Deleting product:', id)
      console.log('Auth token present:', !!token)

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers,
      })

      console.log('Delete response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Delete error response:', errorData)

        // Handle expired token specifically
        if (response.status === 401 && errorData.error?.includes('Unauthorized')) {
          // Clear expired token and user data
          localStorage.removeItem('token')
          localStorage.removeItem('user')

          // Show user-friendly message and redirect to login
          alert('Your session has expired. Please log in again.')
          window.location.href = '/auth/login'
          return false
        }

        throw new Error(errorData.error || errorData.message || 'Failed to delete product')
      }

      const result = await response.json()
      console.log('Delete success:', result)

      setProducts(prev => prev.filter(product => product.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.error('Delete product error:', errorMessage)
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  const refreshProducts = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh products'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  }
}