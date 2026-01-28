"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "./utils"
import { normalizeImageUrl, normalizeImageUrls } from "@/lib/image-utils"
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
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
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
        <span className="mr-2">Options</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
      
      {/* Options Dropdown */}
      {showOptions && (
        <div
          data-options-dropdown
          className="absolute left-0 right-0 bottom-full mb-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 z-[60] max-h-64 overflow-y-auto ring-1 ring-black/5"
          onMouseEnter={() => onShowOptionsChange(true)}
          onMouseLeave={() => {
            setTimeout(() => onShowOptionsChange(false), 300)
          }}
        >
          <div className="p-2">
            {options.map((option) => {
              const variation = option.kind === "variation"
                ? product.variations.find((v) => v.id === option.id)
                : undefined
              const stock = variation ? variation.stock : product.stock
              
              // Get image for the option
              // For standard (base) options, use the product's standard image (first image from images array or image field)
              // For variation options, use variation image or option image
              let normalizedImage: string
              if (option.kind === "base") {
                // Standard option - prioritize option.image (which should be set from buildVariationOptions)
                // Then try product images array, then product.image field, finally default
                const standardImages = normalizeImageUrls(
                  option.image,
                  product.images,
                  (product as any).image
                )
                normalizedImage = standardImages.length > 0 
                  ? standardImages[0] 
                  : "/market_image.jpeg"
              } else {
                // Variation option - use variation image, option image, or product images as fallback
                const variationImages = normalizeImageUrls(
                  variation?.image,
                  option.image,
                  product.images,
                  (product as any).image
                )
                normalizedImage = variationImages.length > 0 
                  ? variationImages[0] 
                  : "/market_image.jpeg"
              }
              
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onVariationSelect(option)
                  }}
                  disabled={stock <= 0}
                  className="w-full text-left p-3 rounded-lg hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Variation Image */}
                      <img
                        src={normalizedImage}
                        alt={option.label}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0 border border-gray-200"
                      />
                      {/* Variety Name and Stock */}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{option.label}</p>
                        <p className="text-sm text-gray-600">Stock: {stock}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-orange-600 ml-2 flex-shrink-0">
                      {formatPrice(option.price)}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
