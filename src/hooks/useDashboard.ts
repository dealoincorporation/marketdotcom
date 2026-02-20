'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Product, Category, Order, User } from '@prisma/client'

interface WalletInfo {
  walletBalance: number
  points: number
  referralCode: string
  referralCount: number
}

interface UseDashboardReturn {
  // Data
  products: Product[]
  categories: Category[]
  orders: Order[]
  walletInfo: WalletInfo

  // Loading states
  loading: boolean
  productsLoading: boolean
  categoriesLoading: boolean
  ordersLoading: boolean
  walletLoading: boolean

  // Actions
  refreshProducts: () => Promise<void>
  refreshCategories: () => Promise<void>
  refreshOrders: () => Promise<void>
  refreshWallet: () => Promise<void>
  refreshAll: () => Promise<void>
}

const defaultWalletInfo: WalletInfo = {
  walletBalance: 0,
  points: 0,
  referralCode: '',
  referralCount: 0,
}

export function useDashboard(): UseDashboardReturn {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [walletInfo, setWalletInfo] = useState<WalletInfo>(defaultWalletInfo)

  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [walletLoading, setWalletLoading] = useState(false)

  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchCategories = async () => {
    setCategoriesLoading(true)
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        setCategories(Array.isArray(data) ? data : [])
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/orders', { headers })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const fetchWallet = async () => {
    setWalletLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/wallet', { headers })
      if (response.ok) {
        const data = await response.json()
        setWalletInfo(data)
      }
    } catch (error) {
      console.error('Error fetching wallet info:', error)
    } finally {
      setWalletLoading(false)
    }
  }

  const refreshAll = async () => {
    setLoading(true)
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchOrders(),
      fetchWallet(),
    ])
    setLoading(false)
  }

  // Initial data fetch
  useEffect(() => {
    if (user) {
      refreshAll()
    }
  }, [user])

  return {
    // Data
    products,
    categories,
    orders,
    walletInfo,

    // Loading states
    loading,
    productsLoading,
    categoriesLoading,
    ordersLoading,
    walletLoading,

    // Actions
    refreshProducts: fetchProducts,
    refreshCategories: fetchCategories,
    refreshOrders: fetchOrders,
    refreshWallet: fetchWallet,
    refreshAll,
  }
}