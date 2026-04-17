"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, MapPin, Truck, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Address } from "../types"

interface CheckoutConfirmationProps {
  finalTotal: number
  deliveryDate: string
  deliveryTime: string
  deliverySlotDescription?: string
  paymentMethod: string
  selectedAddress: string
  addresses: Address[]
  orderId?: string
}

export function CheckoutConfirmation({
  finalTotal,
  deliveryDate,
  deliveryTime,
  deliverySlotDescription,
  paymentMethod,
  selectedAddress,
  addresses,
  orderId,
}: CheckoutConfirmationProps) {
  const router = useRouter()
  const address = addresses.find(addr => addr.id === selectedAddress)

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="bg-white/85 backdrop-blur-3xl rounded-[3rem] shadow-[0_48px_96px_-12px_rgba(0,0,0,0.15)] border border-white/70 overflow-hidden w-full transition-all duration-700">
        {/* Validation Header */}
        <div className="bg-emerald-950 p-10 sm:p-16 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-50" />
          <div className="absolute top-0 right-0 p-12 opacity-5">
            <Check className="h-64 w-64 text-white" />
          </div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl group hover:scale-110 transition-transform duration-500">
              <Check className="h-12 w-12 text-emerald-400" />
            </div>
            <h1 className="text-sm font-black text-white uppercase tracking-[0.5em] mb-4">Order Confirmed</h1>
            <p className="text-emerald-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2">
              Payment status: <span className="text-white">Successful</span>
            </p>
            {orderId && (
              <div className="inline-flex items-center px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mr-2">Order ID:</span>
                <span className="text-[11px] font-black text-white tracking-widest tabular-nums">#{orderId.slice(-8).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-10 sm:p-16">
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            {/* Order summary */}
            <div className="bg-gray-50/50 rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 flex flex-col group hover:bg-white hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-gray-900">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Order Summary</h3>
              </div>

              <div className="space-y-5 flex-1">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-sm font-black text-gray-900 tracking-tight">₦{finalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Delivery Time</span>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight leading-none">
                      {new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-1.5">{deliveryTime}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Payment Method</span>
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                    {paymentMethod === 'paystack' ? 'Paystack' : 'Wallet'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery details */}
            <div className="bg-gray-50/50 rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 flex flex-col group hover:bg-white hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-gray-900">
                  <Truck className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Delivery Details</h3>
              </div>

              <div className="space-y-5 flex-1">
                <div className="flex items-start gap-4">
                  <MapPin className="h-4 w-4 text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Delivery Address</p>
                    <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight leading-relaxed">{address?.name}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1">{address?.address}</p>
                  </div>
                </div>

                <div className="mt-6 p-5 bg-gray-900 rounded-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1.5">Order Tracking</p>
                    <p className="text-[9px] font-bold text-gray-300 leading-relaxed uppercase tracking-widest">
                      You can track your order status in your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-5">
            <Button
              onClick={() => router.push('/dashboard?tab=orders')}
              className="flex-[1.5] h-18 bg-gray-900 hover:bg-gray-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all active:scale-[0.98] py-8"
            >
              Track Order
            </Button>
            <Button
              onClick={() => router.push('/marketplace')}
              variant="outline"
              className="flex-1 h-18 border-2 border-gray-100 hover:border-gray-900 hover:bg-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] text-gray-400 hover:text-gray-900 transition-all py-8"
            >
              Return to Marketplace
            </Button>
          </div>

          <div className="mt-12 flex justify-center">
            <div className="inline-flex items-center gap-8 py-4 px-8 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Verified</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                <Shield className="h-3 w-3 text-blue-600" />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Secured</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                <Truck className="h-3 w-3 text-orange-400" />
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Expedited</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 px-8 pb-8">
          <Button
            onClick={() => router.push('/dashboard?tab=orders')}
            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold"
          >
            📊 View Orders
          </Button>
          <Button
            onClick={() => router.push('/auth/login?redirect=' + encodeURIComponent('/dashboard?tab=marketplace'))}
            variant="outline"
            className="flex-1 h-12 border-2 hover:bg-gray-50 font-semibold"
          >
            🛒 Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
