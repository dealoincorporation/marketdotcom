"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { normalizeImageUrls, normalizeImageUrl } from "@/lib/image-utils"

type PreviewProduct = {
  id: string
  name: string
  description?: string
  basePrice: number
  unit?: string
  inStock?: boolean
  images?: string[]
  category?: { name?: string }
  variations?: Array<{
    id: string
    price: number
    stock: number
  }>
  stock?: number
}

function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`
}

function computePriceLabel(product: PreviewProduct) {
  const prices: number[] = []
  if ((product.stock || 0) > 0) prices.push(product.basePrice)
  for (const v of product.variations || []) {
    if ((v.stock || 0) > 0) prices.push(v.price)
  }
  if (prices.length === 0) return formatPrice(product.basePrice)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`
}


export function MarketplacePreview(props: { limit?: number }) {
  const limit = props.limit ?? 8
  const [items, setItems] = React.useState<PreviewProduct[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch("/api/products?inStock=true", { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load products")
        const data = await res.json()
        if (cancelled) return
        const next = Array.isArray(data) ? (data as PreviewProduct[]) : []
        setItems(next.slice(0, Math.max(0, limit)))
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [limit])

  return (
    <section className="py-20 bg-gradient-to-br from-white to-orange-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Marketplace Preview</h2>
            <p className="text-gray-600 mt-2">Popular items available right now.</p>
          </div>
          <Link href="/marketplace">
            <Button className="bg-orange-600 hover:bg-orange-700">View full marketplace</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {Array.from({ length: Math.max(4, Math.min(8, limit)) }).map((_, i) => (
              <div key={i} className="h-36 sm:h-44 md:h-52 rounded-xl bg-white/70 border border-orange-100 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-orange-100">
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900">No products to preview yet</p>
                <p className="text-sm text-gray-600 mt-1">Go to marketplace to refresh or check again later.</p>
              </div>
              <Link href="/marketplace">
                <Button variant="outline" className="border-orange-200">
                  Open marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {items.map((p, idx) => {
              // Use normalizeImageUrls to properly handle product images (images array + image field)
              const normalizedImages = normalizeImageUrls(p.images, (p as any).image)
              // Only use default image if there are NO product images at all
              const img = normalizedImages.length > 0
                ? normalizedImages[0]
                : "/market_image.jpeg"
              const price = computePriceLabel(p)
              const category = p.category?.name
              const inStock = (p.stock || 0) > 0 || (p.variations || []).some((v) => (v.stock || 0) > 0)

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.03 }}
                  viewport={{ once: true }}
                >
                  <Link href="/marketplace" className="block">
                    <Card className="h-full hover:shadow-lg transition-shadow border-orange-100 bg-white/90">
                      <div className="relative h-24 sm:h-28 md:h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                        <img 
                          src={img} 
                          alt={p.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to default image only if image fails to load
                            const target = e.target as HTMLImageElement
                            if (target.src !== "/market_image.jpeg") {
                              target.src = "/market_image.jpeg"
                            }
                          }}
                        />
                        <div className="absolute top-2 left-2">
                          {inStock ? (
                            <Badge className="bg-green-500 text-white border-0 text-xs font-bold px-2.5 py-1 shadow-lg">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs font-bold px-2.5 py-1 shadow-lg">
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-2 sm:p-3">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{p.name}</p>
                        {category ? <p className="text-xs text-gray-500 mt-0.5 truncate">{category}</p> : null}
                        <p className="text-xs sm:text-sm font-bold text-orange-600 mt-1 sm:mt-2 tabular-nums break-words">{price}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

