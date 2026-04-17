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
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-xs sm:text-sm xxs:text-[11px] py-1.5 sm:py-2 xxs:py-1.5 h-auto min-h-[32px] sm:min-h-[36px] xxs:min-h-[30px]"
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
          className="absolute left-0 right-0 bottom-full mb-2.5 w-full max-w-[min(100%,calc(100vw-2rem))] xxs:max-w-[min(100%,calc(100vw-10px))] min-w-0 bg-white rounded-xl xxs:rounded-lg shadow-xl border border-gray-200 z-[60] overflow-hidden ring-1 ring-black/5"
          onMouseEnter={() => onShowOptionsChange(true)}
          onMouseLeave={() => {
            setTimeout(() => onShowOptionsChange(false), 300)
          }}
        >
          <div className="max-h-[220px] xxs:max-h-[200px] overflow-y-auto overscroll-contain p-1.5 pr-2 [scrollbar-width:thin]">
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
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 p-2 min-w-0 w-full">
                        <span className="shrink-0 mx-auto lg:mx-0 h-14 w-14 max-w-[3.5rem] rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          <img src={normalizedImage} alt="" className="h-full w-full object-cover object-center" />
                        </span>
                        <div className="min-w-0 w-full lg:flex-1 flex flex-col gap-1 text-left">
                          <span className="block font-semibold text-gray-900 text-xs leading-snug break-words">
                            {option.label}
                          </span>
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-0.5 lg:gap-2">
                            <span className="block text-[10px] text-gray-500 leading-tight">
                              Stock: {stock}
                            </span>
                            <span className="text-xs font-bold text-orange-600 tabular-nums">
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
