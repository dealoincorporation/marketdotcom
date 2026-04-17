"use client"

import { CreditCard, Shield } from "lucide-react"
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
      <div className="sticky top-24 space-y-6">
        <div className="bg-white/85 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/70 overflow-hidden w-full transition-all duration-500">
          <div className="bg-gray-900 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.05]">
              <span className="text-8xl">💳</span>
            </div>
            <div className="relative z-10">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] mb-2">
                Payment Summary
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                Review your totals before placing the order.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            {/* Breakdown */}
            <div className="space-y-4 mb-10">
              <div className="flex justify-between items-center px-2 py-3 bg-gray-50/50 rounded-xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-[11px] font-black text-gray-900">₦{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center px-2 py-3 bg-gray-50/50 rounded-xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Fee</span>
                <span className={`text-[11px] font-black ${deliveryFee === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {deliveryFee === 0 ? 'FREE' : `₦${deliveryFee.toLocaleString()}`}
                </span>
              </div>

              {deliveryFee === 0 && (
                <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-[8px] font-black text-emerald-800 uppercase tracking-widest text-center">
                    Free delivery applied to this order
                  </p>
                </div>
              )}

              {useWallet && walletDeduction > 0 && (
                <div className="flex justify-between items-center px-4 py-4 bg-emerald-950 rounded-xl border border-emerald-900">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Wallet Deduction</span>
                  <span className="text-[11px] font-black text-white">-₦{walletDeduction.toLocaleString()}</span>
                </div>
              )}

              <div className="mt-8">
                <div className="bg-gray-950 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                    <Shield className="h-16 w-16 text-white" />
                  </div>
                  <div className="relative z-10 flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-[0.3em] mb-1">Total to Pay</p>
                      <span className="text-xl font-black text-white tracking-widest">
                        ₦{finalTotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button
                onClick={onPlaceOrder}
                className="w-full h-18 bg-gray-900 hover:bg-gray-800 text-white rounded-[1.25rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all active:scale-[0.98] py-6"
                disabled={loading || moqNotMet}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Authorizing...</span>
                  </div>
                ) : (
                    <span>Place Order • ₦{finalTotal.toLocaleString()}</span>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onBack}
                className="w-full h-14 border-2 border-gray-100 hover:border-gray-900 rounded-[1.25rem] font-black uppercase tracking-[0.3em] text-[10px] text-gray-400 hover:text-gray-900 transition-all"
              >
                Back to Delivery
              </Button>
            </div>

            {moqNotMet && (
              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest text-center leading-relaxed">
                  Please meet the minimum order requirement to continue
                </p>
              </div>
            )}

            {/* Payment preview */}
            <div className="mt-8 p-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <div className="flex items-center justify-center gap-4">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Pay with:</div>
                <div className="flex items-center gap-2">
                  {paymentMethod === 'paystack' ? (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3 text-gray-900" />
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Paystack</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs">💰</span>
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Wallet Balance</span>
                    </div>
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
