"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VariationOptionsDropdown } from "./VariationOptionsDropdown"
import type { MarketplaceProduct, VariationOption } from "./types"

interface ProductActionsSectionProps {
  product: MarketplaceProduct
  options: VariationOption[]
  selectedVariation: VariationOption | null
  showOptions: boolean
  isActuallyInStock: boolean
  hasVariationChoices: boolean
  onShowOptionsChange: (show: boolean) => void
  onVariationSelect: (option: VariationOption) => void
  onAddToCart: () => void
}

export function ProductActionsSection({
  product,
  options,
  selectedVariation,
  showOptions,
  isActuallyInStock,
  hasVariationChoices,
  onShowOptionsChange,
  onVariationSelect,
  onAddToCart,
}: ProductActionsSectionProps) {
  return (
    <div className="relative mt-3 z-20" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-2">
        {/* Options Button - Only show if product has variations */}
        {hasVariationChoices && (
          <VariationOptionsDropdown
            product={product}
            options={options}
            showOptions={showOptions}
            isActuallyInStock={isActuallyInStock}
            onShowOptionsChange={onShowOptionsChange}
            onVariationSelect={onVariationSelect}
          />
        )}
        
        {/* Add to Cart Button with Sliding Animation */}
        <Button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onAddToCart()
          }}
          disabled={!isActuallyInStock}
          className="relative w-full bg-orange-600 text-white overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {selectedVariation
              ? `Add ${selectedVariation.label}`
              : "Add to Cart"}
          </span>
          {/* Sliding background animation - slides from left to right on hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
        </Button>
      </div>
    </div>
  )
}
