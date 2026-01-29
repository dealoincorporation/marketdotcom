"use client"

import Link from "next/link"
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
    <Link 
      href={`/marketplace/${product.id}`} 
      className="block flex-1 flex flex-col"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div className="flex items-start justify-between gap-1.5 sm:gap-3 mb-1 sm:mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg leading-tight line-clamp-2">
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

      <div className="mt-auto pt-1 sm:pt-2">
        <div className="mb-1 sm:mb-2 flex flex-col gap-0.5 sm:gap-1.5">
          {/* Category - shown before price */}
          <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 truncate">
            <span className="font-medium">{product.category?.name}</span>
          </div>
          
          {/* Price */}
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-xl md:text-2xl font-bold text-orange-600">
              {priceLabel}
            </span>
            {priceLabel.includes(' - ') && (
              <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 hidden sm:inline">Price range</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
