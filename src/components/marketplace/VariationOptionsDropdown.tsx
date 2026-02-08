"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "./utils"
import { normalizeImageUrls } from "@/lib/image-utils"
import type { MarketplaceProduct, VariationOption } from "./types"

interface VariationOptionsDropdownProps {
  product: MarketplaceProduct
  options: VariationOption[]
  showOptions: boolean
  isActuallyInStock: boolean
  onShowOptionsChange: (show: boolean) => void
  onVariationSelect: (option: VariationOption) => void
}

export function VariationOptionsDropdown({
  product,
  options,
  showOptions,
  isActuallyInStock,
  onShowOptionsChange,
  onVariationSelect,
}: VariationOptionsDropdownProps) {
  return (
    <div className="relative">
      <Button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onShowOptionsChange(!showOptions)
        }}
        disabled={!isActuallyInStock}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs sm:text-sm py-1.5 sm:py-2 h-auto min-h-[32px] sm:min-h-[36px]"
        onMouseEnter={() => onShowOptionsChange(true)}
        onMouseLeave={() => {
          // Delay hiding to allow user to move to dropdown
          setTimeout(() => {
            const dropdown = document.querySelector('[data-options-dropdown]')
            if (!dropdown?.matches(':hover')) {
              onShowOptionsChange(false)
            }
          }, 200)
        }}
      >
        <span className="mr-2 truncate flex-1 text-left">Options</span>
        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
      </Button>
      
      {/* Options dropdown – contained within viewport, no page overflow */}
      {showOptions && (
        <div
          data-options-dropdown
          className="absolute left-0 right-0 bottom-full mb-2.5 w-full max-w-[min(320px,calc(100vw-2rem))] min-w-0 bg-white rounded-xl shadow-xl border border-gray-200 z-[60] overflow-hidden ring-1 ring-black/5"
          onMouseEnter={() => onShowOptionsChange(true)}
          onMouseLeave={() => {
            setTimeout(() => onShowOptionsChange(false), 300)
          }}
        >
          <div className="max-h-[280px] overflow-y-auto overscroll-contain p-2">
            <ul className="space-y-1" role="list">
              {options.map((option) => {
                const variation = option.kind === "variation"
                  ? product.variations.find((v) => v.id === option.id)
                  : undefined
                const stock = variation ? variation.stock : product.stock

                let normalizedImage: string
                if (option.kind === "base") {
                  const standardImages = normalizeImageUrls(
                    option.image,
                    product.images,
                    (product as any).image
                  )
                  normalizedImage = standardImages.length > 0 ? standardImages[0] : "/market_image.jpeg"
                } else {
                  const variationImages = normalizeImageUrls(
                    variation?.image,
                    option.image,
                    product.images,
                    (product as any).image
                  )
                  normalizedImage = variationImages.length > 0 ? variationImages[0] : "/market_image.jpeg"
                }

                return (
                  <li key={`${product.id}-${option.id}`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onVariationSelect(option)
                      }}
                      disabled={stock <= 0}
                      className="w-full text-left rounded-lg hover:bg-orange-50/80 border border-transparent hover:border-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 overflow-hidden"
                    >
                      <div className="flex items-start sm:items-center gap-2 p-2 min-w-0 w-full">
                        <span className="flex-shrink-0 w-9 h-9 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          <img src={normalizedImage} alt="" className="w-full h-full object-cover" />
                        </span>
                        <div className="flex-1 min-w-0">
                          {/* Mobile: stacked so label/stock/price stay visible */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 min-w-0">
                            <div className="min-w-0">
                              <span className="block font-medium text-gray-900 text-xs w-full text-left leading-tight break-words line-clamp-2 sm:line-clamp-1 sm:truncate">
                                {option.label}
                              </span>
                              <span className="block text-[10px] text-gray-500 leading-tight mt-0.5">
                                Stock: {stock}
                              </span>
                            </div>
                            <span className="flex-shrink-0 text-[11px] sm:text-xs font-semibold text-orange-600 tabular-nums whitespace-nowrap">
                              {formatPrice(option.price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
