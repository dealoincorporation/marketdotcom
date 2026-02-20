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
import { getInitials } from "@/lib/helpers/index"
import { ReceiptText } from 'lucide-react'
import { MobileBottomNav } from './dashboard/MobileBottomNav'
import { CartDrawer } from '@/components/cart/CartDrawer'
type DashboardTab = "marketplace" | "orders" | "manage-products" | "manage-categories" | "manage-deliveries" | "manage-delivery-fees" | "manage-referrals" | "manage-points" | "wallet" | "transactions" | "admin" | "notifications" | "admin-notifications"

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
  {
    id: 'transactions' as DashboardTab,
    label: 'Transactions',
    icon: ReceiptText,
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
      .catch(() => { })
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
      } catch { }
    }, 4000)
    return () => clearTimeout(t)
  }, [welcomeSeenThisSession, user])

  useEffect(() => {
    try {
      setIsSidebarCollapsed(localStorage.getItem('dashboard-sidebar-collapsed') === 'true')
    } catch { }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('dashboard-sidebar-collapsed', String(isSidebarCollapsed))
    } catch { }
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
        <div className={`flex-shrink-0 border-b border-gray-200 bg-gradient-to-br from-white to-gray-50 transition-all duration-200 ${collapsed ? 'p-3 md:p-3' : 'p-4 md:p-6'
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

        <nav className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transition-all duration-200 ${collapsed ? 'px-2' : 'px-3 md:px-4'
          }`}>
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`hidden md:flex w-full items-center rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
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
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                    } ${activeTab === item.id
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
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                    } ${activeTab === 'manage-products'
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
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                    } ${activeTab === 'manage-categories'
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
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                    } ${activeTab === 'manage-deliveries'
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
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                    } ${activeTab === 'manage-delivery-fees'
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
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                    } ${activeTab === 'manage-points'
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
                  className={`w-full flex items-center rounded-lg transition-all duration-200 cursor-pointer touch-manipulation ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
                    } ${activeTab === 'admin-notifications'
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
              className={`w-full flex items-center rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100 cursor-pointer touch-manipulation ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3 text-left'
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

              {/* Desktop Cart Button */}
              <div className="hidden md:block">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative hover:bg-orange-50 hover:border-orange-300"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
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
          className={`absolute left-0 top-16 bottom-0 w-72 max-w-[85vw] bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } flex flex-col`}
        >
          <SidebarInner showClose />
        </aside>
      </div>

      <div className="flex flex-1 relative min-h-0">
        {/* Desktop Sidebar (fixed, collapsible) */}
        <aside
          className={`hidden md:flex fixed left-0 top-16 bottom-0 bg-white shadow-sm border-r border-gray-200 flex-col z-40 transition-[width] duration-200 ease-in-out ${isSidebarCollapsed ? 'w-16' : 'w-64'
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
          className={`flex-1 overflow-y-auto min-w-0 pb-[max(7rem,calc(5.5rem+env(safe-area-inset-bottom,0px)))] md:pb-0 transition-[margin] duration-200 ease-in-out ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
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

      {/* Bottom Navigation - Mobile Only */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        totalItems={totalItems}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  )
}