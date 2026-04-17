"use client"

import React from "react"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface CheckoutHeaderProps {
  step: number
  totalItems: number
  subtotal: number
}

export function CheckoutHeader({ step, totalItems, subtotal }: CheckoutHeaderProps) {
  return (
    <header className="checkout-header sticky top-0 z-50 bg-white/85 backdrop-blur-3xl border-b border-white/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-24 gap-2 sm:gap-4">
          <Link href="/dashboard?tab=marketplace" className="group flex items-center space-x-2 sm:space-x-3 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl hover:bg-white transition-all duration-300 active:scale-95 min-w-0">
            <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
            <span className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-wide sm:tracking-widest group-hover:text-orange-600 transition-colors truncate">Back</span>
          </Link>

          <div className="flex flex-col items-center min-w-0 flex-1">
            <h1 className="text-[10px] sm:text-sm font-black text-gray-900 uppercase tracking-[0.18em] sm:tracking-[0.4em] mb-2 sm:mb-4 text-center truncate">Secure Checkout</h1>

            <div className="flex items-center gap-2 sm:gap-6">
              {[
                { n: 1, label: "Delivery" },
                { n: 2, label: "Payment" },
                { n: 3, label: "Confirmation" }
              ].map((s, i) => (
                <React.Fragment key={s.n}>
                  <div className={`flex items-center gap-1.5 sm:gap-3 transition-all duration-500 ${step >= s.n ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center text-[9px] sm:text-[10px] font-black shadow-lg transition-all duration-500 ${step >= s.n ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      0{s.n}
                    </div>
                    <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest hidden md:block">{s.label}</span>
                  </div>
                  {i < 2 && (
                    <div className={`w-4 sm:w-8 h-[2px] rounded-full transition-all duration-700 ${step > s.n ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 bg-white p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm shrink-0">
            <div className="px-2 sm:px-3 py-1 bg-gray-50 rounded-lg">
              <span className="text-[9px] sm:text-[10px] font-black text-gray-900 tabular-nums">{totalItems} ITEMS</span>
            </div>
            <div className="px-2 sm:px-3 py-1 bg-gray-900 rounded-lg">
              <span className="text-[9px] sm:text-[10px] font-black text-white tabular-nums">₦{subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
