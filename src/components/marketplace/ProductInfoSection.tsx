"use client"

import { Badge } from "@/components/ui/badge"
import { getPriceLabel } from "./utils"
import type { MarketplaceProduct, VariationOption } from "./types"

interface ProductInfoSectionProps {
  product: MarketplaceProduct
  options: VariationOption[]
  isActuallyInStock: boolean
}

export function ProductInfoSection({
  product,
  options,
  isActuallyInStock,
}: ProductInfoSectionProps) {
  const priceLabel = getPriceLabel(options, product.basePrice)

  return (
    <div 
      className="block flex-1 flex flex-col"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg leading-tight line-clamp-2 mb-1">
            {product.name}
          </h3>
          {product.description && product.description.trim() && (
            <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-2 hidden sm:block">{product.description}</p>
          )}
        </div>
        <Badge variant={isActuallyInStock ? "default" : "secondary"} className="shrink-0 text-[10px] sm:text-xs px-1.5 py-0">
          {isActuallyInStock ? "In Stock" : "Out"}
        </Badge>
      </div>

      <div className="mt-auto pt-1.5 sm:pt-2 space-y-1.5 sm:space-y-2">
        {/* Category */}
        <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">
          <span className="font-medium">{product.category?.name}</span>
        </div>
        
        {/* Price - same full range on mobile and desktop (e.g. ₦7,000 - ₦800,000) */}
        <div className="min-w-0 w-full">
          <span className="text-base sm:text-lg md:text-xl font-bold text-orange-600 leading-tight break-words tabular-nums">
            {priceLabel}
          </span>
          {priceLabel.includes(' - ') && (
            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 block">Price range</span>
          )}
        </div>
      </div>
    </div>
  )
}
