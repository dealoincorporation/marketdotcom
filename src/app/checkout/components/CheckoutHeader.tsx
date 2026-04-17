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
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-3xl border-b border-white/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="flex items-center justify-between h-24">
          <Link href="/dashboard?tab=marketplace" className="group flex items-center space-x-3 px-5 py-2.5 rounded-2xl hover:bg-white transition-all duration-300 active:scale-95">
            <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-orange-600 transition-colors">Back to Marketplace</span>
          </Link>

          <div className="flex flex-col items-center">
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-[0.4em] mb-4">Secure Checkout</h1>

            <div className="flex items-center gap-6">
              {[
                { n: 1, label: "Delivery" },
                { n: 2, label: "Payment" },
                { n: 3, label: "Confirmation" }
              ].map((s, i) => (
                <React.Fragment key={s.n}>
                  <div className={`flex items-center gap-3 transition-all duration-500 ${step >= s.n ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg transition-all duration-500 ${step >= s.n ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      0{s.n}
                    </div>
                    <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest hidden sm:block">{s.label}</span>
                  </div>
                  {i < 2 && (
                    <div className={`w-8 h-[2px] rounded-full transition-all duration-700 ${step > s.n ? 'bg-orange-500' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-3 py-1 bg-gray-50 rounded-lg">
              <span className="text-[10px] font-black text-gray-900 tabular-nums">{totalItems} ITEMS</span>
            </div>
            <div className="px-3 py-1 bg-gray-900 rounded-lg">
              <span className="text-[10px] font-black text-white tabular-nums">₦{subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
