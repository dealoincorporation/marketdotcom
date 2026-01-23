"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Minus, Package, Plus, ShoppingCart } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface MarketplaceProduct {
  id: string
  name: string
  groupName?: string | null
  description: string
  basePrice: number
  categoryId: string
  category: { id: string; name: string }
  stock: number
  unit: string
  inStock: boolean
  images: string[]
  variations: Array<{
    id: string
    name: string
    price: number
    stock: number
    unit?: string
    quantity?: number
    image?: string
  }>
}

type VariationOption =
  | { kind: "base"; id: "base"; label: string; price: number }
  | { kind: "variation"; id: string; label: string; price: number; image?: string }

function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`
}

function buildVariationOptions(product: MarketplaceProduct): VariationOption[] {
  const options: VariationOption[] = []

  if (product.stock > 0) {
    options.push({
      kind: "base",
      id: "base",
      label: `Standard`,
      price: product.basePrice,
    })
  }

  for (const v of product.variations.filter((vv) => vv.stock > 0)) {
    const label = v.quantity && v.unit ? `${v.quantity}${v.unit} ${v.name}` : v.name

    options.push({
      kind: "variation",
      id: v.id,
      label,
      price: v.price,
      image: v.image,
    })
  }

  return options
}

function resolveSelectedOption(product: MarketplaceProduct, selectedId: string | undefined) {
  const options = buildVariationOptions(product)
  const selected = options.find((o) => o.id === selectedId)
  return { options, selected }
}

export function MarketplaceProductCard(props: {
  product: MarketplaceProduct
  selectedVariationId?: string
  onVariationChange?: (variationId: string) => void
  onAddToCart?: (variationId?: string) => void
}) {
  const { product } = props
  const [imageIndex, setImageIndex] = React.useState(0)

  const { options } = React.useMemo(
    () => resolveSelectedOption(product, props.selectedVariationId),
    [product, props.selectedVariationId]
  )

  const hasVariations = product.variations.length > 0
  const inStockVariations = product.variations.filter((v) => v.stock > 0)
  const hasVariationChoices = inStockVariations.length > 0
  const isActuallyInStock = product.stock > 0 || hasVariationChoices

  const normalizedImages = React.useMemo(() => {
    const images = Array.isArray(product.images) ? product.images : []
    const cleaned = images
      .filter((v) => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean)
    return Array.from(new Set(cleaned)).slice(0, 10)
  }, [product.images])

  const currentImage = normalizedImages?.[imageIndex]

  const priceLabel = React.useMemo(() => {
    const prices = options.map((o) => o.price).filter((p) => typeof p === "number" && !Number.isNaN(p))
    if (prices.length === 0) return formatPrice(product.basePrice)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`
  }, [options, product.basePrice])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
      <Link 
        href={`/marketplace/${product.id}`} 
        className="block w-full h-full"
        onClick={(e) => {
          // Ensure link works on all devices, including mobile
          e.stopPropagation()
        }}
      >
        <Card className="h-full hover:shadow-lg active:shadow-md transition-all duration-200 cursor-pointer touch-manipulation select-none">
          <div className="relative h-36 sm:h-44 lg:h-52 bg-gray-100 overflow-hidden rounded-t-lg">
            <img 
              src={currentImage || "/market_image.jpeg"} 
              alt={product.name} 
              className="w-full h-full object-cover pointer-events-none" 
            />

            {/* Image navigation - hidden on mobile, visible on desktop */}
            {normalizedImages?.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setImageIndex((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1))
                  }}
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-80 transition-all duration-200 z-10 pointer-events-auto"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setImageIndex((prev) => (prev + 1) % normalizedImages.length)
                  }}
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-80 transition-all duration-200 z-10 pointer-events-auto"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Image indicators - show on all devices but don't block clicks */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10 pointer-events-none">
                  {normalizedImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${idx === imageIndex ? "bg-white" : "bg-white/60"}`}
                      aria-label={`Image ${idx + 1} of ${normalizedImages.length}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight truncate">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{product.description}</p>
              </div>
              <Badge variant={isActuallyInStock ? "default" : "secondary"} className="shrink-0 text-xs">
                {isActuallyInStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-orange-600">
                  {priceLabel}
                </span>
                {priceLabel.includes(' - ') && (
                  <span className="text-xs text-gray-500 mt-1">Price range</span>
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 text-right">
                <div>
                  <span className="font-medium">Category:</span> {product.category.name}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">Tap to view details & add to cart</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

