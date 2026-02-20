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
    <div className="relative mt-2.5 sm:mt-3 z-20 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-2.5 sm:gap-3">
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
          className="relative w-full bg-orange-600 text-white overflow-hidden group text-xs sm:text-sm md:text-base py-2 sm:py-2.5"
        >
          <span className="relative z-10 flex items-center justify-center">
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            <span className="truncate max-w-[140px] sm:max-w-none">
              {selectedVariation
                ? `Add ${selectedVariation.label}`
                : "Add to Cart"}
            </span>
          </span>
          {/* Sliding background animation - slides from left to right on hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-orange-700 to-red-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out"></span>
        </Button>
      </div>
    </div>
  )
}
