'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Search,
  Zap,
  Activity,
  ReceiptText,
  AlertTriangle
} from 'lucide-react'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { ProfileSettingsModal } from '@/components/profile/ProfileSettingsModal'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/cart-store'
import { useAuth } from '@/contexts/AuthContext'
import { getInitials } from "@/lib/helpers/index"
import { MobileBottomNav } from './dashboard/MobileBottomNav'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { getMissingProfileFields } from '@/lib/profile-completion'

type DashboardTab = "marketplace" | "orders" | "referrals" | "manage-products" | "manage-categories" | "manage-deliveries" | "manage-delivery-fees" | "manage-referrals" | "manage-points" | "wallet" | "transactions" | "admin" | "notifications" | "admin-notifications"

interface DashboardLayoutProps {
  children: ReactNode
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  isMobileMenuOpen: boolean
  setIsMobileMenuOpen: (open: boolean) => void
}

const navigationItems = [
  { id: 'marketplace' as DashboardTab, label: 'Marketplace', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'orders' as DashboardTab, label: 'Orders', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'referrals' as DashboardTab, label: 'Referrals', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'wallet' as DashboardTab, label: 'Wallet', icon: Wallet, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'transactions' as DashboardTab, label: 'Transactions', icon: ReceiptText, color: 'text-purple-600', bg: 'bg-purple-50' },
]

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const { items, getTotalItems, getTotalPrice } = useCartStore()
  const router = useRouter()
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [welcomeSeenThisSession, setWelcomeSeenThisSession] = useState(true)
  const [profileReminderDismissed, setProfileReminderDismissed] = useState(false)

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem('dashboard-welcome-seen') === 'true'
      setWelcomeSeenThisSession(seen)
      setIsSidebarCollapsed(localStorage.getItem('dashboard-sidebar-collapsed') === 'true')
      if (user?.id) {
        setProfileReminderDismissed(localStorage.getItem(`profile-reminder-dismissed-${user.id}`) === 'true')
      }
    } catch { }
  }, [user?.id])

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
      localStorage.setItem('dashboard-sidebar-collapsed', String(isSidebarCollapsed))
    } catch { }
  }, [isSidebarCollapsed])

  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const missingProfileFields = getMissingProfileFields({ name: user?.name, phone: (user as any)?.phone })
  const shouldShowProfileReminder = !!user && missingProfileFields.length > 0 && !profileReminderDismissed

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false)
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileDropdownOpen])

  const SidebarInner = ({ collapsed }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Navigation - Top padding adjusted to bring links up */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-6 pb-28 md:pb-10 pt-4 scrollbar-hide`}>
        <div className="space-y-1.5">
          {!collapsed && <p className="px-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">Navigation</p>}
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center transition-all duration-500 rounded-2xl relative group ${collapsed ? 'justify-center h-14' : 'px-4 py-4 gap-4'
                  } ${isActive ? 'bg-gray-900 text-white shadow-xl translate-x-1' : 'text-gray-400 hover:text-gray-900 hover:bg-white/60'}`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'scale-110 text-orange-400' : 'group-hover:scale-110 group-hover:text-gray-900'}`} />
                {!collapsed && <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>{item.label}</span>}
                {isActive && !collapsed && (
                  <motion.div layoutId="active-pill" className="absolute right-3 w-1.5 h-6 bg-orange-500 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {user?.role === 'ADMIN' && (
          <div className="space-y-1.5">
            {!collapsed && <p className="px-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">Management</p>}
            {[
              { id: 'manage-products', label: 'Products', icon: Box },
              { id: 'manage-categories', label: 'Categories', icon: Package },
              { id: 'manage-deliveries', label: 'Deliveries', icon: Truck },
              { id: 'manage-referrals', label: 'Referrals', icon: Users },
              { id: 'manage-points', label: 'Points & Rewards', icon: Coins },
              { id: 'admin-notifications', label: 'Notifications', icon: Bell },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id as any); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center transition-all duration-500 rounded-2xl relative group ${collapsed ? 'justify-center h-14' : 'px-4 py-4 gap-4'
                  } ${activeTab === item.id ? 'bg-gray-900 text-white shadow-xl translate-x-1' : 'text-gray-400 hover:text-gray-900 hover:bg-white/60'}`}
              >
                <item.icon className={`h-5 w-5 shrink-0 ${activeTab === item.id ? 'scale-110 text-blue-400' : 'group-hover:scale-110 group-hover:text-gray-900'}`} />
                {!collapsed && <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className={`p-4 border-t border-white/20 bg-white/75`}>
        <button
          onClick={() => { logout(); router.push('/') }}
          className={`w-full flex items-center rounded-2xl transition-all duration-500 text-red-500 hover:bg-red-50/50 group ${collapsed ? 'justify-center h-14' : 'px-4 py-4 gap-4'
            }`}
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
          {!collapsed && <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-[#F8F9FA] flex flex-col font-sans overflow-hidden">
      {/* Glassmorphic Background Objects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-400/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/5 blur-[120px] rounded-full" />
      </div>

      <header className="bg-white/85 backdrop-blur-[20px] border-b border-white/70 sticky top-0 z-[100] premium-shadow-sm h-20 xxs:h-[4.25rem]">
        <div className="max-w-[1600px] mx-auto px-6 xxs:px-2.5 h-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-6 xxs:gap-2 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 xxs:p-2 rounded-2xl xxs:rounded-xl bg-white/80 border border-white text-gray-900 hover:text-orange-600 transition-all active:scale-95 shrink-0"
            >
              <Menu className="h-6 w-6 xxs:h-5 xxs:w-5" />
            </button>
            <Link href="/" className="shrink-0 flex items-center group min-w-0">
              <img
                src="/mrktdotcom-logo.png"
                alt="Marketdotcom Logo"
                className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 xxs:h-12 xxs:w-12 object-contain drop-shadow-lg scale-110 xxs:scale-100"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4 sm:gap-8 xxs:gap-1.5 shrink-0">
            <div className="hidden lg:flex items-center bg-gray-900/5 border border-white/50 rounded-2xl px-4 py-2 w-72 group focus-within:bg-white focus-within:shadow-lg transition-all">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-orange-600" />
              <input type="text" placeholder="Search products, orders, or wallet..." className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest w-full placeholder:text-gray-400" />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationBell />

              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 xxs:gap-1.5 p-1 sm:p-2 pr-4 xxs:pr-1.5 bg-white/75 border border-white/70 rounded-full hover:bg-white/90 transition-all premium-shadow-sm hover:premium-shadow"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 xxs:w-8 xxs:h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-black text-[10px] xxs:text-[9px] shadow-lg">
                    {getInitials(user?.name || user?.email || 'U')}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-500 xxs:hidden ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 top-full mt-4 w-80 xxs:left-1/2 xxs:right-auto xxs:-translate-x-1/2 xxs:w-[calc(100vw-12px)] bg-white/98 backdrop-blur-2xl rounded-[2.5rem] xxs:rounded-2xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden z-[130] premium-shadow"
                    >
                      <div className="max-h-[80vh] overflow-y-auto custom-scrollbar pb-24 md:pb-0">
                        {/* Profile Header */}
                        <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                              <User className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-0.5">My Profile</p>
                              <p className="text-sm font-black text-gray-900 truncate tracking-tight">{user?.name || 'Member'}</p>
                              <p className="text-[10px] font-bold text-gray-400 truncate tracking-tight">{user?.email}</p>
                            </div>
                          </div>

                          {/* Premium Status Plate */}
                          <div className="relative overflow-hidden rounded-[2rem] p-5 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-2xl group/plate">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover/plate:scale-150 transition-transform duration-1000" />
                            
                            <div className="relative z-10 space-y-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[8px] font-black text-orange-400 uppercase tracking-[0.3em] mb-1">Current Balance</p>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black tabular-nums">300</span>
                                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-tighter">pts</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">Tier Status</p>
                                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 text-orange-400">Bronze</span>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-400">
                                  <span>Progress</span>
                                  <span>700 pts to Silver</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '30%' }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full shadow-[0_0_12px_rgba(234,88,12,0.5)]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Quick Tiles */}
                        <div className="p-3">
                          <p className="px-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">Account Links</p>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => { setProfileDropdownOpen(false); setProfileModalOpen(true) }}
                              className="group flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-gray-50/50 hover:bg-orange-600 transition-all duration-500 border border-transparent hover:border-orange-500/30"
                            >
                              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2 group-hover:bg-white/20 group-hover:text-white transition-colors duration-500">
                                <Settings className="h-4 w-4 group-hover:rotate-45 transition-transform duration-500" />
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors duration-500">Profile</span>
                            </button>

                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false)
                                onTabChange(user?.role === 'ADMIN' ? 'manage-referrals' : 'referrals')
                              }}
                              className="group flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-gray-50/50 hover:bg-purple-600 transition-all duration-500 border border-transparent hover:border-purple-500/30"
                            >
                              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-white/20 group-hover:text-white transition-colors duration-500">
                                <Users className="h-4 w-4 group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors duration-500">Referrals</span>
                            </button>

                            {user?.role === 'ADMIN' && (
                              <button
                                onClick={() => { setProfileDropdownOpen(false); onTabChange('admin') }}
                                className="group flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-gray-50/50 hover:bg-blue-600 transition-all duration-500 border border-transparent hover:border-blue-500/30 col-span-1"
                              >
                                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-white/20 group-hover:text-white transition-colors duration-500">
                                  <LayoutDashboard className="h-4 w-4" />
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors duration-500">Admin</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false)
                                onTabChange(user?.role === 'ADMIN' ? 'manage-points' : 'wallet')
                              }}
                              className={`group flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-orange-600 text-white shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all duration-500 ${user?.role === 'ADMIN' ? 'col-span-1' : 'col-span-2'}`}
                            >
                              <Coins className="h-5 w-5 mb-2 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500" />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Redeem Points</span>
                            </button>
                          </div>

                          <div className="pt-2 mt-2 border-t border-gray-100">
                            <button
                              onClick={() => { setProfileDropdownOpen(false); logout(); router.push('/') }}
                              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-red-50 text-red-500 transition-all font-black text-[10px] uppercase tracking-widest group"
                            >
                              <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" /> Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden md:block">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative group h-12 px-6 bg-gray-900 rounded-2xl flex items-center gap-3 transition-all hover:bg-gray-800 shadow-xl"
                >
                  <ShoppingCart className="h-5 w-5 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Checkout</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-600 text-white text-[10px] font-black rounded-lg flex items-center justify-center border-2 border-white shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col h-full bg-white/85 backdrop-blur-xl border-r border-white/70 transition-[width] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] p-4 relative z-50 ${isSidebarCollapsed ? 'w-24' : 'w-[320px]'
            }`}
        >
          <SidebarInner collapsed={isSidebarCollapsed} />

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-gray-900 border border-white/20 rounded-xl flex items-center justify-center text-white shadow-2xl z-20 group hover:w-10 transition-all"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </aside>

        {/* Mobile Swipe-out Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-[400px] bg-white/95 backdrop-blur-3xl border-r border-white/60 z-[100] md:hidden flex flex-col"
              >
                <div className="p-8 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center">
                    <img
                      src="/mrktdotcom-logo.png"
                      alt="Marketdotcom Logo"
                      className="h-16 w-16 object-contain scale-110"
                    />
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl bg-gray-100 text-gray-900">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SidebarInner />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-transparent relative scroll-smooth overflow-x-hidden">
          <div className="p-6 sm:p-10 lg:p-16 max-w-[1400px] mx-auto min-h-full flex flex-col">
            {/* Dynamic Welcome Banner */}
            {shouldShowProfileReminder && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-3xl border border-orange-200 bg-orange-50/95 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-black text-orange-900 uppercase tracking-wider">Complete your profile</p>
                    <p className="text-xs text-orange-800">
                      Missing required fields: {missingProfileFields.join(", ")}. Complete your profile to avoid checkout issues.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setProfileModalOpen(true)}
                    className="h-10 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Complete Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (user?.id) {
                        localStorage.setItem(`profile-reminder-dismissed-${user.id}`, "true")
                      }
                      setProfileReminderDismissed(true)
                    }}
                    className="h-10 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Dismiss
                  </Button>
                </div>
              </motion.div>
            )}

            {user && !welcomeSeenThisSession && activeTab === 'marketplace' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12 relative overflow-hidden glass-effect border border-white/60 rounded-[3rem] p-12 premium-shadow group"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                  <div className="w-24 h-24 bg-gray-900 rounded-[2rem] flex items-center justify-center shadow-2xl">
                    <Sparkles className="h-10 w-10 text-orange-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter mb-2">
                      Hello, <span className="text-gray-400 italic font-medium">{user.name?.split(' ')[0] || 'Member'}</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">You are signed in and ready to shop.</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex-1">
              {children}
            </div>

            <footer className="mt-20 pt-10 border-t border-gray-100 pb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-orange-500" />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Powered by Marketdotcom</p>
              </div>
              <div className="flex items-center gap-6">
                {['Privacy', 'Terms', 'Support'].map(f => (
                  <button key={f} className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">{f}</button>
                ))}
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Overlays */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCartOpen={isCartOpen}
        isHidden={isMobileMenuOpen || profileDropdownOpen || profileModalOpen}
        setIsCartOpen={setIsCartOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        totalItems={totalItems}
      />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <ProfileSettingsModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  )
}
