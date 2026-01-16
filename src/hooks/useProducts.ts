'use client'

import { useState } from 'react'
import { Product } from '@prisma/client'

interface ProductForm {
  name: string
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
        throw new Error(errorData.message || 'Failed to create product')
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
      }

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete product')
      }

      setProducts(prev => prev.filter(product => product.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
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