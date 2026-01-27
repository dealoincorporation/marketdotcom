"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface CheckoutHeaderProps {
  step: number
  totalItems: number
  subtotal: number
}

export function CheckoutHeader({ step, totalItems, subtotal }: CheckoutHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile Layout */}
        <div className="md:hidden py-4 space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="group flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
              <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">Back to Cart</span>
            </Link>
            <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
              <div className="text-xs font-semibold text-gray-800">
                {totalItems} items
              </div>
              <div className="w-px h-3 bg-orange-200"></div>
              <div className="text-xs font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ₦{subtotal.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Secure Checkout</h1>
            <div className="flex items-center justify-center space-x-4 mt-3">
              <div className={`flex flex-col items-center space-y-1 transition-all duration-300 ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 ${
                  step >= 1 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                }`}>
                  1
                </div>
                <span className="text-xs font-medium">Delivery</span>
              </div>
              <div className={`w-6 h-0.5 transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gray-300'}`}></div>
              <div className={`flex flex-col items-center space-y-1 transition-all duration-300 ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 ${
                  step >= 2 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                }`}>
                  2
                </div>
                <span className="text-xs font-medium">Payment</span>
              </div>
              <div className={`w-6 h-0.5 transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gray-300'}`}></div>
              <div className={`flex flex-col items-center space-y-1 transition-all duration-300 ${step >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 ${
                  step >= 3 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                }`}>
                  3
                </div>
                <span className="text-xs font-medium">Confirm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between h-20">
          <Link href="/cart" className="group flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
            <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
            <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">Back to Cart</span>
          </Link>

          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Secure Checkout</h1>
            <div className="flex items-center justify-center space-x-8 mt-3">
              <div className={`flex flex-col items-center space-y-2 transition-all duration-300 ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                  step >= 1 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                }`}>
                  1
                </div>
                <span className="text-xs font-medium">Delivery</span>
              </div>
              <div className={`w-8 h-0.5 transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gray-300'}`}></div>
              <div className={`flex flex-col items-center space-y-2 transition-all duration-300 ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                  step >= 2 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                }`}>
                  2
                </div>
                <span className="text-xs font-medium">Payment</span>
              </div>
              <div className={`w-8 h-0.5 transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gray-300'}`}></div>
              <div className={`flex flex-col items-center space-y-2 transition-all duration-300 ${step >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                  step >= 3 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                }`}>
                  3
                </div>
                <span className="text-xs font-medium">Confirm</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
            <div className="text-sm font-semibold text-gray-800">
              {totalItems} items
            </div>
            <div className="w-px h-4 bg-orange-200"></div>
            <div className="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              ₦{subtotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
