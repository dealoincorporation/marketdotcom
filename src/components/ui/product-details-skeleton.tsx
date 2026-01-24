"use client"

import { ShimmerSkeleton } from "./shimmer-skeleton"

export function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button skeleton */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <ShimmerSkeleton className="h-10 w-24" variant="rectangular" />
          <ShimmerSkeleton className="h-10 w-32" variant="rectangular" />
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          {/* Image Section Skeleton */}
          <div>
            <ShimmerSkeleton className="h-80 w-full rounded-2xl mb-3" variant="rectangular" />
            {/* Thumbnail images */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <ShimmerSkeleton key={i} className="h-14 w-full rounded-lg" variant="rectangular" />
              ))}
            </div>
          </div>

          {/* Content Section Skeleton */}
          <div className="space-y-4">
            {/* Product name */}
            <ShimmerSkeleton className="h-8 w-3/4" variant="text" />
            <ShimmerSkeleton className="h-6 w-1/2" variant="text" />
            
            {/* Price */}
            <ShimmerSkeleton className="h-10 w-32" variant="text" />
            
            {/* Description */}
            <div className="space-y-2">
              <ShimmerSkeleton className="h-4 w-full" variant="text" />
              <ShimmerSkeleton className="h-4 w-full" variant="text" />
              <ShimmerSkeleton className="h-4 w-3/4" variant="text" />
            </div>

            {/* Variations */}
            <div className="space-y-2">
              <ShimmerSkeleton className="h-5 w-40" variant="text" />
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <ShimmerSkeleton key={i} className="h-16 w-full rounded-lg" variant="rectangular" />
                ))}
              </div>
            </div>

            {/* Add to cart button */}
            <ShimmerSkeleton className="h-12 w-full rounded-lg" variant="rectangular" />
          </div>
        </div>
      </div>
    </div>
  )
}
