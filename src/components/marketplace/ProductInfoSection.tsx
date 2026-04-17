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
      <div className="flex flex-col gap-2 mb-4">
        {/* Category Label - Always on its own line */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-3 bg-orange-500 rounded-full" />
          <span className="text-[9px] sm:text-[10px] font-black text-orange-600/80 uppercase tracking-[0.2em] truncate">
            {product.category?.name || "Uncategorized"}
          </span>
        </div>

        {/* Product Name - Full Width */}
        <h3 className="font-black text-gray-900 text-sm sm:text-xl leading-tight tracking-tight line-clamp-2 transition-colors group-hover:text-orange-600">
          {product.name}
        </h3>

        {/* Stock Badge - Moved below name to free up horizontal space */}
        <div className="flex items-center mt-0.5">
          <Badge className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-none shadow-sm ${isActuallyInStock
            ? "bg-green-500/10 text-green-600"
            : "bg-red-500/10 text-red-600"
            }`}>
            {isActuallyInStock ? "In Stock" : "Unavailable"}
          </Badge>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        {product.description && product.description.trim() && (
          <p className="text-gray-500 text-xs font-bold leading-relaxed line-clamp-2 opacity-80">
            {product.description}
          </p>
        )}

        <div className="flex flex-col">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">From</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-orange-600 tracking-tighter tabular-nums">
              {priceLabel}
            </span>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NGN</span>
          </div>
        </div>
      </div>
    </div>
  )
}
