"use client"

import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaymentSummaryProps {
  subtotal: number
  deliveryFee: number
  walletDeduction: number
  finalTotal: number
  paymentMethod: string
  useWallet: boolean
  loading: boolean
  moqNotMet?: boolean
  moqQuantityNotMet?: boolean
  moqAmountNotMet?: boolean
  minimumOrderQuantity?: number
  minimumOrderAmount?: number
  totalItems?: number
  onBack: () => void
  onPlaceOrder: () => void
}

export function PaymentSummary({
  subtotal,
  deliveryFee,
  walletDeduction,
  finalTotal,
  paymentMethod,
  useWallet,
  loading,
  moqNotMet = false,
  moqQuantityNotMet = false,
  moqAmountNotMet = false,
  minimumOrderQuantity = 1,
  minimumOrderAmount = 0,
  totalItems = 0,
  onBack,
  onPlaceOrder,
}: PaymentSummaryProps) {

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            💰 Payment Summary
          </h2>
          <p className="text-orange-100 mt-1">Review your order details</p>
        </div>
        <div className="p-6">
          {/* Order Breakdown */}
          <div className="space-y-3 sm:space-y-4 mb-6">
            <div className="flex justify-between items-center py-3 px-3 sm:px-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium text-sm sm:text-base">Subtotal</span>
              <span className="font-bold text-gray-900 text-sm sm:text-base">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-center py-3 px-3 sm:px-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium text-sm sm:text-base">Delivery Fee</span>
              <span className={`font-bold text-sm sm:text-base ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            {deliveryFee === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-xs sm:text-sm text-green-800 font-medium">
                  🎉 {typeof window !== 'undefined' && localStorage.getItem('freeDeliveryMessage') 
                    ? localStorage.getItem('freeDeliveryMessage') 
                    : 'Free delivery!'}
                </p>
              </div>
            )}
            {useWallet && (
              <div className="flex justify-between items-center py-3 px-3 sm:px-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-900 text-sm sm:text-base">Wallet Deduction</span>
                <span className="font-bold text-green-600 text-sm sm:text-base">-₦{walletDeduction.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t-2 border-gray-300 pt-4 mt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-gray-900">Total to Pay</span>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  ₦{finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="w-full sm:flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300 text-sm sm:text-base"
              >
                ← Back
              </Button>
              <Button
                onClick={onPlaceOrder}
                className="w-full sm:flex-1 min-h-[48px] sm:h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 px-3 sm:px-4 py-2.5 sm:py-3"
                disabled={loading || moqNotMet}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                    <span className="text-xs sm:text-sm md:text-base">Processing...</span>
                  </span>
                ) : moqNotMet ? (
                  <span className="text-xs sm:text-sm">Fulfill MOQ to checkout</span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-sm sm:text-base md:text-lg">💳</span>
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg">Complete Order</span>
                    <span className="hidden sm:inline text-xs sm:text-sm md:text-base">•</span>
                    <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold whitespace-nowrap">₦{finalTotal.toLocaleString()}</span>
                  </span>
                )}
              </Button>
            </div>
            {moqNotMet && (
              <div className="text-xs sm:text-sm text-amber-700 mt-2 space-y-1 text-center">
                {moqQuantityNotMet && (
                  <p>Minimum order: {minimumOrderQuantity} items required. Add {minimumOrderQuantity - totalItems} more to place order.</p>
                )}
                {moqAmountNotMet && (
                  <p>Minimum order amount: ₦{minimumOrderAmount.toLocaleString()}. Add ₦{(minimumOrderAmount - subtotal).toLocaleString()} more to place order.</p>
                )}
              </div>
            )}

            {/* Order Summary Preview */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-600 mb-2">Payment Method</div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:space-x-2">
                  <div className="flex items-center justify-center space-x-2">
                    {paymentMethod === 'paystack' && <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />}
                    {paymentMethod === 'wallet' && <span className="text-base sm:text-lg">💰</span>}
                    <span className="text-sm font-medium text-gray-800">
                      {paymentMethod === 'paystack' ? 'Card/Bank Transfer' :
                       paymentMethod === 'wallet' ? 'Wallet Balance' : 'Card/Bank Transfer'}
                    </span>
                  </div>
                  {useWallet && paymentMethod === 'paystack' && (
                    <span className="text-xs text-green-600 font-medium">
                      (+₦{walletDeduction.toLocaleString()} from wallet)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
