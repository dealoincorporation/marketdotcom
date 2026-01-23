"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingCart,
  CreditCard,
  Shield,
  Truck,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"
import { useRouter } from "next/navigation"
import { getEstimatedDeliveryTime } from "@/lib/helpers"

export default function CartPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [recommended, setRecommended] = useState<any[]>([])
  const [recommendedLoading, setRecommendedLoading] = useState(true)
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice
  } = useCartStore()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  const deliveryFee = totalPrice > 10000 ? 0 : 1500 // Free delivery over ₦10,000
  const finalTotal = totalPrice + deliveryFee
  const eta = getEstimatedDeliveryTime()

  // Load recommended add-ons (simple: in-stock products not already in cart).
  // We link to PDP so user can pick quantity.
  useEffect(() => {
    let cancelled = false
    async function load() {
      setRecommendedLoading(true)
      try {
        const res = await fetch("/api/products?inStock=true", { cache: "no-store" })
        const data = res.ok ? await res.json() : []
        const list = Array.isArray(data) ? data : []
        const inCart = new Set(items.map((i) => i.productId))
        const next = list.filter((p: any) => p?.id && !inCart.has(p.id)).slice(0, 4)
        if (!cancelled) setRecommended(next)
      } catch {
        if (!cancelled) setRecommended([])
      } finally {
        if (!cancelled) setRecommendedLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [items])

  const handleCheckout = () => {
    if (!user) {
      router.push(`/auth/login?redirect=/checkout`)
    } else {
      router.push('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm sm:max-w-md"
        >
          <div className="bg-white rounded-full p-4 sm:p-6 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Your cart is empty</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-2">
            Looks like you haven't added any items to your cart yet.
            Start shopping to fill it up!
          </p>
          <div className="space-y-3 sm:space-y-4">
            <Link href="/marketplace">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                <ShoppingBag className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Start Shopping
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full text-sm sm:text-base">
                <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <img
                src="/mrktdotcom-logo.png"
                alt="Marketdotcom Logo"
                className="h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 object-contain"
              />
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Cart</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/marketplace">
                <Button variant="outline" size="sm">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              {user ? (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 py-4"
            >
              <div className="flex flex-col space-y-3">
                <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
                {user ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full justify-start">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Shopping Cart
                  </h1>
                  <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </Badge>
                </div>
              </div>

              <div className="divide-y">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 sm:p-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                        <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-center sm:text-left truncate text-sm sm:text-base">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                          ₦{item.price.toLocaleString()} per {item.unit}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-center sm:justify-start space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Mobile Price & Remove Button */}
                          <div className="flex items-center justify-between sm:hidden">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-sm">
                                ₦{(item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-600">
                                ₦{item.price.toLocaleString()} each
                              </p>
                            </div>
                          </div>

                          {/* Desktop Remove Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                            className="hidden sm:flex text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Desktop Price */}
                      <div className="hidden sm:block text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₦{item.price.toLocaleString()} each
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 sm:p-6 border-t">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 border-red-200 hover:bg-red-50 w-full sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Recommended add-ons */}
            <div className="mt-6">
              <div className="flex items-end justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Recommended add-ons</h2>
                  <p className="text-sm text-gray-600">Quick picks to complete your cart.</p>
                </div>
                <Link href="/marketplace">
                  <Button variant="outline" size="sm">
                    Browse more
                  </Button>
                </Link>
              </div>

              {recommendedLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-36 rounded-xl bg-white border border-gray-200 animate-pulse" />
                  ))}
                </div>
              ) : recommended.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                  No recommendations right now.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {recommended.map((p: any) => {
                    const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : "/api/placeholder/300/200"
                    const price = typeof p.basePrice === "number" ? `₦${p.basePrice.toLocaleString()}` : ""
                    return (
                      <Link key={p.id} href={`/marketplace/${p.id}`} className="block">
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-20 bg-gray-100">
                            <img src={img} alt={p.name || "Product"} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-2">
                            <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                            <p className="text-xs text-orange-600 font-bold mt-1">{price}</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 lg:top-8 bg-gradient-to-br from-orange-50 to-white border-orange-200 shadow-lg">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="flex justify-between text-sm sm:text-base bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <span className="text-gray-700">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-orange-700">₦{totalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm sm:text-base bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-700">Delivery Fee</span>
                  <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : "text-orange-700"}`}>
                    {deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}
                  </span>
                </div>

                {deliveryFee === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-700 font-medium">
                      🎉 Free delivery on orders over ₦10,000
                    </p>
                  </div>
                )}

                <div className="relative">
                  <Separator className="bg-orange-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white px-4">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-base sm:text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
                  <span>Total</span>
                  <span>₦{finalTotal.toLocaleString()}</span>
                </div>

                <div className="space-y-3 pt-3 sm:pt-4">
                  {!user && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-blue-800">
                        <strong>Please sign in to checkout</strong><br />
                        You'll need to create an account or sign in to complete your order.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                    size="lg"
                  >
                    <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
                  </Button>

                  {!user && (
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Don't have an account?</p>
                      <Link href={`/auth/register?redirect=/checkout`}>
                        <Button variant="outline" size="sm" className="w-full text-sm">
                          Create Account & Checkout
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Delivery Info */}
                <div className="pt-3 sm:pt-4 border-t border-orange-200">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-orange-700 mb-3 bg-orange-50 p-2 rounded-lg">
                    <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    <span className="font-medium">Delivery Information</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1 bg-white p-3 rounded-lg border border-orange-100">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span>Estimated delivery time: {eta}</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span>Orders delivered within 4 hours</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span>Place orders by 10 AM for same-day delivery</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span>Orders after 3 PM delivered next day</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <span className="text-green-700 font-medium">Free delivery on orders over ₦10,000</span>
                    </li>
                  </ul>
                </div>

                {/* Security */}
                <div className="pt-3 sm:pt-4 border-t border-orange-200">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-orange-700 bg-gradient-to-r from-orange-50 to-white p-2 rounded-lg">
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                    <span className="font-medium">Secure Checkout</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-orange-100 mt-2">
                    <p className="text-xs text-gray-600">
                      🔒 Your payment information is encrypted and secure with bank-level security.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
