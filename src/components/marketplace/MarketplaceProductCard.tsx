"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Minus, Package, Plus, ShoppingCart, ChevronDown, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SideModal } from "@/components/ui/side-modal"
import { useCartStore } from "@/lib/cart-store"

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
  const { addItem } = useCartStore()
  const [imageIndex, setImageIndex] = React.useState(0)
  const [showOptions, setShowOptions] = React.useState(false)
  const [showSideModal, setShowSideModal] = React.useState(false)
  const [selectedVariation, setSelectedVariation] = React.useState<VariationOption | null>(null)

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

  const handleVariationSelect = (option: VariationOption) => {
    setSelectedVariation(option)
    setShowOptions(false)
    // Immediately open the side modal with the selected variation
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      setShowSideModal(true)
    }, 0)
  }

  const handleAddToCart = async (quantity: number) => {
    const variationToUse = selectedVariation || options[0]
    if (!variationToUse) return

    const variation = variationToUse.kind === "variation" 
      ? product.variations.find((v) => v.id === variationToUse.id)
      : undefined

    const success = await addItem({
      productId: product.id,
      variationId: variation?.id,
      name: variation
        ? `${product.name} - ${variation.quantity ?? ""}${variation.unit ?? ""} ${variation.name}`.replace(/\s+/g, " ").trim()
        : product.name,
      price: variation?.price || product.basePrice,
      image: (variation?.image || normalizedImages?.[0] || "/market_image.jpeg") as string,
      quantity: quantity,
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
      categoryId: product.categoryId,
      categoryName: product.category?.name,
    })

    if (success) {
      setShowSideModal(false)
      setSelectedVariation(null)
    }
  }

  const handleDirectAddToCart = () => {
    // Always show side modal - if no variation selected, show with first option or base
    if (options.length > 0) {
      const defaultOption = selectedVariation || options[0]
      setSelectedVariation(defaultOption)
      setShowSideModal(true)
    }
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Card className="h-full flex flex-col bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 touch-manipulation select-none border border-gray-100">
          {/* Image Section - Clickable Link */}
          <Link 
            href={`/marketplace/${product.id}`} 
            className="block relative"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="relative h-64 bg-gray-100 overflow-hidden flex-shrink-0">
              <img 
                src={currentImage || "/market_image.jpeg"} 
                alt={product.name} 
                className="w-full h-full object-cover pointer-events-none" 
              />

              {/* Top Left Badge - Best Seller or In Stock */}
              <div className="absolute top-3 left-3 z-10">
                {isActuallyInStock ? (
                  <div className="bg-white rounded-md px-2.5 py-1 shadow-sm">
                    <span className="text-xs font-semibold text-gray-900">In Stock</span>
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-md px-2.5 py-1 shadow-sm">
                    <span className="text-xs font-semibold text-white">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Top Right Badge - Category/Brand */}
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                  <span className="text-white text-[10px] font-bold">
                    {product.category?.name?.charAt(0).toUpperCase() || "P"}
                  </span>
                </div>
              </div>

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

                  {/* Image indicators - bottom center dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10 pointer-events-none">
                    {normalizedImages.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === imageIndex ? "bg-white" : "bg-white/50"}`}
                        aria-label={`Image ${idx + 1} of ${normalizedImages.length}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </Link>

          {/* Content Section */}
          <CardContent className="p-5 flex-1 flex flex-col">
            <Link 
              href={`/marketplace/${product.id}`} 
              className="block flex-1 flex flex-col"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {/* Product Name - Large and Bold */}
              <h3 className="font-bold text-gray-900 text-xl sm:text-2xl leading-tight mb-1.5 line-clamp-2">
                {product.name}
              </h3>

              {/* Slogan/Subtitle - Category or Group Name */}
              <p className="text-gray-500 text-sm mb-2">
                {product.groupName || product.category?.name || "Premium Quality"}
              </p>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Bottom Section - Price */}
              <div className="mt-auto flex items-center justify-start gap-3 pt-4">
                {/* Price Badge */}
                <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <span className="text-base font-bold text-gray-900">
                    {priceLabel}
                  </span>
                </div>
              </div>
            </Link>

            {/* Options and Add to Cart - Outside Link */}
            <div className="relative mt-3" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col gap-2">
                {/* Options Button - Only show if product has variations */}
                {hasVariationChoices && (
                  <div className="relative">
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setShowOptions(!showOptions)
                      }}
                      disabled={!isActuallyInStock}
                      className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg"
                      onMouseEnter={() => setShowOptions(true)}
                      onMouseLeave={() => {
                        // Delay hiding to allow user to move to dropdown
                        setTimeout(() => {
                          const dropdown = document.querySelector('[data-options-dropdown]')
                          if (!dropdown?.matches(':hover')) {
                            setShowOptions(false)
                          }
                        }, 200)
                      }}
                    >
                      <span className="mr-2 text-sm font-medium">Options</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    
                    {/* Options Dropdown */}
                    {showOptions && (
                      <div
                        data-options-dropdown
                        className="absolute left-0 right-0 bottom-full mb-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-40 max-h-64 overflow-y-auto"
                        onMouseEnter={() => setShowOptions(true)}
                        onMouseLeave={() => {
                          setTimeout(() => setShowOptions(false), 300)
                        }}
                      >
                        <div className="p-2">
                          {options.map((option) => {
                            const variation = option.kind === "variation"
                              ? product.variations.find((v) => v.id === option.id)
                              : undefined
                            const stock = variation ? variation.stock : product.stock
                            
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleVariationSelect(option)
                                }}
                                disabled={stock <= 0}
                                className="w-full text-left p-3 rounded-lg hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{option.label}</p>
                                    <p className="text-sm text-gray-600">Stock: {stock}</p>
                                  </div>
                                  <span className="text-sm font-semibold text-orange-600">
                                    {formatPrice(option.price)}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Add to Cart Button with Sliding Animation */}
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDirectAddToCart()
                  }}
                  disabled={!isActuallyInStock}
                  className="relative w-full bg-orange-600 hover:bg-orange-700 text-white overflow-hidden group rounded-lg"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </span>
                  {/* Sliding background animation - slides from left to right on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Side Modal for Quantity Selection */}
      {showSideModal && (
        <SideModal
          isOpen={showSideModal}
          onClose={() => {
            setShowSideModal(false)
            setSelectedVariation(null)
          }}
          title="Add to Cart"
          productName={product.name}
          productImage={normalizedImages?.[0] || "/market_image.jpeg"}
          options={options.map(opt => ({
            id: opt.id,
            label: opt.label,
            price: opt.price,
            stock: opt.kind === "variation"
              ? product.variations.find((v) => v.id === opt.id)?.stock || 0
              : product.stock,
            kind: opt.kind
          }))}
          selectedVariationId={selectedVariation?.id}
          onVariationSelect={(variationId) => {
            const option = options.find(o => o.id === variationId)
            if (option) {
              setSelectedVariation(option)
            }
          }}
          maxQuantity={product.stock}
          onAddToCart={(variationId, quantity) => {
            const option = options.find(o => o.id === variationId)
            if (option) {
              setSelectedVariation(option)
              handleAddToCart(quantity)
            }
          }}
        />
      )}
    </>
  )
}

