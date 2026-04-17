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
    <div className="relative mt-2 z-20 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-4 xxs:gap-3">
        {/* Options Button - Only show if product has variations */}
        {hasVariationChoices && (
          <div className="relative">
            <VariationOptionsDropdown
              product={product}
              options={options}
              showOptions={showOptions}
              isActuallyInStock={isActuallyInStock}
              onShowOptionsChange={onShowOptionsChange}
              onVariationSelect={onVariationSelect}
            />
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onAddToCart()
          }}
          disabled={!isActuallyInStock}
          className="relative w-full h-14 xxs:h-12 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl xxs:rounded-xl group overflow-hidden transition-all duration-500 premium-shadow active:scale-95 disabled:opacity-50"
        >
          <div className="relative z-10 flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap">
              {selectedVariation
                ? `Pick ${selectedVariation.label}`
                : "Quick Add"}
            </span>
          </div>

          {/* Animated Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Button>
      </div>
    </div>
  )
}
