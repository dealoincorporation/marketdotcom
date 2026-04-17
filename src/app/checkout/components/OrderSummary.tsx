"use client"

import { Shield, Truck, Check, Trash2, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
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
    <div className="lg:col-span-1 min-w-0 w-full max-w-full order-last lg:order-none">
      <div className="checkout-sticky space-y-4 sm:space-y-6 lg:sticky lg:top-24">
        {/* Order summary */}
        <div className="checkout-card bg-white/85 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/70 overflow-hidden w-full transition-all duration-500">
          <div className="bg-gray-900 p-5 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05]">
              <Shield className="h-40 w-40 text-white" />
            </div>
            <div className="relative z-10">
              <h2 className="text-[11px] sm:text-sm font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.4em] mb-2">
                Order Summary
              </h2>
              <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wide sm:tracking-widest leading-relaxed">
                Review your items and total before payment. <br />
                Items: <span className="text-orange-400">{totalItems}</span>
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-10">
            {/* Items */}
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-10 max-h-[320px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-1 sm:pr-2">
              {items.map(item => (
                <div key={item.id} className="glass-effect rounded-[1.25rem] sm:rounded-[1.5rem] border border-gray-100 bg-white/40 backdrop-blur-sm p-3 sm:p-4 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-gray-100 flex-shrink-0 shadow-inner">
                      <img
                        src={item.image || "/market_image.jpeg"}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-black text-gray-900 uppercase tracking-tight line-clamp-2 sm:line-clamp-1 mb-1">{cleanCartItemNameForDisplay(item.name)}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{getQuantityUnitDisplay(item)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-black text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-4 border-t border-gray-100 pt-8">
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-[11px] font-black text-gray-900">₦{subtotal.toLocaleString()}</span>
              </div>

              {totalWeight > 0 && (
                <div className="flex justify-between items-center px-2 py-3 bg-gray-50/50 rounded-xl">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Truck className="h-3 w-3" /> Total Weight
                  </span>
                  <span className="text-[11px] font-black text-gray-900">{totalWeight.toFixed(1)} KG</span>
                </div>
              )}

              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Fee</span>
                <span className={`text-[11px] font-black ${deliveryFee === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {deliveryFee === 0 ? 'FREE' : `₦${deliveryFee.toLocaleString()}`}
                </span>
              </div>

              <div className="mt-8">
                <div className="bg-gray-950 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                    <Shield className="h-16 w-16 text-white" />
                  </div>
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.3em] mb-1">Total</p>
                      <span className="text-xl font-black text-white tracking-widest">
                        ₦{finalTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery notes */}
              {deliveryDate && deliveryTime && (
                <div className="p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50 space-y-2 mt-4">
                  {deliverySlotDescription && (
                    <div className="flex gap-2">
                      <div className="h-1.5 w-1.5 bg-orange-400 rounded-full mt-1 flex-shrink-0" />
                      <p className="text-[10px] font-bold text-gray-600 leading-normal">{deliverySlotDescription}</p>
                    </div>
                  )}
                  {deliveryFee === 0 && (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Free delivery applied</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={onContinue}
              className="checkout-primary-action w-full h-14 sm:h-16 mt-6 sm:mt-8 bg-gray-900 hover:bg-gray-800 text-white rounded-xl sm:rounded-[1.25rem] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-[11px] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={!canContinue}
            >
              Continue to Payment
            </Button>

            {!selectedAddress && (
              <p className="text-[9px] font-black text-red-500 mt-4 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertTriangle className="h-3 w-3" /> Please select a delivery address
              </p>
            )}
            {selectedAddress && (!deliveryDate || !deliveryTime) && (
              <p className="text-[9px] font-black text-red-500 mt-4 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                <AlertTriangle className="h-3 w-3" /> Please select a delivery date and time
              </p>
            )}
            {moqNotMet && (
              <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                {moqQuantityNotMet && (
                  <p className="text-[9px] font-black text-amber-700 uppercase tracking-tight text-center">
                    Minimum quantity required: {minimumOrderQuantity}. Add {minimumOrderQuantity - totalItems} more.
                  </p>
                )}
                {moqAmountNotMet && (
                  <p className="text-[9px] font-black text-amber-700 uppercase tracking-tight text-center">
                    Minimum order amount: ₦{minimumOrderAmount.toLocaleString()}. Add ₦{(minimumOrderAmount - subtotal).toLocaleString()} more.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] border border-white/70 p-4 sm:p-6 shadow-sm overflow-hidden group">
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-2 grayscale group-hover:grayscale-0 transition-all duration-700">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Shield className="h-5 w-5 text-gray-900" />
              </div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Secure</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col items-center gap-2 grayscale group-hover:grayscale-0 transition-all duration-700 delay-75">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Truck className="h-5 w-5 text-gray-900" />
              </div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fast Delivery</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="flex flex-col items-center gap-2 grayscale group-hover:grayscale-0 transition-all duration-700 delay-150">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Check className="h-5 w-5 text-gray-900" />
              </div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
