"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ShoppingCart, X, ChevronRight, Minus, Plus, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"
import { formatCurrency } from "@/lib/helpers"

type Product = {
  id: string
  name: string
  description: string
  basePrice: number
  unit: string
  stock: number
  inStock: boolean
  images: string[]
  category?: { name?: string }
  variations: Array<{
    id: string
    name: string
    price: number
    stock: number
    unit?: string | null
    quantity?: number | null
    image?: string | null
  }>
}

type Option =
  | { kind: "base"; id: "base"; label: string; price: number; image?: string }
  | { kind: "variation"; id: string; label: string; price: number; image?: string }

function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`
}

function normalizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return []
  const cleaned = images
    .filter((v) => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
  return Array.from(new Set(cleaned)).slice(0, 10)
}

function buildOptions(p: Product): Option[] {
  const options: Option[] = []
  if ((p.stock || 0) > 0) {
    options.push({ kind: "base", id: "base", label: "Standard", price: p.basePrice, image: p.images?.[0] })
  }
  for (const v of (p.variations || []).filter((vv) => (vv.stock || 0) > 0)) {
    const label = v.quantity && v.unit ? `${v.quantity}${v.unit} ${v.name}` : v.name
    options.push({
      kind: "variation",
      id: v.id,
      label,
      price: v.price,
      image: v.image || undefined,
    })
  }
  return options
}

function computeRangeLabel(p: Product) {
  const options = buildOptions(p)
  const prices = options.map((o) => o.price)
  if (prices.length === 0) return formatPrice(p.basePrice)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`
}

export default function MarketplaceProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { addItem, items, getTotalItems, removeItem, updateQuantity } = useCartStore()

  const [product, setProduct] = React.useState<Product | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [heroIndex, setHeroIndex] = React.useState(0)
  const [isCartOpen, setIsCartOpen] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/products/${productId}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load product")
        const data = (await res.json()) as Product
        if (cancelled) return
        data.images = normalizeImages(data.images)
        setProduct(data)
        setHeroIndex(0)
      } catch {
        if (!cancelled) setProduct(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [productId])

  const options = React.useMemo(() => (product ? buildOptions(product) : []), [product])
  const selectedOptions = React.useMemo(() => 
    options.filter((o) => selectedIds.has(o.id)), 
    [options, selectedIds]
  )
  const canAdd = selectedIds.size > 0 && Boolean(product)

  const toggleSelection = (optionId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(optionId)) {
        newSet.delete(optionId)
      } else {
        newSet.add(optionId)
      }
      return newSet
    })
  }

  const handleAdd = async () => {
    if (!product) return
    if (selectedIds.size === 0) return

    let addedCount = 0
    for (const optionId of selectedIds) {
      const variation = optionId !== "base" ? product.variations.find((v) => v.id === optionId) : undefined

      const success = await addItem({
        productId: product.id,
        variationId: variation?.id,
        name: variation
          ? `${product.name} - ${variation.quantity ?? ""}${variation.unit ?? ""} ${variation.name}`.replace(/\s+/g, " ").trim()
          : product.name,
        price: variation?.price || product.basePrice,
        image: (variation?.image || product.images?.[0] || "/market_image.jpeg") as string,
        quantity: 1,
        unit: (variation?.unit || product.unit) as string,
        variation: variation
          ? {
              id: variation.id,
              name: variation.name,
              type: "Quantity",
              price: variation.price,
              stock: variation.stock,
            }
          : undefined,
        maxQuantity: variation ? variation.stock : product.stock,
        categoryId: (product as any).categoryId,
        categoryName: product.category?.name,
      })
      
      if (success) addedCount++
    }
    
    if (addedCount > 0) {
      setIsCartOpen(true)
      setSelectedIds(new Set()) // Clear selections after adding
      // Auto-close after 5 seconds
      setTimeout(() => setIsCartOpen(false), 5000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-10 w-28 bg-white border border-gray-200 rounded-lg animate-pulse" />
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-2xl bg-white border border-gray-200 animate-pulse" />
            <div className="h-80 rounded-2xl bg-white border border-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <p className="font-semibold text-gray-900">Product not found</p>
            <p className="text-sm text-gray-600 mt-2">This product may have been removed.</p>
            <div className="mt-5">
              <Link href="/marketplace">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">Back to marketplace</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hero = product.images?.[heroIndex] || "/market_image.jpeg"
  const inStock = (product.stock || 0) > 0 || (product.variations || []).some((v) => (v.stock || 0) > 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => router.back()} className="border-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Link href="/marketplace">
            <Button variant="ghost">Marketplace</Button>
          </Link>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="h-80 bg-gray-100">
                <img src={hero} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {product.images?.length > 1 ? (
                <div className="p-3 grid grid-cols-5 gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={img + i}
                      type="button"
                      onClick={() => setHeroIndex(i)}
                      className={`h-14 rounded-lg overflow-hidden border ${i === heroIndex ? "border-orange-500" : "border-gray-200"}`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={img || "/market_image.jpeg"} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                </div>
                <Badge variant={inStock ? "default" : "secondary"}>{inStock ? "Available" : "Unavailable"}</Badge>
              </div>

              <div className="mt-5">
                <p className="text-2xl font-black text-orange-600">
                  {selectedOptions.length === 1 
                    ? formatPrice(selectedOptions[0].price)
                    : selectedOptions.length > 1
                    ? `${selectedOptions.length} selected`
                    : computeRangeLabel(product)}
                </p>
                {product.category?.name ? <p className="text-sm text-gray-500 mt-1">{product.category.name}</p> : null}
              </div>

              <Separator className="my-5" />

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Select Quantities (You can select multiple)</label>
                {options.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No options available</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {options.map((opt) => {
                      const isSelected = selectedIds.has(opt.id)
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggleSelection(opt.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "border-orange-500 bg-orange-500"
                                : "border-gray-300"
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <span className="font-medium text-gray-900">{opt.label}</span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-orange-600 ml-3 flex-shrink-0">
                            {formatPrice(opt.price)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {selectedIds.size > 0 && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      {selectedIds.size} {selectedIds.size === 1 ? "item" : "items"} selected
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky add-to-cart */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
            <p className="text-xs text-gray-600">
              {selectedOptions.length === 1 
                ? formatPrice(selectedOptions[0].price)
                : selectedOptions.length > 1
                ? `${selectedOptions.length} items selected`
                : computeRangeLabel(product)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Cart Icon with Badge */}
            <div className="relative">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="View cart"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* Cart Dropdown */}
              {isCartOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCartOpen(false)}
                  />
                  <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[80vh] bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden flex flex-col">
                    {/* Cart Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <h3 className="font-bold text-sm flex items-center">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Your Cart ({getTotalItems()})
                      </h3>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        aria-label="Close cart"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-2">
                      {items.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Your cart is empty</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {items.slice().reverse().slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                              <img
                                src={item.image || "/market_image.jpeg"}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-600">
                                  {formatCurrency(item.price)} × {item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3 w-3 text-gray-600" />
                                </button>
                                <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3 w-3 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {items.length > 5 && (
                            <p className="text-xs text-gray-500 text-center py-2">
                              +{items.length - 5} more items
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cart Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Total</span>
                          <span className="text-lg font-bold text-orange-600">
                            {formatCurrency(items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                          </span>
                        </div>
                        <Link href="/cart" onClick={() => setIsCartOpen(false)}>
                          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                            View Full Cart
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <Button onClick={handleAdd} disabled={!canAdd} className="bg-orange-600 hover:bg-orange-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {canAdd 
                ? selectedIds.size > 1 
                  ? `Add ${selectedIds.size} items to cart`
                  : "Add to cart"
                : "Select quantity"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

