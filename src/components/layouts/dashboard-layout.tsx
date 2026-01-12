'use client'

import { useState, ReactNode } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart-store'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, getInitials } from '@/lib/helpers'
type DashboardTab = "marketplace" | "orders" | "manage-products" | "wallet" | "admin"

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
  const { user } = useAuth()
  const { items, getTotalItems, getTotalPrice } = useCartStore()
  const totalItems = getTotalItems()

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
                  <span className="text-xl font-bold text-gray-900">Marketdotcom</span>
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
          className={`fixed md:relative z-50 md:z-auto w-64 bg-white shadow-xl border-r border-gray-200 h-full ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
            <div className="p-6 border-b border-gray-200">
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

          <nav className="px-4 py-4 space-y-2">
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
                </>
              )}
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
            <div className="max-w-7xl mx-auto">{children}</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}