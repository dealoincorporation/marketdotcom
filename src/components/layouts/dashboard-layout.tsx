'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Package,
  Truck,
  Wallet,
  Settings,
  ArrowLeft,
  ShoppingCart,
  Menu,
  X,
  Box,
  LogOut,
  Plus,
  Minus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart-store'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, getInitials } from '@/lib/helpers'
type DashboardTab = "marketplace" | "orders" | "manage-products" | "manage-categories" | "wallet" | "admin"

interface DashboardLayoutProps {
  children: ReactNode
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

const navigationItems = [
  {
    id: 'marketplace' as DashboardTab,
    label: 'Marketplace',
    icon: Package,
  },
  {
    id: 'orders' as DashboardTab,
    label: 'Orders',
    icon: Truck,
  },
  {
    id: 'wallet' as DashboardTab,
    label: 'Wallet & Points',
    icon: Wallet,
  },
]

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const { items, getTotalItems, getTotalPrice, addItem, removeItem, updateQuantity, clearCart } = useCartStore()
  const router = useRouter()
  const totalItems = getTotalItems()
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Debug cart state changes
  useEffect(() => {
    console.log('Cart open state changed:', isCartOpen)
  }, [isCartOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              <Link href="/" className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-3"
                >
                  <img
                    src="/mrktdotcom-logo.png"
                    alt="Marketdotcom Logo"
                    className="h-24 w-24 object-contain"
                  />
                  <span className="hidden md:block text-xl font-bold text-gray-900">Marketdotcom</span>
                </motion.div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden lg:block text-sm text-gray-600">
                Welcome back,{' '}
                <span className="font-medium text-gray-900">
                  {user?.name || user?.email}
                </span>
              </div>

              {/* Mobile Cart Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative bg-white hover:bg-orange-50 border-2 border-gray-300 hover:border-orange-300 rounded-md pt-4 pr-4 pb-3 pl-3 cursor-pointer active:scale-95 transition-all duration-150 active:bg-orange-100 min-w-[52px] min-h-[52px] flex items-center justify-center touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>

              {/* Desktop Cart Button */}
              <div className="hidden lg:block">
                <Link href="/cart">
                  <Button variant="outline" size="sm" className="relative hover:bg-orange-50 hover:border-orange-300">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Cart</span>
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Mobile Sidebar Overlay - Removed for transparency */}
        {/* {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-5 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )} */}

        {/* Sidebar */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          className={`fixed md:relative z-50 md:z-auto w-64 bg-white shadow-xl border-r border-gray-200 h-full flex flex-col ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Dashboard</h2>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-lg">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-6">
            <Link
              href="/"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>

            <div className="border-t border-gray-200 pt-4 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-r-4 border-orange-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}

              {/* Admin Panel - conditionally rendered */}
              {user?.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => {
                      onTabChange('admin')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'admin'
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-r-4 border-orange-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </button>

                  <button
                    onClick={() => {
                      onTabChange('manage-products')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'manage-products'
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-r-4 border-orange-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Box className="h-5 w-5" />
                    <span>Manage Products</span>
                  </button>

                  <button
                    onClick={() => {
                      onTabChange('manage-categories')
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === 'manage-categories'
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-r-4 border-orange-600 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Package className="h-5 w-5" />
                    <span>Manage Categories</span>
                  </button>
                </>
              )}
            </div>

            {/* Sign Out Section */}
            <div className="border-t border-gray-200 pt-4 px-4">
              <button
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto md:ml-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 lg:p-8"
          >
            <div className="max-w-7xl mx-auto">
              {/* Welcome Banner */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="px-6 py-8 sm:px-8 sm:py-10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                          Welcome back, {user.name || 'Valued Customer'}! 🎉
                        </h1>
                        <p className="text-orange-100 text-sm sm:text-base leading-relaxed">
                          Great to see you here! Explore our marketplace, manage your products, or check your orders.
                          We're here to make your shopping experience amazing.
                        </p>
                      </div>
                      <div className="hidden sm:block ml-6">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                          <span className="text-2xl">👋</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full translate-y-3 -translate-x-3"></div>
                </motion.div>
              )}

              {children}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      {isCartOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setIsCartOpen(false)}
          >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <h2 className="text-lg font-bold flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Your Cart ({totalItems})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(false)}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">Add some products to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-orange-600">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Subtotal</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCartOpen(false)
                        router.push('/cart')
                      }}
                      className="w-full"
                    >
                      View Full Cart
                    </Button>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clearCart()
                          setIsCartOpen(false)
                        }}
                        className="flex-1"
                      >
                        Clear Cart
                      </Button>
                      <Button
                        onClick={() => {
                          setIsCartOpen(false)
                          router.push('/checkout')
                        }}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        Checkout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}