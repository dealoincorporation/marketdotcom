"use client"

import { cn } from "@/lib/helpers/index"

interface ShimmerSkeletonProps {
  className?: string
  variant?: "rectangular" | "circular" | "text"
}

export function ShimmerSkeleton({ className, variant = "rectangular" }: ShimmerSkeletonProps) {
  const baseClasses = "relative overflow-hidden bg-gray-200"
  
  const variantClasses = {
    rectangular: "rounded",
    circular: "rounded-full",
    text: "rounded",
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    >
      {/* Shimmer effect overlay - light shining across */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  )
}
