"use client"

import * as React from "react"
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
  | { kind: "base"; id: "base"; label: string; price: number; stockLabel: string; perLabel: string }
  | { kind: "variation"; id: string; label: string; price: number; stockLabel: string; perLabel: string; image?: string }

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
      stockLabel: `${product.stock} left`,
      perLabel: product.unit,
    })
  }

  for (const v of product.variations.filter((vv) => vv.stock > 0)) {
    const perLabel = v.unit || product.unit
    const label = v.quantity && v.unit ? `${v.quantity}${v.unit} ${v.name}` : v.name

    options.push({
      kind: "variation",
      id: v.id,
      label,
      price: v.price,
      stockLabel: `${v.stock} left`,
      perLabel,
      image: v.image,
    })
  }

  return options
}

function resolveSelectedOption(product: MarketplaceProduct, selectedId: string | undefined) {
  const options = buildVariationOptions(product)
  const selected = options.find((o) => o.id === selectedId) || options[0]
  return { options, selected }
}

export function MarketplaceProductCard(props: {
  product: MarketplaceProduct
  selectedVariationId?: string
  onVariationChange: (variationId: string) => void
  quantity: number
  onQuantityChange: (next: number) => void
  onAddToCart: (variationId?: string) => void
}) {
  const { product, selectedVariationId, onVariationChange, quantity, onQuantityChange, onAddToCart } = props
  const [imageIndex, setImageIndex] = React.useState(0)

  const { options, selected } = React.useMemo(
    () => resolveSelectedOption(product, selectedVariationId),
    [product, selectedVariationId]
  )

  const hasVariations = product.variations.length > 0
  const inStockVariations = product.variations.filter((v) => v.stock > 0)
  const hasVariationChoices = inStockVariations.length > 0
  const isActuallyInStock = product.stock > 0 || hasVariationChoices

  const displayQuantity = Math.max(1, quantity || 1)

  const effectiveVariationId = selectedVariationId ?? (product.stock > 0 ? "base" : undefined)
  const requiresSelection = hasVariations && product.stock <= 0 && hasVariationChoices
  const hasSelection = Boolean(effectiveVariationId)

  const canAddToCart =
    isActuallyInStock &&
    displayQuantity > 0 &&
    (!requiresSelection || Boolean(effectiveVariationId)) &&
    (effectiveVariationId === "base"
      ? product.stock > 0
      : effectiveVariationId
        ? product.variations.find((v) => v.id === effectiveVariationId)?.stock !== 0
        : false)

  const currentImage = product.images?.[imageIndex]

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-36 sm:h-44 lg:h-52 bg-gray-100 overflow-hidden rounded-t-lg">
          {currentImage ? (
            <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
              <Package className="h-12 w-12 sm:h-16 sm:w-16 text-orange-400" />
            </div>
          )}

          {product.images?.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-80 transition-all duration-200"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setImageIndex((prev) => (prev + 1) % product.images.length)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-80 transition-all duration-200"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {product.images.map((_, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setImageIndex(idx)
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${idx === imageIndex ? "bg-white" : "bg-white/60 hover:bg-white/80"}`}
                    aria-label={`View image ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight truncate">{product.name}</h3>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{product.description}</p>
            </div>
            <Badge variant={isActuallyInStock ? "default" : "secondary"} className="shrink-0 text-xs">
              {isActuallyInStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-orange-600">
                {formatPrice(selected?.price ?? product.basePrice)}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">per {selected?.perLabel ?? product.unit}</span>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 text-right">
              <div>
                <span className="font-medium">Category:</span> {product.category.name}
              </div>
            </div>
          </div>

          {hasVariationChoices && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Variation {requiresSelection && <span className="text-red-500">*</span>}
              </label>

              <Select value={selectedVariationId || ""} onValueChange={onVariationChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={requiresSelection ? "Choose an option" : "Standard or choose option"} />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={6} collisionPadding={12} className="bg-white border-gray-300 shadow-lg pointer-events-auto">
                  {options.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No options available
                    </SelectItem>
                  ) : (
                    options.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id} className="flex items-center gap-2">
                        {"image" in opt && opt.image ? (
                          <img src={opt.image} alt="" className="w-6 h-6 object-cover rounded" />
                        ) : null}
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-gray-500">
                          - {formatPrice(opt.price)} ({opt.stockLabel})
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(Math.max(1, displayQuantity - 1))}
                disabled={displayQuantity <= 1}
                className="h-8 w-8 p-0"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-10 text-center font-medium text-sm">{displayQuantity}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(displayQuantity + 1)}
                className="h-8 w-8 p-0"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <span className="text-xs sm:text-sm text-gray-500">
              Stock:{" "}
              {effectiveVariationId === "base"
                ? `${product.stock} ${product.unit}`
                : effectiveVariationId
                  ? (() => {
                      const v = product.variations.find((vv) => vv.id === effectiveVariationId)
                      return v ? `${v.stock} ${v.unit || product.unit}` : `${product.stock} ${product.unit}`
                    })()
                  : `${product.stock} ${product.unit}`}
            </span>
          </div>

          <Button
            type="button"
            onClick={() => onAddToCart(effectiveVariationId)}
            disabled={!canAddToCart}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {!hasVariations ? "Add to Cart" : !hasSelection && requiresSelection ? "Select Option" : "Add to Cart"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

