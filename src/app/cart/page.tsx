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
  X,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"
import { useRouter } from "next/navigation"
import { getEstimatedDeliveryTime } from "@/lib/helpers/index"
import { normalizeImageUrls, normalizeImageUrl } from "@/lib/image-utils"

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
    getTotalPrice,
    adminDeliveryFeeOverride,
    setAdminDeliveryFeeOverride,
  } = useCartStore()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()
  const [deliverySettings, setDeliverySettings] = useState<{
    baseFee: number
    feePerKg: number
    minimumOrderQuantity: number
    minimumOrderAmount: number
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/delivery-settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data)
          setDeliverySettings({
            baseFee: data.baseFee ?? 500,
            feePerKg: data.feePerKg ?? 50,
            minimumOrderQuantity: data.minimumOrderQuantity ?? 1,
            minimumOrderAmount: data.minimumOrderAmount ?? 0,
          })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const baseFee = deliverySettings?.baseFee ?? 500
  const feePerKg = deliverySettings?.feePerKg ?? 50
  const minimumOrderQuantity = deliverySettings?.minimumOrderQuantity ?? 1
  const minimumOrderAmount = deliverySettings?.minimumOrderAmount ?? 0
  const totalWeight = items.reduce((s, i) => s + (i.weight ?? 0) * i.quantity, 0)
  const calculatedDeliveryFee =
    items.length === 0
      ? 0
      : baseFee +
        items.reduce((total, item) => {
          if (item.deliveryFee === 0) return total
          if (typeof item.deliveryFee === "number") return total + item.deliveryFee * item.quantity
          return total + feePerKg * (item.weight ?? 0) * item.quantity
        }, 0)
  const isAdmin = user?.role === "ADMIN"
  const deliveryFee = isAdmin && adminDeliveryFeeOverride != null ? adminDeliveryFeeOverride : calculatedDeliveryFee
  const finalTotal = totalPrice + deliveryFee
  const moqQuantityNotMet = totalItems < minimumOrderQuantity
  const moqAmountNotMet = minimumOrderAmount > 0 && totalPrice < minimumOrderAmount
  const moqNotMet = moqQuantityNotMet || moqAmountNotMet
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
            <Link href="/dashboard">
              <Button variant="outline" className="w-full text-sm sm:text-base">
                <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Back to Dashboard
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
      <header className="sticky top-0 z-[100] bg-white shadow-sm border-b backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <Link 
                href="/dashboard" 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                aria-label="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </Link>
              <Link href="/" className="flex items-center">
                <img
                  src="/mrktdotcom-logo.png"
                  alt="Marketdotcom Logo"
                  className="h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52 lg:h-56 lg:w-56 object-contain"
                />
              </Link>
            </div>

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
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0 overflow-hidden bg-gray-100">
                        <img
                          src={item.image || "/market_image.jpeg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-center sm:text-left truncate text-sm sm:text-base">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
                          <Tag className="h-4 w-4 flex-shrink-0 text-orange-500" aria-hidden />
                          ₦{item.price.toLocaleString()} per {item.variation?.name?.trim() || item.unit}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-center sm:justify-start gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8 p-0 shrink-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <input
                              type="number"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              min={1}
                              max={item.maxQuantity ?? 999}
                              value={item.quantity}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "")
                                if (raw === "") return
                                const val = parseInt(raw, 10)
                                if (!Number.isNaN(val)) updateQuantity(item.id, Math.min(Math.max(1, val), item.maxQuantity ?? 999))
                              }}
                              onBlur={(e) => {
                                const raw = e.target.value.replace(/\D/g, "")
                                if (raw === "" || parseInt(raw, 10) < 1) {
                                  updateQuantity(item.id, 1)
                                  return
                                }
                                const val = parseInt(raw, 10)
                                if (!Number.isNaN(val)) updateQuantity(item.id, Math.min(Math.max(1, val), item.maxQuantity ?? 999))
                              }}
                              className="w-12 h-8 text-center text-sm font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              aria-label={`Quantity for ${item.name}`}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, item.maxQuantity ?? 999))}
                              disabled={item.quantity >= (item.maxQuantity ?? 999)}
                              className="h-8 w-8 p-0 shrink-0"
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
                            <p className="font-semibold text-gray-900 text-sm">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </p>
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 sm:p-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
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
                    // Use normalizeImageUrls to properly handle product images
                    const normalizedImages = normalizeImageUrls(p.images, p.image)
                    // Only use default image if there are NO product images at all
                    const img = normalizedImages.length > 0 
                      ? normalizedImages[0] 
                      : normalizeImageUrl(p.image) || "/market_image.jpeg"
                    const price = typeof p.basePrice === "number" ? `₦${p.basePrice.toLocaleString()}` : ""
                    return (
                      <Link key={p.id} href="/marketplace" className="block">
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-20 bg-gray-100 relative overflow-hidden">
                            <img 
                              src={img} 
                              alt={p.name || "Product"} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to default image only if image fails to load
                                if (e.currentTarget.src !== "/market_image.jpeg") {
                                  e.currentTarget.src = "/market_image.jpeg"
                                }
                              }}
                            />
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

                <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-center text-sm sm:text-base bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-gray-700">Delivery Fee</span>
                  {isAdmin ? (
                    <div className="flex flex-col gap-1 sm:gap-0 sm:flex-row sm:items-center sm:gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-xs sm:text-sm">₦</span>
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={100}
                          value={deliveryFee}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "")
                            if (v === "") {
                              setAdminDeliveryFeeOverride(null)
                              return
                            }
                            const n = parseInt(v, 10)
                            if (!Number.isNaN(n) && n >= 0) setAdminDeliveryFeeOverride(n)
                          }}
                          onBlur={(e) => {
                            const v = e.target.value.replace(/\D/g, "")
                            if (v === "") setAdminDeliveryFeeOverride(null)
                          }}
                          className="w-24 h-8 text-sm font-medium border-orange-200 focus:ring-orange-500"
                          aria-label="Admin: override delivery fee"
                        />
                      </div>
                      {adminDeliveryFeeOverride != null && (
                        <button
                          type="button"
                          onClick={() => setAdminDeliveryFeeOverride(null)}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium underline"
                        >
                          Reset to calculated
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : "text-orange-700"}`}>
                      {deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}
                    </span>
                  )}
                </div>
                {moqNotMet && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                    {moqQuantityNotMet && (
                      <p className="text-xs text-amber-800 font-medium">
                        Minimum order: {minimumOrderQuantity} item{minimumOrderQuantity !== 1 ? "s" : ""} required. Add {minimumOrderQuantity - totalItems} more to checkout.
                      </p>
                    )}
                    {moqAmountNotMet && (
                      <p className="text-xs text-amber-800 font-medium">
                        Minimum order amount: ₦{minimumOrderAmount.toLocaleString()}. Add ₦{(minimumOrderAmount - totalPrice).toLocaleString()} more to checkout.
                      </p>
                    )}
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-medium">
                    Delivery fees based on order weight and admin settings
                    {isAdmin && adminDeliveryFeeOverride != null && (
                      <span className="ml-1 text-orange-700">· Admin override active</span>
                    )}
                  </p>
                </div>

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
                    disabled={moqNotMet}
                    title={
                      moqNotMet
                        ? moqQuantityNotMet && moqAmountNotMet
                          ? `Minimum: ${minimumOrderQuantity} items and ₦${minimumOrderAmount.toLocaleString()}`
                          : moqQuantityNotMet
                            ? `Minimum: ${minimumOrderQuantity} items required`
                            : `Minimum order amount: ₦${minimumOrderAmount.toLocaleString()}`
                        : undefined
                    }
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 disabled:opacity-70 disabled:pointer-events-none"
                    size="lg"
                  >
                    <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {user
                      ? moqNotMet
                        ? moqQuantityNotMet && moqAmountNotMet
                          ? `Add items & ₦${(minimumOrderAmount - totalPrice).toLocaleString()} more (min ${minimumOrderQuantity} items, ₦${minimumOrderAmount.toLocaleString()})`
                          : moqQuantityNotMet
                            ? `Add ${minimumOrderQuantity - totalItems} more to checkout (min ${minimumOrderQuantity})`
                            : `Add ₦${(minimumOrderAmount - totalPrice).toLocaleString()} more (min ₦${minimumOrderAmount.toLocaleString()})`
                        : "Proceed to Checkout"
                      : "Sign In to Checkout"}
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
                      <span>Orders delivered within 4 hours of scheduled time</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span>Place orders by 10 AM for same-day delivery</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span>Orders after 3 PM delivered next day</span>
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
