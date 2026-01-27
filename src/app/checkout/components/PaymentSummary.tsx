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
            <div className="flex justify-between items-center py-3 px-3 sm:px-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium text-sm sm:text-base">Delivery Fee</span>
              <span className={`font-bold text-sm sm:text-base ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}
              </span>
            </div>
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
                className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300"
              >
                ← Back
              </Button>
              <Button
                onClick={onPlaceOrder}
                className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    💳 Complete Order • ₦{finalTotal.toLocaleString()}
                  </>
                )}
              </Button>
            </div>

            {/* Order Summary Preview */}
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-600 mb-2">Payment Method</div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:space-x-2">
                  <div className="flex items-center justify-center space-x-2">
                    {paymentMethod === 'card' && <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />}
                    {paymentMethod === 'wallet' && <span className="text-base sm:text-lg">💰</span>}
                    {paymentMethod === 'paystack' && <span className="text-base sm:text-lg">🏦</span>}
                    <span className="text-sm font-medium text-gray-800">
                      {paymentMethod === 'card' ? 'Credit/Debit Card' :
                       paymentMethod === 'wallet' ? 'Wallet Balance' : 'Bank Transfer'}
                    </span>
                  </div>
                  {useWallet && paymentMethod === 'card' && (
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
