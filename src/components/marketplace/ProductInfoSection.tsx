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
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight line-clamp-2">
            {product.name}
          </h3>
          {product.description && product.description.trim() && (
            <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>
        <Badge variant={isActuallyInStock ? "default" : "secondary"} className="shrink-0 text-xs">
          {isActuallyInStock ? "In Stock" : "Out of Stock"}
        </Badge>
      </div>

      <div className="mt-auto pt-2">
        <div className="mb-2 flex flex-col gap-1.5">
          {/* Category - shown before price */}
          <div className="text-xs sm:text-sm text-gray-600">
            <div className="truncate">
              <span className="font-medium">Category:</span>{" "}
              <span className="truncate">{product.category?.name}</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="flex flex-col min-w-0">
            <span className="text-xl sm:text-2xl font-bold text-orange-600">
              {priceLabel}
            </span>
            {priceLabel.includes(' - ') && (
              <span className="text-xs text-gray-500 mt-0.5">Price range</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
