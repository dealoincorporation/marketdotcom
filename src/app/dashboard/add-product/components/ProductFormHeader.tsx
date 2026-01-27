"use client"

import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductFormHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  onCancel?: () => void
}

export function ProductFormHeader({
  title,
  subtitle,
  backHref = "/dashboard?tab=manage-products",
  onCancel,
}: ProductFormHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Link
              href={backHref}
              className="p-1.5 sm:p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0 touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-xs sm:text-sm text-gray-600 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {onCancel ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <X className="h-4 w-4" />
                <span className="hidden xs:inline text-xs sm:text-sm">Cancel</span>
              </Button>
            ) : (
              <Link href={backHref}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <X className="h-4 w-4" />
                  <span className="hidden xs:inline text-xs sm:text-sm">Cancel</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
