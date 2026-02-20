"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { normalizeImageUrls } from "@/lib/image-utils"
import type { MarketplaceProduct } from "./types"

interface ProductImageSectionProps {
  product: MarketplaceProduct
  imageIndex: number
  displayImage: string
  onImageIndexChange: (index: number) => void
}

export function ProductImageSection({
  product,
  imageIndex,
  displayImage,
  onImageIndexChange,
}: ProductImageSectionProps) {
  const normalizedImages = normalizeImageUrls(product.images, (product as any).image)

  return (
    <div
      className="block"
      onClick={(e) => e.stopPropagation()}
      role="presentation"
    >
      <div className="p-2.5 sm:p-3 md:p-3.5 bg-gray-50 rounded-t-lg flex-shrink-0">
        <div className="relative h-36 sm:h-44 md:h-52 bg-gray-100 overflow-hidden rounded-lg">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover pointer-events-none"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target.src !== "/market_image.jpeg") target.src = "/market_image.jpeg"
            }}
          />

          {/* Image navigation - hidden on mobile, visible on desktop */}
          {normalizedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onImageIndexChange(imageIndex === 0 ? normalizedImages.length - 1 : imageIndex - 1)
                }}
                className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-80 transition-all duration-200 z-10 pointer-events-auto"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onImageIndexChange((imageIndex + 1) % normalizedImages.length)
                }}
                className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-80 transition-all duration-200 z-10 pointer-events-auto"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Image indicators - show on all devices but don't block clicks */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10 pointer-events-none">
                {normalizedImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${idx === imageIndex ? "bg-white" : "bg-white/60"}`}
                    aria-label={`Image ${idx + 1} of ${normalizedImages.length}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
