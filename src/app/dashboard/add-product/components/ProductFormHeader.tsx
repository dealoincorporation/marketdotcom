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
    <header className="sticky top-0 z-50 glass-effect bg-white/80 backdrop-blur-xl border-b border-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link
              href={backHref}
              className="p-2.5 rounded-2xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-95 group flex-shrink-0"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight uppercase truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-[11px] font-black text-gray-400 uppercase tracking-widest truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {onCancel ? (
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex items-center gap-2 h-12 px-4 sm:px-6 border border-white/70 bg-white/85 backdrop-blur-sm rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 group"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                <span className="hidden xs:inline">Cancel</span>
              </Button>
            ) : (
              <Link href={backHref}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-12 px-4 sm:px-6 border border-white/70 bg-white/85 backdrop-blur-sm rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 group"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                  <span className="hidden xs:inline">Cancel</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
