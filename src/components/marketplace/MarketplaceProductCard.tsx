"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { SideModal } from "@/components/ui/side-modal"
import { useCartStore } from "@/lib/cart-store"
import { useAuth } from "@/contexts/AuthContext"
import { normalizeImageUrl } from "@/lib/image-utils"
import { ProductImageSection } from "./ProductImageSection"
import { ProductInfoSection } from "./ProductInfoSection"
import { ProductActionsSection } from "./ProductActionsSection"
import { useProductCard } from "./hooks/useProductCard"
import { getCartItemDisplayName, getVariationDisplayLabel } from "./utils"
import type { MarketplaceProduct, VariationOption } from "./types"

export interface MarketplaceProductCardProps {
  product: MarketplaceProduct
  selectedVariationId?: string
  onVariationChange?: (variationId: string) => void
  onAddToCart?: (variationId?: string) => void
  /** When true, guests are redirected to sign in / create account instead of adding to cart */
  redirectToAuthIfGuest?: boolean
}

export function MarketplaceProductCard(props: MarketplaceProductCardProps) {
  const { product, redirectToAuthIfGuest } = props
  const { addItem } = useCartStore()
  const { user } = useAuth()
  const router = useRouter()

  const {
    imageIndex,
    showOptions,
    showSideModal,
    selectedVariation,
    options,
    normalizedImages,
    selectedVariationImage,
    displayImage,
    hasVariationChoices,
    isActuallyInStock,
    setImageIndex,
    setShowOptions,
    setSelectedVariation,
    handleVariationSelect,
    handleDirectAddToCart,
    handleOpenModal,
    handleCloseModal,
  } = useProductCard({ product, selectedVariationId: props.selectedVariationId })

  const handleAddToCart = async (quantity: number) => {
    if (redirectToAuthIfGuest && !user) {
      router.push("/auth/login?redirect=" + encodeURIComponent("/marketplace"))
      return
    }
    const variationToUse = selectedVariation || options[0]
    if (!variationToUse) return

    const variation = variationToUse.kind === "variation" 
      ? product.variations.find((v) => v.id === variationToUse.id)
      : undefined

    const success = await addItem({
      productId: product.id,
      variationId: variation?.id,
      name: getCartItemDisplayName(product.name, variation ?? undefined),
      price: variation?.price || product.basePrice,
      image:
        (normalizeImageUrl(variation?.image) || normalizedImages?.[0] || "/market_image.jpeg") as string,
      quantity: quantity,
      unit: (variation?.unit || product.unit) as string,
      variation: variation
        ? {
            id: variation.id,
            name: getVariationDisplayLabel(variation),
            type: "Quantity",
            price: variation.price,
            stock: variation.stock,
            quantity: variation.quantity,
            unit: variation.unit,
          }
        : undefined,
      maxQuantity: variation ? variation.stock : product.stock,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      weight: (variation as any)?.weightKg ?? (product as any).weightKg ?? 0,
      deliveryFee: (product as any).deliveryFee !== undefined ? (product as any).deliveryFee : null,
    })

    if (success) {
      handleCloseModal()
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
        <Card 
          className="relative h-full flex flex-col min-h-[340px] sm:min-h-[380px] bg-white border border-gray-200 rounded-lg overflow-visible hover:shadow-lg active:shadow-md transition-all duration-200 touch-manipulation select-none cursor-pointer"
          onClick={handleOpenModal}
        >
          {/* Image Section */}
          <ProductImageSection
            product={product}
            imageIndex={imageIndex}
            displayImage={displayImage}
            onImageIndexChange={setImageIndex}
          />

          {/* Content Section */}
          <CardContent className="p-3 sm:p-4 flex-1 flex flex-col overflow-visible gap-2.5 sm:gap-3 min-h-0">
            <ProductInfoSection
              product={product}
              options={options}
              isActuallyInStock={isActuallyInStock}
            />

            {/* Add to Cart Button with Options */}
            <ProductActionsSection
              product={product}
              options={options}
              selectedVariation={selectedVariation}
              showOptions={showOptions}
              isActuallyInStock={isActuallyInStock}
              hasVariationChoices={hasVariationChoices}
              onShowOptionsChange={setShowOptions}
              onVariationSelect={handleVariationSelect}
              onAddToCart={
                redirectToAuthIfGuest && !user
                  ? () => router.push("/auth/login?redirect=" + encodeURIComponent("/marketplace"))
                  : handleDirectAddToCart
              }
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Side Modal for Quantity Selection */}
      {showSideModal && (
        <SideModal
          isOpen={showSideModal}
          onClose={handleCloseModal}
          title="Add to Cart"
          productName={product.name}
          productImage={
            selectedVariationImage ||
            (normalizedImages.length > 0 ? normalizedImages[0] : "/market_image.jpeg")
          }
          options={options.map(opt => {
            const variation = opt.kind === "variation"
              ? product.variations.find((v) => v.id === opt.id)
              : undefined
            
            return {
              id: opt.id,
              label: opt.label,
              price: opt.price,
              stock: variation?.stock || product.stock,
              kind: opt.kind,
              image: opt.image, // Include image for standard/base options
              unit: variation?.unit || (opt.kind === "base" ? product.unit : undefined),
              quantity: variation?.quantity || undefined
            }
          })}
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
              void handleAddToCart(quantity)
            }
          }}
        />
      )}
    </>
  )
}

// Re-export types for convenience
export type { MarketplaceProduct, VariationOption } from "./types"
