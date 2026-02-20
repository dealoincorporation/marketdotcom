"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/helpers/index"
import { cleanCartItemNameForDisplay, stripLeadingNumericCode } from "@/components/marketplace/utils"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  unit?: string
  maxQuantity?: number
  variation?: {
    name?: string
    quantity?: number
    unit?: string
  }
}

interface CartDrawerProps {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  moqNotMet: boolean
  moqQuantityNotMet: boolean
  moqAmountNotMet: boolean
  minimumOrderQuantity: number
  minimumOrderAmount: number
  getTotalPrice: () => number
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  onClose: () => void
}

export function CartDrawer({
  items,
  totalItems,
  totalPrice,
  moqNotMet,
  moqQuantityNotMet,
  moqAmountNotMet,
  minimumOrderQuantity,
  minimumOrderAmount,
  getTotalPrice,
  updateQuantity,
  removeItem,
  clearCart,
  onClose,
}: CartDrawerProps) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/25 z-[70] lg:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl z-[71] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white shrink-0">
          <h2 className="text-lg font-bold flex items-center min-w-0">
            <ShoppingCart className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="truncate">Your Cart ({totalItems})</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors touch-manipulation"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Content */}
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
                        // Prefer clean variation name (e.g. "1 Carton (4 Bottels)") over raw quantity/unit; strip leading codes like "14 "
                        let pack = (v?.name || "").trim()
                        if (pack) pack = stripLeadingNumericCode(pack)
                        if (!pack && v?.quantity != null) {
                          const unit = (v.unit || "").trim()
                          pack = unit ? `${v.quantity}${unit}` : String(v.quantity)
                        }
                        if (!pack) pack = (item.unit || "").trim()

                        if (!pack) return String(item.quantity)
                        return /\d/.test(pack) ? `${item.quantity} × ${pack}` : `${item.quantity} ${pack}`
                      })()}
                    </p>
                    {(() => {
                      const displayName = cleanCartItemNameForDisplay(item.name)
                      const productOnly = displayName.includes(" - ") ? displayName.split(" - ")[0] : displayName
                      return (
                        <p className="text-xs text-gray-500 truncate mt-0.5" title={displayName}>
                          {productOnly.trim()}
                        </p>
                      )
                    })()}
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
                    onClose()
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
                    onClose()
                    router.push('/dashboard?tab=marketplace')
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
                    onClose()
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
  )
}
