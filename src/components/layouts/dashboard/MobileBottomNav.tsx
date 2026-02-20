"use client"

import { Package, Truck, Wallet, ShoppingCart } from "lucide-react"

type DashboardTab = "marketplace" | "orders" | "manage-products" | "manage-categories" | "manage-deliveries" | "manage-delivery-fees" | "manage-referrals" | "manage-points" | "wallet" | "transactions" | "admin" | "notifications" | "admin-notifications"

interface MobileBottomNavProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  setIsMobileMenuOpen: (open: boolean) => void
  totalItems: number
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  isCartOpen,
  setIsCartOpen,
  setIsMobileMenuOpen,
  totalItems,
}: MobileBottomNavProps) {
  return (
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
            className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${activeTab === 'marketplace' && !isCartOpen ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
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
            className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${activeTab === 'orders' && !isCartOpen ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
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
            className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${activeTab === 'wallet' && !isCartOpen ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            type="button"
            aria-label="Wallet"
          >
            <Wallet className="h-5 w-5" />
            <span className="text-[11px] font-medium mt-1">Wallet</span>
          </button>

          <button
            onClick={() => {
              setIsCartOpen((prev: boolean) => !prev)
            }}
            className={`relative flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${isCartOpen ? 'text-orange-600 bg-orange-50' : 'text-gray-600 hover:bg-gray-50'
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
  )
}
