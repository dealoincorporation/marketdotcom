"use client"

import { Shield, Truck, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import { cleanCartItemNameForDisplay } from "@/components/marketplace/utils"
import type { CartItem } from "@/lib/cart-store"

/** Quantity + pack/unit for display: "1 × Half Carton (5 bags)" or "6 × 25 L" */
function getQuantityUnitDisplay(item: CartItem): string {
  const v = item.variation
  // Prefer descriptive variation name (e.g. "Half Carton (5 bags)") over raw quantity/unit (e.g. "5")
  let pack = (v?.name || "").trim()
  if (!pack && v?.quantity != null) {
    const unit = (v.unit || "").trim()
    pack = unit ? `${v.quantity}${unit}` : String(v.quantity)
  }
  if (!pack) pack = (item.unit || "").trim()

  if (!pack) return String(item.quantity)
  return /\d/.test(pack) ? `${item.quantity} × ${pack}` : `${item.quantity} ${pack}`
}

interface OrderSummaryProps {
  items: CartItem[]
  totalItems: number
  subtotal: number
  deliveryFee: number
  totalWeight: number
  finalTotal: number
  selectedAddress: string
  deliveryDate: string
  deliveryTime: string
  deliverySlotDescription?: string
  moqNotMet?: boolean
  moqQuantityNotMet?: boolean
  moqAmountNotMet?: boolean
  minimumOrderQuantity?: number
  minimumOrderAmount?: number
  onContinue: () => void
}

export function OrderSummary({
  items,
  totalItems,
  subtotal,
  deliveryFee,
  totalWeight,
  finalTotal,
  selectedAddress,
  deliveryDate,
  deliveryTime,
  deliverySlotDescription,
  moqNotMet = false,
  moqQuantityNotMet = false,
  moqAmountNotMet = false,
  minimumOrderQuantity = 1,
  minimumOrderAmount = 0,
  onContinue,
}: OrderSummaryProps) {
  const canContinue = selectedAddress && deliveryDate && deliveryTime && !moqNotMet
  const { removeItem } = useCartStore()

  return (
    <div className="lg:col-span-1 min-w-0 w-full max-w-full overflow-hidden order-last lg:order-none">
      <div className="sticky top-4 sm:top-8 space-y-4 sm:space-y-6">
        {/* Order Items */}
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl sm:rounded-2xl shadow-xl border border-orange-200 overflow-hidden w-full max-w-full min-w-0">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 break-words">
              🛒 Order Summary
            </h2>
            <p className="text-orange-100 mt-1 text-sm sm:text-base">{totalItems} items in your cart</p>
          </div>
          <div className="p-4 sm:p-6 min-w-0">
            <div className="space-y-3 sm:space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <img
                      src={item.image || "/market_image.jpeg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-orange-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-bl-lg">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 break-words">{cleanCartItemNameForDisplay(item.name)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{getQuantityUnitDisplay(item)}</p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
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
              ))}
            </div>

            <div className="space-y-3 border-t border-orange-200 pt-4">
              <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                <span className="text-gray-700 text-sm sm:text-base">Subtotal</span>
                <span className="font-semibold text-orange-700 text-sm sm:text-base">₦{subtotal.toLocaleString()}</span>
              </div>

              {totalWeight > 0 && (
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="text-gray-700 text-sm sm:text-base flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-blue-500" />
                    Total Weight
                  </span>
                  <span className="font-semibold text-blue-700 text-sm sm:text-base">{totalWeight.toFixed(1)} kg</span>
                </div>
              )}

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-700 text-sm sm:text-base">Delivery Fee</span>
                <span className={`font-semibold text-sm sm:text-base ${deliveryFee === 0 ? 'text-green-600' : 'text-orange-700'}`}>
                  {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}
                </span>
              </div>

              <div className="relative">
                <div className="border-t border-orange-300 pt-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-lg">
                    <span className="text-base sm:text-lg font-bold">Total</span>
                    <span className="text-base sm:text-lg font-bold">
                      ₦{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery note (admin-set) and optional free-delivery message, only after date & time selected */}
              {deliveryDate && deliveryTime && (
                <>
                  {deliverySlotDescription && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-medium text-amber-800 mb-0.5">Delivery note</p>
                      <p className="text-sm text-amber-900">{deliverySlotDescription}</p>
                    </div>
                  )}
                  {deliveryFee === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs sm:text-sm text-green-800 font-medium">
                        🎉 {typeof window !== 'undefined' && localStorage.getItem('freeDeliveryMessage') 
                          ? localStorage.getItem('freeDeliveryMessage') 
                          : 'Free delivery!'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <Button
              onClick={onContinue}
              className="w-full h-12 sm:h-14 mt-4 sm:mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-sm sm:text-base"
              disabled={!canContinue}
            >
              Continue to Payment →
            </Button>

            {!selectedAddress && (
              <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center justify-center flex-wrap gap-1 text-center">
                <span>⚠️</span> Please select a delivery address
              </p>
            )}
            {selectedAddress && (!deliveryDate || !deliveryTime) && (
              <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center justify-center">
                <span className="mr-1">⚠️</span> Please select delivery date and time
              </p>
            )}
            {moqNotMet && (
              <div className="text-xs sm:text-sm text-amber-700 mt-2 space-y-1 text-center">
                {moqQuantityNotMet && (
                  <p className="flex items-center justify-center">
                    <span className="mr-1">⚠️</span> Minimum order: {minimumOrderQuantity} items required. Add {minimumOrderQuantity - totalItems} more to continue.
                  </p>
                )}
                {moqAmountNotMet && (
                  <p className="flex items-center justify-center">
                    <span className="mr-1">⚠️</span> Minimum order amount: ₦{minimumOrderAmount.toLocaleString()}. Add ₦{(minimumOrderAmount - subtotal).toLocaleString()} more to continue.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-purple-600" />
              <span>Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
