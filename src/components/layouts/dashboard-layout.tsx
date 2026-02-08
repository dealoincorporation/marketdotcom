'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
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
  Trash2,
  Users,
  Coins,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  LayoutDashboard,
  Bell,
  Sparkles,
} from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { ProfileSettingsModal } from '@/components/profile/ProfileSettingsModal'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart-store'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, getInitials } from "@/lib/helpers/index"
type DashboardTab = "marketplace" | "orders" | "manage-products" | "manage-categories" | "manage-deliveries" | "manage-delivery-fees" | "manage-referrals" | "manage-points" | "wallet" | "admin" | "notifications" | "admin-notifications"

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
  const { items, getTotalItems, getTotalPrice, updateQuantity, removeItem, clearCart } = useCartStore()
  const router = useRouter()
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [deliverySettings, setDeliverySettings] = useState<{
    minimumOrderQuantity: number
    minimumOrderAmount: number
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/delivery-settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setDeliverySettings({
            minimumOrderQuantity: data.minimumOrderQuantity ?? 1,
            minimumOrderAmount: data.minimumOrderAmount ?? 0,
          })
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const minimumOrderQuantity = deliverySettings?.minimumOrderQuantity ?? 1
  const minimumOrderAmount = deliverySettings?.minimumOrderAmount ?? 0
  const moqQuantityNotMet = totalItems < minimumOrderQuantity
  const moqAmountNotMet = minimumOrderAmount > 0 && totalPrice < minimumOrderAmount
  const moqNotMet = moqQuantityNotMet || moqAmountNotMet
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [welcomeSeenThisSession, setWelcomeSeenThisSession] = useState(true)

  useEffect(() => {
    try {
      const seen = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('dashboard-welcome-seen') === 'true'
      setWelcomeSeenThisSession(seen)
    } catch {
      setWelcomeSeenThisSession(true)
    }
  }, [])

  useEffect(() => {
    if (welcomeSeenThisSession || !user) return
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem('dashboard-welcome-seen', 'true')
        setWelcomeSeenThisSession(true)
      } catch {}
    }, 4000)
    return () => clearTimeout(t)
  }, [welcomeSeenThisSession, user])

  useEffect(() => {
    try {
      setIsSidebarCollapsed(localStorage.getItem('dashboard-sidebar-collapsed') === 'true')
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('dashboard-sidebar-collapsed', String(isSidebarCollapsed))
    } catch {}
  }, [isSidebarCollapsed])
  const mobileAccountRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileAccountRef.current && !mobileAccountRef.current.contains(e.target as Node)) {
        setMobileAccountOpen(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    if (mobileAccountOpen || profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [mobileAccountOpen, profileDropdownOpen])

  const SidebarInner = (props: { showClose: boolean; collapsed?: boolean }) => {
    const { showClose, collapsed = false } = props
    return (
      <>
        <div className={`flex-shrink-0 border-b border-gray-200 bg-gradient-to-br from-white to-gray-50 transition-all duration-200 ${
          collapsed ? 'p-3 md:p-3' : 'p-4 md:p-6'
        }`}>
          {(showClose || !collapsed) && (
            <div className={`flex items-center ${collapsed ? 'justify-center mb-0' : 'justify-between mb-4 md:mb-6'}`}>
              {!collapsed && <h2 className="text-lg md:text-xl font-bold text-gray-900">Dashboard</h2>}
              {showClose && (
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="md:hidden p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Close menu"
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-white font-semibold text-sm md:text-lg">
                {getInitials(user?.name || user?.email || 'U')}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all duration-200 ${
          collapsed ? 'px-2' : 'px-3 md:px-4'
        }`}>
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`hidden md:flex w-full items-center rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 ${
              collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
            }`}
            title={collapsed ? 'Back to Home' : undefined}
          >
            <ArrowLeft className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Back to Home</span>}
          </Link>

          <div className={`border-t border-gray-200 space-y-1 ${collapsed ? 'pt-3 mt-3' : 'pt-3 mt-3'}`}>
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${
                    collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                  } ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-l-4 border-orange-600 shadow-sm font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  } ${collapsed ? 'border-l-4 border-transparent' : ''} ${collapsed && activeTab === item.id ? '!border-orange-600' : ''}`}
                  type="button"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm md:text-base">{item.label}</span>}
                </button>
              )
            })}

            {user?.role === 'ADMIN' && (
              <>
                <div className={`pt-3 mt-3 border-t border-gray-200 ${collapsed ? '' : ''}`}>
                  {!collapsed && (
                    <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    onTabChange('manage-products')
                    setIsMobileMenuOpen(false)
                  }}
                  title={collapsed ? 'Manage Products' : undefined}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${
                    collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                  } ${
                    activeTab === 'manage-products'
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-l-4 border-orange-600 shadow-sm font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  } ${collapsed ? 'border-l-4 border-transparent' : ''} ${collapsed && activeTab === 'manage-products' ? '!border-orange-600' : ''}`}
                  type="button"
                >
                  <Box className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm md:text-base">Manage Products</span>}
                </button>
                <button
                  onClick={() => {
                    onTabChange('manage-categories')
                    setIsMobileMenuOpen(false)
                  }}
                  title={collapsed ? 'Manage Categories' : undefined}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${
                    collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                  } ${
                    activeTab === 'manage-categories'
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-l-4 border-orange-600 shadow-sm font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  } ${collapsed ? 'border-l-4 border-transparent' : ''} ${collapsed && activeTab === 'manage-categories' ? '!border-orange-600' : ''}`}
                  type="button"
                >
                  <Package className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm md:text-base">Manage Categories</span>}
                </button>
                <button
                  onClick={() => {
                    onTabChange('manage-deliveries')
                    setIsMobileMenuOpen(false)
                  }}
                  title={collapsed ? 'Manage Deliveries' : undefined}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${
                    collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                  } ${
                    activeTab === 'manage-deliveries'
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-l-4 border-orange-600 shadow-sm font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  } ${collapsed ? 'border-l-4 border-transparent' : ''} ${collapsed && activeTab === 'manage-deliveries' ? '!border-orange-600' : ''}`}
                  type="button"
                >
                  <Truck className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm md:text-base">Manage Deliveries</span>}
                </button>
                <button
                  onClick={() => {
                    onTabChange('manage-delivery-fees')
                    setIsMobileMenuOpen(false)
                  }}
                  title={collapsed ? 'Delivery Fees' : undefined}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${
                    collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                  } ${
                    activeTab === 'manage-delivery-fees'
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-l-4 border-orange-600 shadow-sm font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  } ${collapsed ? 'border-l-4 border-transparent' : ''} ${collapsed && activeTab === 'manage-delivery-fees' ? '!border-orange-600' : ''}`}
                  type="button"
                >
                  <Coins className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm md:text-base">Delivery Fees</span>}
                </button>
                <button
                  onClick={() => {
                    onTabChange('manage-points')
                    setIsMobileMenuOpen(false)
                  }}
                  title={collapsed ? 'Points & Conversion' : undefined}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${
                    collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                  } ${
                    activeTab === 'manage-points'
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-l-4 border-orange-600 shadow-sm font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  } ${collapsed ? 'border-l-4 border-transparent' : ''} ${collapsed && activeTab === 'manage-points' ? '!border-orange-600' : ''}`}
                  type="button"
                >
                  <Sparkles className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm md:text-base">Points & Conversion</span>}
                </button>
                <button
                  onClick={() => {
                    onTabChange('admin-notifications')
                    setIsMobileMenuOpen(false)
                  }}
                  title={collapsed ? 'All Notifications' : undefined}
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${
                    collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                  } ${
                    activeTab === 'admin-notifications'
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-l-4 border-orange-600 shadow-sm font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                  } ${collapsed ? 'border-l-4 border-transparent' : ''} ${collapsed && activeTab === 'admin-notifications' ? '!border-orange-600' : ''}`}
                  type="button"
                >
                  <Bell className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm md:text-base">All Notifications</span>}
                </button>
              </>
            )}
          </div>

          {/* Desktop Sign Out Button - Hidden on mobile (sign out is in header dropdown) */}
          <div className={`hidden md:flex flex-shrink-0 border-t border-gray-200 pt-3 mt-auto pb-4 ${collapsed ? 'px-2' : 'px-3 md:px-4'}`}>
            <button
              onClick={() => {
                logout()
                router.push('/')
                setIsMobileMenuOpen(false)
              }}
              title={collapsed ? 'Sign Out' : undefined}
              className={`w-full flex items-center rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100 cursor-pointer touch-manipulation ${
                collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
              }`}
              type="button"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm md:text-base font-medium">Sign Out</span>}
            </button>
          </div>
        </nav>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header - Fixed at top */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-[100] flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>

              <Link href="/" className="flex items-center">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <img
                    src="/mrktdotcom-logo.png"
                    alt="Marketdotcom Logo"
                    className="h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52 lg:h-56 lg:w-56 object-contain"
                  />
                </motion.div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <NotificationBell />

              {/* Desktop Profile Dropdown */}
              <div className="hidden lg:block relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user?.name || user?.email || 'U')}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-[110] py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        setProfileModalOpen(true)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Profile Settings</span>
                    </button>
                    {user?.role === 'ADMIN' && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            onTabChange('admin')
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Admin Panel</span>
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            onTabChange('manage-referrals')
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Manage Referrals</span>
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            onTabChange('manage-points')
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Sparkles className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Points & Conversion</span>
                        </button>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        logout()
                        router.push('/')
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Account Dropdown (avoids accidental sign-out) */}
              <div className="lg:hidden relative" ref={mobileAccountRef}>
                <button
                  onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
                  className="bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 rounded-md p-3 cursor-pointer active:scale-95 transition-all duration-150 min-w-[48px] min-h-[48px] flex items-center justify-center touch-manipulation pointer-events-auto"
                  type="button"
                  aria-expanded={mobileAccountOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  <User className="h-5 w-5 text-gray-700" />
                  <ChevronDown className={`h-4 w-4 ml-0.5 text-gray-500 transition-transform ${mobileAccountOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccountOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-[110]">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileAccountOpen(false)
                        setProfileModalOpen(true)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Profile Settings</span>
                    </button>
                    {user?.role === 'ADMIN' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileAccountOpen(false)
                            onTabChange('admin')
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Admin Panel</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileAccountOpen(false)
                            onTabChange('manage-referrals')
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
                        >
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Manage Referrals</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileAccountOpen(false)
                            onTabChange('manage-points')
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
                        >
                          <Sparkles className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Points & Conversion</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileAccountOpen(false)
                            onTabChange('manage-delivery-fees')
                          }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50"
                        >
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Delivery Fees</span>
                        </button>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setMobileAccountOpen(false)
                        logout()
                        router.push('/')
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Cart Button - md+ so no gap between bottom nav (md:hidden) and header cart */}
              <div className="hidden md:block">
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

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-0 z-[60] md:hidden ${isMobileMenuOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <aside
          className={`absolute left-0 top-16 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col`}
        >
          <SidebarInner showClose />
        </aside>
      </div>

      <div className="flex flex-1 relative min-h-0">
        {/* Desktop Sidebar (fixed, collapsible) */}
        <aside
          className={`hidden md:flex fixed left-0 top-16 bottom-0 bg-white shadow-sm border-r border-gray-200 flex-col z-40 transition-[width] duration-200 ease-in-out ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <SidebarInner showClose={false} collapsed={isSidebarCollapsed} />
          <div className={`flex-shrink-0 border-t border-gray-200 p-2 ${isSidebarCollapsed ? 'flex justify-center' : 'flex justify-end'}`}>
            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              type="button"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div
          className={`flex-1 overflow-y-auto min-w-0 pb-[max(7rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))] md:pb-0 transition-[margin] duration-200 ease-in-out ${
            isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 lg:p-8"
          >
            <div className="max-w-7xl mx-auto w-full">
              {/* Welcome Banner - show only once per session when user first enters dashboard */}
              {user && !welcomeSeenThisSession && !['orders', 'wallet', 'manage-delivery-fees', 'manage-deliveries', 'manage-products', 'manage-categories', 'manage-referrals', 'manage-points', 'admin', 'admin-notifications'].includes(activeTab) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mb-4"
                >
                  <div className="px-6 py-4 sm:px-8 sm:py-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-0.5">
                          Welcome back, {user.name?.split(' ')[0] || user.name || 'Valued Customer'}!
                        </h1>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Great to see you here!
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {children}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only: z-[100] + isolate so it stays above cart (z-[70]) and receives clicks */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[100] isolate pointer-events-auto md:hidden bg-white/95 backdrop-blur border-t border-gray-200 pb-[env(safe-area-inset-bottom,0px)]"
        aria-label="Bottom navigation"
      >
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => {
                setIsCartOpen(false)
                setIsMobileMenuOpen(false)
                onTabChange('marketplace')
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${
                activeTab === 'marketplace' && !isCartOpen ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
              type="button"
              aria-label="Shop"
            >
              <Package className="h-5 w-5" />
              <span className="text-[11px] font-medium mt-1">Shop</span>
            </button>

            <button
              onClick={() => {
                setIsCartOpen(false)
                setIsMobileMenuOpen(false)
                onTabChange('orders')
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${
                activeTab === 'orders' && !isCartOpen ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
              type="button"
              aria-label="Orders"
            >
              <Truck className="h-5 w-5" />
              <span className="text-[11px] font-medium mt-1">Orders</span>
            </button>

            <button
              onClick={() => {
                setIsCartOpen(false)
                setIsMobileMenuOpen(false)
                onTabChange('wallet')
              }}
              className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${
                activeTab === 'wallet' && !isCartOpen ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
              type="button"
              aria-label="Wallet"
            >
              <Wallet className="h-5 w-5" />
              <span className="text-[11px] font-medium mt-1">Wallet</span>
            </button>

            <button
              onClick={() => {
                setIsCartOpen((prev) => !prev)
              }}
              className={`relative flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${
                isCartOpen ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
              type="button"
              aria-label={isCartOpen ? 'Close cart' : 'Open cart'}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-1/2 translate-x-2 bg-orange-600 text-white text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-bold tabular-nums">
                  {totalItems}
                </span>
              )}
              <span className="text-[11px] font-medium mt-1">Cart</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Cart Drawer (z-[70]/z-[71] so bottom nav z-[90] stays on top) */}
      {isCartOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 z-[70] lg:hidden"
            onClick={() => setIsCartOpen(false)}
          >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-[71] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header with close icon */}
            <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white shrink-0">
              <h2 className="text-lg font-bold flex items-center min-w-0">
                <ShoppingCart className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="truncate">Your Cart ({totalItems})</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors touch-manipulation"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Content - scrollable, shifted down */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">Add some products to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        <img
                          src={item.image || "/market_image.jpeg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/market_image.jpeg"
                          }}
                        />
                        <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-bl-lg">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 tabular-nums">
                          {(() => {
                            const v = item.variation
                            let pack = ""
                            if (v?.quantity != null) {
                              const unit = (v.unit || "").trim()
                              pack = unit ? `${v.quantity}${unit}` : String(v.quantity)
                            } else if ((v?.name || "").trim()) {
                              pack = v!.name.trim()
                            } else {
                              pack = (item.unit || "").trim()
                            }

                            if (!pack) return String(item.quantity)
                            return /\d/.test(pack) ? `${item.quantity} × ${pack}` : `${item.quantity} ${pack}`
                          })()}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {(item.name.includes(" - ") ? item.name.split(" - ")[0] : item.name).trim()}
                        </p>
                        <p className="text-xs text-gray-600 tabular-nums mt-0.5">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0 shrink-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min={1}
                          max={item.maxQuantity ?? 999}
                          value={item.quantity}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, "")
                            if (raw === "") return
                            const val = parseInt(raw, 10)
                            if (!Number.isNaN(val)) updateQuantity(item.id, Math.min(Math.max(1, val), item.maxQuantity ?? 999))
                          }}
                          onBlur={(e) => {
                            const raw = e.target.value.replace(/\D/g, "")
                            if (raw === "" || parseInt(raw, 10) < 1) {
                              updateQuantity(item.id, 1)
                              return
                            }
                            const val = parseInt(raw, 10)
                            if (!Number.isNaN(val)) updateQuantity(item.id, Math.min(Math.max(1, val), item.maxQuantity ?? 999))
                          }}
                          className="w-11 h-8 text-center text-sm font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`Quantity for ${item.name}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, item.maxQuantity ?? 999))}
                          disabled={item.quantity >= (item.maxQuantity ?? 999)}
                          className="h-8 w-8 p-0 shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 p-0 shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-gray-700 shrink-0">Subtotal</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums truncate text-right min-w-0">{formatCurrency(getTotalPrice())}</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => {
                        if (moqNotMet) return
                        setIsCartOpen(false)
                        router.push('/checkout')
                      }}
                      disabled={moqNotMet}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Checkout
                    </Button>
                    {moqNotMet && (
                      <p className="text-[10px] sm:text-xs text-amber-700 text-center">
                        {moqQuantityNotMet && moqAmountNotMet
                          ? `Min: ${minimumOrderQuantity} items & ₦${minimumOrderAmount.toLocaleString()}`
                          : moqQuantityNotMet
                            ? `Add ${minimumOrderQuantity - totalItems} more to checkout (min ${minimumOrderQuantity})`
                            : `Add ₦${(minimumOrderAmount - totalPrice).toLocaleString()} more (min ₦${minimumOrderAmount.toLocaleString()})`}
                      </p>
                    )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        clearCart()
                        setIsCartOpen(false)
                      }}
                      className="w-full text-gray-600"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  )
}