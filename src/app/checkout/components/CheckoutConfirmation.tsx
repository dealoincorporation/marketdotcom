"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, MapPin, Truck } from "lucide-react"
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">🎉 Order Confirmed!</h1>
          <p className="text-green-100 text-lg">
            Your payment has been confirmed and your order is being processed.
            {orderId && <span className="block mt-2 font-semibold">Order ID: #{orderId.slice(-8)}</span>}
          </p>
          <p className="text-green-50 text-sm mt-3">
            📧 Check your email for order confirmation and tracking updates
          </p>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Order Details */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-xl text-blue-900 mb-4 flex items-center">
                📋 Order Confirmed
              </h3>
              <div className="space-y-3">
                {orderId && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-blue-700 font-medium">Order ID:</span>
                    <span className="text-blue-900 font-mono font-semibold">#{orderId.slice(-8)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-blue-700 font-medium">Order Total:</span>
                  <span className="text-blue-900 font-bold text-lg">₦{finalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-blue-700 font-medium">Delivery Date:</span>
                  <span className="text-blue-900">{new Date(deliveryDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-blue-700 font-medium">Delivery Time:</span>
                  <span className="text-blue-900">{deliveryTime}</span>
                </div>
                {deliverySlotDescription && (
                  <div className="py-2 border-b border-blue-200">
                    <span className="text-blue-700 font-medium block mb-1">Delivery note:</span>
                    <span className="text-blue-900 text-sm">{deliverySlotDescription}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-blue-700 font-medium">Payment Method:</span>
                  <span className="text-blue-900 font-medium">
                    {paymentMethod === 'paystack' ? 'Card/Bank Transfer' :
                     paymentMethod === 'wallet' ? 'Wallet Balance' : 'Card/Bank Transfer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h3 className="font-bold text-xl text-purple-900 mb-4 flex items-center">
                🚚 Delivery Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-purple-900 font-medium">Delivery Address</p>
                    <p className="text-purple-700 text-sm">{address?.name}</p>
                    <p className="text-purple-700 text-sm">{address?.address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Truck className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-purple-900 font-medium">Estimated Delivery</p>
                    <p className="text-purple-700 text-sm">Within 4 hours of scheduled time</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-300">
                  <p className="text-purple-900 text-sm font-medium mb-1">📦 Track Your Order</p>
                  <p className="text-purple-700 text-xs">
                    You'll receive real-time updates via email and notifications when your order status changes. 
                    Visit your dashboard to see the delivery timeline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard?tab=orders" className="flex-1">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                📦 Track My Order
              </Button>
            </Link>
            <Link href="/marketplace" className="flex-1">
              <Button variant="outline" className="w-full h-12 border-2 hover:bg-gray-50 font-semibold">
                🛒 Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Order Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-blue-600" />
                <span>Payment Processed</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-purple-600" />
                <span>Delivery Scheduled</span>
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
            onClick={() => router.push('/marketplace')}
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
