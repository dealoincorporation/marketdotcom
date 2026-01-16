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

  // Pre-seeded categories for when API is unavailable or no categories exist
  const defaultCategories: any[] = [
    { id: 'fruits', name: '🍎 Fruits', description: 'Fresh fruits and produce', image: '/categories/fruits.jpg' },
    { id: 'vegetables', name: '🥕 Vegetables', description: 'Fresh vegetables and greens', image: '/categories/vegetables.jpg' },
    { id: 'grains', name: '🌾 Grains & Cereals', description: 'Rice, beans, corn and other grains', image: '/categories/grains.jpg' },
    { id: 'proteins', name: '🥩 Proteins', description: 'Meat, fish, eggs and protein sources', image: '/categories/proteins.jpg' },
    { id: 'dairy', name: '🥛 Dairy', description: 'Milk, cheese, yogurt and dairy products', image: '/categories/dairy.jpg' },
    { id: 'beverages', name: '🥤 Beverages', description: 'Drinks, juices and beverages', image: '/categories/beverages.jpg' },
    { id: 'snacks', name: '🍿 Snacks', description: 'Chips, nuts, and snack foods', image: '/categories/snacks.jpg' },
    { id: 'spices', name: '🌿 Spices & Seasonings', description: 'Herbs, spices and cooking essentials', image: '/categories/spices.jpg' },
    { id: 'bakery', name: '🍞 Bakery', description: 'Bread, pastries and baked goods', image: '/categories/bakery.jpg' },
    { id: 'frozen', name: '🧊 Frozen Foods', description: 'Frozen meals and products', image: '/categories/frozen.jpg' },
    { id: 'canned', name: '🥫 Canned Goods', description: 'Canned foods and preserves', image: '/categories/canned.jpg' },
    { id: 'organic', name: '🌱 Organic Products', description: 'Certified organic foods', image: '/categories/organic.jpg' }
  ]

  const fetchCategories = async () => {
    setCategoriesLoading(true)
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const result = await response.json()
        // Handle both new format { success: true, data: [] } and legacy format []
        const data = result.data || result

        // If API returns empty array, use default categories
        // Otherwise merge with defaults, avoiding duplicates
        if (!data || data.length === 0) {
          setCategories(defaultCategories)
        } else {
          // Create a map to avoid duplicates by name
          const categoryMap = new Map()

          // Add default categories first
          defaultCategories.forEach(cat => categoryMap.set(cat.name.toLowerCase(), cat))

          // Add API categories (will override defaults if same name)
          data.forEach((cat: Category) => categoryMap.set(cat.name.toLowerCase(), cat))

          // Convert back to array
          setCategories(Array.from(categoryMap.values()))
        }
      } else {
        // If API fails, use default categories
        setCategories(defaultCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback to default categories
      setCategories(defaultCategories)
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