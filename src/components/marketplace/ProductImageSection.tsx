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
      <div className="relative aspect-square sm:aspect-[4/3] bg-gray-50 overflow-hidden group/img">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transform transition-transform duration-1000 group-hover/img:scale-110 pointer-events-none"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            if (target.src !== "/market_image.jpeg") target.src = "/market_image.jpeg"
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />

        {/* Image navigation */}
        {normalizedImages.length > 1 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover/img:opacity-100 transition-all duration-300 translate-y-2 group-hover/img:translate-y-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onImageIndexChange(imageIndex === 0 ? normalizedImages.length - 1 : imageIndex - 1)
                }}
                className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md text-gray-900 rounded-xl hover:bg-orange-600 hover:text-white transition-all active:scale-90 pointer-events-auto shadow-lg"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onImageIndexChange((imageIndex + 1) % normalizedImages.length)
                }}
                className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md text-gray-900 rounded-xl hover:bg-orange-600 hover:text-white transition-all active:scale-90 pointer-events-auto shadow-lg"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
              {normalizedImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${idx === imageIndex ? "w-6 bg-orange-500" : "w-2 bg-white/60"}`}
                  aria-label={`Image ${idx + 1} of ${normalizedImages.length}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
