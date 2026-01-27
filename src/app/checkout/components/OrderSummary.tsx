"use client"

import { Shield, Truck, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/cart-store"

interface OrderSummaryProps {
  items: CartItem[]
  totalItems: number
  subtotal: number
  deliveryFee: number
  finalTotal: number
  selectedAddress: string
  deliveryDate: string
  deliveryTime: string
  onContinue: () => void
}

export function OrderSummary({
  items,
  totalItems,
  subtotal,
  deliveryFee,
  finalTotal,
  selectedAddress,
  deliveryDate,
  deliveryTime,
  onContinue,
}: OrderSummaryProps) {
  const canContinue = selectedAddress && deliveryDate && deliveryTime

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-8 space-y-6">
        {/* Order Items */}
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              🛒 Order Summary
            </h2>
            <p className="text-orange-100 mt-1">{totalItems} items in your cart</p>
          </div>
          <div className="p-6">
            <div className="space-y-3 sm:space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-orange-600">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-orange-200 pt-4">
              <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                <span className="text-gray-700 text-sm sm:text-base">Subtotal</span>
                <span className="font-semibold text-orange-700 text-sm sm:text-base">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
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
            </div>

            <Button
              onClick={onContinue}
              className="w-full h-12 sm:h-14 mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-sm sm:text-base"
              disabled={!canContinue}
            >
              Continue to Payment →
            </Button>

            {!selectedAddress && (
              <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center justify-center">
                <span className="mr-1">⚠️</span> Please select a delivery address
              </p>
            )}
            {selectedAddress && (!deliveryDate || !deliveryTime) && (
              <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center justify-center">
                <span className="mr-1">⚠️</span> Please select delivery date and time
              </p>
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
