"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

function normalizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return []
  const cleaned = images
    .filter((v) => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
  return Array.from(new Set(cleaned)).slice(0, 10)
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: Math.max(4, Math.min(8, limit)) }).map((_, i) => (
              <div key={i} className="h-44 sm:h-52 rounded-xl bg-white/70 border border-orange-100 animate-pulse" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p, idx) => {
              const images = normalizeImages(p.images)
              const img = images[0]
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
                      <div className="relative h-28 sm:h-32 bg-gray-100 rounded-t-lg overflow-hidden">
                        {img ? (
                          <img src={img} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-yellow-100" />
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge variant={inStock ? "default" : "secondary"} className="text-[10px]">
                            {inStock ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                        {category ? <p className="text-xs text-gray-500 mt-0.5 truncate">{category}</p> : null}
                        <p className="text-sm font-bold text-orange-600 mt-2">{price}</p>
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

