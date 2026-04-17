"use client"

import { Package, Truck, Wallet, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"

type DashboardTab = "marketplace" | "orders" | "referrals" | "manage-products" | "manage-categories" | "manage-deliveries" | "manage-delivery-fees" | "manage-referrals" | "manage-points" | "wallet" | "transactions" | "admin" | "notifications" | "admin-notifications"

interface MobileBottomNavProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  isCartOpen: boolean
  isHidden?: boolean
  setIsCartOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  setIsMobileMenuOpen: (open: boolean) => void
  totalItems: number
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  isCartOpen,
  isHidden = false,
  setIsCartOpen,
  setIsMobileMenuOpen,
  totalItems,
}: MobileBottomNavProps) {
  if (isHidden) return null

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[80] w-[90vw] max-w-[400px] xxs:w-[calc(100vw-8px)] xxs:max-w-none xxs:bottom-1.5 md:hidden">
      <nav
        className="bg-white/90 backdrop-blur-3xl border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] rounded-[2.5rem] xxs:rounded-2xl p-2 xxs:p-1.5 flex items-center justify-between premium-shadow"
        aria-label="Bottom navigation"
      >
        {[
          { id: 'marketplace', icon: Package, label: 'Shop' },
          { id: 'orders', icon: Truck, label: 'Orders' },
          { id: 'wallet', icon: Wallet, label: 'Wallet' },
        ].map((item) => {
          const isActive = activeTab === item.id && !isCartOpen
          return (
            <button
              key={item.id}
              onClick={() => {
                setIsCartOpen(false)
                setIsMobileMenuOpen(false)
                onTabChange(item.id as DashboardTab)
              }}
              className="relative flex-1 flex flex-col items-center justify-center py-2.5 xxs:py-2 rounded-3xl xxs:rounded-2xl transition-all duration-500 overflow-hidden group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-orange-600 rounded-2xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={`h-5 w-5 xxs:h-4 xxs:w-4 relative z-10 transition-all duration-500 ${isActive ? 'text-white scale-110' : 'text-gray-400 group-hover:text-gray-900 group-hover:scale-110'}`} />
              <span className={`text-[9px] xxs:text-[8px] xxs:tracking-wide font-black uppercase tracking-widest relative z-10 mt-1 xxs:mt-0.5 transition-all duration-500 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          )
        })}

        <button
          onClick={() => setIsCartOpen((prev: boolean) => !prev)}
          className={`relative flex-1 flex flex-col items-center justify-center py-2.5 xxs:py-2 rounded-3xl xxs:rounded-2xl transition-all duration-500 group ${isCartOpen ? 'bg-orange-600' : 'bg-transparent'}`}
        >
          {isCartOpen && (
            <motion.div
              layoutId="activeTabBg"
              className="absolute inset-0 bg-orange-600 rounded-2xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative">
            <ShoppingCart className={`h-5 w-5 xxs:h-4 xxs:w-4 relative z-10 transition-all duration-500 ${isCartOpen ? 'text-white scale-110' : 'text-gray-400 group-hover:text-gray-900 group-hover:scale-110'}`} />
            {totalItems > 0 && (
              <span className={`absolute -top-2 -right-2 h-4 min-w-4 px-1 flex items-center justify-center rounded-lg text-[8px] font-black border-2 border-white shadow-lg transition-colors duration-500 ${isCartOpen ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'}`}>
                {totalItems}
              </span>
            )}
          </div>
          <span className={`text-[9px] xxs:text-[8px] xxs:tracking-wide font-black uppercase tracking-widest relative z-10 mt-1 xxs:mt-0.5 transition-all duration-500 ${isCartOpen ? 'text-white' : 'text-gray-400'}`}>
            Cart
          </span>
        </button>
      </nav>
    </div>
  )
}
