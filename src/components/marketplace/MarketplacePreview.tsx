"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

import { ArrowUpRight, ShoppingBag } from "lucide-react"
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
    <section className="py-24 mesh-gradient-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight">
              Marketplace <span className="text-gradient">Preview</span>
            </h2>
            <p className="text-xl text-gray-600 mt-4 font-medium">Curated selection of our finest products.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Link href="/marketplace">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl px-8 shadow-xl hover:shadow-orange-200 transition-all duration-300">
                View Full Marketplace
              </Button>
            </Link>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: Math.max(4, Math.min(8, limit)) }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-white/50 border border-white/30 animate-pulse glass-effect" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="border-0 glass-effect rounded-[2rem] premium-shadow p-1">
            <CardContent className="p-12 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-10 w-10 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">No products to preview yet</p>
                <p className="text-gray-600 mt-2 max-w-md">Our marketplace is currently being updated with fresh products. Please check back shortly.</p>
              </div>
              <Link href="/marketplace">
                <Button variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 font-bold px-8 rounded-xl h-12">
                  Explore Categories
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((p, idx) => {
              const normalizedImages = normalizeImageUrls(p.images, (p as any).image)
              const img = normalizedImages.length > 0 ? normalizedImages[0] : "/market_image.jpeg"
              const price = computePriceLabel(p)
              const category = p.category?.name
              const inStock = (p.stock || 0) > 0 || (p.variations || []).some((v) => (v.stock || 0) > 0)

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href="/marketplace" className="block group">
                    <Card className="h-full border-0 glass-effect rounded-[2rem] overflow-hidden smooth-transition hover:translate-y-[-8px] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] bg-white/40">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={img}
                          alt={p.name}
                          className="w-full h-full object-cover smooth-transition group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            if (target.src !== "/market_image.jpeg") target.src = "/market_image.jpeg"
                          }}
                        />
                        <div className="absolute top-4 left-4">
                          {inStock ? (
                            <Badge className="bg-orange-600 text-white border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-xl backdrop-blur-md bg-orange-600/90 rounded-lg">
                              In Stock
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 shadow-xl glass-effect rounded-lg">
                              Sold Out
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        {category && (
                          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 opacity-70">
                            {category}
                          </p>
                        )}
                        <p className="font-black text-gray-900 text-lg sm:text-xl line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                          <p className="text-lg font-black text-gray-900 tabular-nums">
                            {price}
                          </p>
                          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white scale-0 group-hover:scale-100 smooth-transition">
                            <ArrowUpRight className="h-5 w-5" />
                          </div>
                        </div>
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

