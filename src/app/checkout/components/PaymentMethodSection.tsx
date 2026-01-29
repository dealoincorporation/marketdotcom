"use client"

import { useEffect } from "react"
import { CreditCard, Shield, Check, X } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          💳 Choose Payment Method
        </h2>
        <p className="text-orange-100 mt-1">Select how you'd like to pay for your order</p>
      </div>
      <div className="p-6">
        <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-3 sm:space-y-4">
          {/* Pay with Card/Bank Transfer (Paystack) - Merged */}
          <div className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
            paymentMethod === "paystack"
              ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
              : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
          }`}>
            <div className="flex items-start space-x-3 sm:space-x-4">
              <RadioGroupItem value="paystack" id="paystack" className="text-orange-600 mt-1" />
              <Label htmlFor="paystack" className="flex-1 cursor-pointer min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex-shrink-0">
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg sm:text-xl text-gray-900 mb-1">Pay with Card/Bank Transfer</div>
                    <div className="text-sm text-gray-600 mb-2">Paystack - Secure payment via card, bank transfer, or USSD</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-6 h-4 sm:w-8 sm:h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                        <div className="w-6 h-4 sm:w-8 sm:h-5 bg-gradient-to-r from-red-600 to-red-700 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                        <div className="w-6 h-4 sm:w-8 sm:h-5 bg-gradient-to-r from-purple-600 to-purple-700 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                      </div>
                      <span className="text-xs text-gray-500">• Bank Transfer • USSD</span>
                    </div>
                  </div>
                </div>
              </Label>
              <div className="text-green-600 flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            {paymentMethod === "paystack" && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            )}
          </div>

          {/* Wallet Balance */}
          <div className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 ${
            walletBalance <= 0
              ? 'border-gray-200 bg-gray-50 opacity-50 blur-[2px] pointer-events-none cursor-not-allowed select-none'
              : paymentMethod === "wallet"
                ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg cursor-pointer'
                : 'border-gray-200 hover:border-green-300 hover:shadow-md cursor-pointer'
          }`}>
            <div className="flex items-start space-x-3 sm:space-x-4">
              <RadioGroupItem value="wallet" id="wallet" className="text-green-600 mt-1" disabled={walletBalance <= 0} />
              <Label htmlFor="wallet" className={`flex-1 min-w-0 ${walletBalance <= 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="p-3 sm:p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex-shrink-0">
                    <span className="text-2xl sm:text-3xl">💰</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg sm:text-xl text-gray-900 mb-1">Pay with Wallet</div>
                    <div className="text-sm text-gray-600 mb-2">Instant payment from your wallet balance</div>
                    <div className="text-base sm:text-lg font-bold text-green-600">
                      ₦{walletBalance.toLocaleString()} available
                    </div>
                  </div>
                </div>
              </Label>
              <div className="flex-shrink-0">
                {walletBalance >= finalTotal ? (
                  <div className="text-green-600">
                    <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                )}
              </div>
            </div>
            {paymentMethod === "wallet" && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            )}
          </div>
        </RadioGroup>

        {/* Wallet Deduction Option */}
        {paymentMethod === "paystack" && walletBalance > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                id="useWallet"
                checked={useWallet}
                onChange={(e) => onUseWalletChange(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-2"
              />
              <Label htmlFor="useWallet" className="flex-1 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <div className="font-semibold text-green-900 text-lg">💡 Use Wallet Balance</div>
                    <div className="text-sm text-green-700 mt-1">
                      Save ₦{Math.min(walletBalance, finalTotal).toLocaleString()} from your wallet balance
                    </div>
                  </div>
                </div>
              </Label>
              {useWallet && (
                <div className="text-green-600">
                  <Check className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
