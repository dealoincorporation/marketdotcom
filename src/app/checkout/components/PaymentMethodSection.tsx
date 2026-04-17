"use client"

import { CreditCard, Shield, Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface PaymentMethodSectionProps {
  paymentMethod: string
  onPaymentMethodChange: (method: string) => void
  walletBalance: number
  finalTotal: number
  useWallet: boolean
  onUseWalletChange: (use: boolean) => void
}

export function PaymentMethodSection({
  paymentMethod,
  onPaymentMethodChange,
  walletBalance,
  finalTotal,
  useWallet,
  onUseWalletChange,
}: PaymentMethodSectionProps) {
  return (
    <div className="checkout-card bg-white/85 backdrop-blur-3xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/70 overflow-hidden w-full transition-all duration-500">
      {/* Payment header */}
      <div className="bg-gray-900 p-5 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <CreditCard className="h-40 w-40 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
            </div>
            <h2 className="text-[11px] sm:text-sm font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.4em]">Payment Method</h2>
          </div>
          <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wide sm:tracking-widest leading-relaxed">
            Choose how you want to pay for this order. <br className="hidden sm:block" />
            End-to-end encryption: <span className="text-orange-400 font-black">Enabled</span>
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-10">
        <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-4 sm:space-y-6">
          {/* Paystack option */}
          <div className={`relative group rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${paymentMethod === "paystack"
            ? 'border-gray-900 bg-white shadow-2xl scale-[1.01]'
            : 'border-gray-50 bg-gray-50/50 hover:border-gray-300 hover:bg-white'
            }`}>
            <div className="p-4 sm:p-10 flex items-start gap-3 sm:gap-6">
              <div className="pt-1">
                <RadioGroupItem value="paystack" id="paystack" className="h-6 w-6 border-gray-200 text-orange-600" />
              </div>

              <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                    <div className={`p-4 rounded-2xl ${paymentMethod === "paystack" ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Card or Bank Transfer</h3>
                      <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Secure Paystack API</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 grayscale opacity-80 sm:opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                      <div className="w-8 h-5 bg-white border border-gray-100 rounded text-[7px] flex items-center justify-center font-black text-blue-800 italic shadow-sm">VISA</div>
                      <div className="w-8 h-5 bg-white border border-gray-100 rounded text-[7px] flex items-center justify-center font-black text-orange-600 italic shadow-sm">MASTER</div>
                      <div className="w-8 h-5 bg-white border border-gray-100 rounded text-[7px] flex items-center justify-center font-black text-gray-400 italic shadow-sm">VERVE</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed">
                    Pay with your card or bank transfer through Paystack.
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="px-3 py-1.5 bg-gray-900 rounded-lg">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Instant Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Shield className="h-3 w-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Verified Merchant</span>
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </div>

          {/* Wallet option */}
          {walletBalance >= finalTotal && (
            <div className={`relative group rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${paymentMethod === "wallet"
              ? 'border-gray-900 bg-white shadow-2xl scale-[1.01]'
              : 'border-gray-50 bg-gray-50/50 hover:border-gray-300 hover:bg-white'
              }`}>
            <div className="p-4 sm:p-10 flex items-start gap-3 sm:gap-6">
                <div className="pt-1">
                  <RadioGroupItem value="wallet" id="wallet" className="h-6 w-6 border-gray-200 text-orange-600" />
                </div>

                <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                      <div className={`p-4 rounded-2xl ${paymentMethod === "wallet" ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                        <span className="text-xl">💰</span>
                      </div>
                      <div>
                        <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-widest">Wallet Balance</h3>
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Pay from your wallet</span>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 tabular-nums">₦{walletBalance.toLocaleString()} AVAILABLE</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed">
                      Use your wallet balance for a faster checkout.
                    </p>
                    <div className="flex items-center gap-2 text-emerald-600 pt-2">
                      <Check className="h-4 w-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">No extra wallet fee</span>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          )}
        </RadioGroup>
      </div>
    </div>
  )
}
