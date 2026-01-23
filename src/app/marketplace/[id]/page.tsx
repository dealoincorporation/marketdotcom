"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/lib/cart-store"

type Product = {
  id: string
  name: string
  description: string
  basePrice: number
  unit: string
  stock: number
  inStock: boolean
  images: string[]
  category?: { name?: string }
  variations: Array<{
    id: string
    name: string
    price: number
    stock: number
    unit?: string | null
    quantity?: number | null
    image?: string | null
  }>
}

type Option =
  | { kind: "base"; id: "base"; label: string; price: number; image?: string }
  | { kind: "variation"; id: string; label: string; price: number; image?: string }

function formatPrice(price: number) {
  return `₦${price.toLocaleString()}`
}

function normalizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return []
  const cleaned = images
    .filter((v) => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
  return Array.from(new Set(cleaned)).slice(0, 10)
}

function buildOptions(p: Product): Option[] {
  const options: Option[] = []
  if ((p.stock || 0) > 0) {
    options.push({ kind: "base", id: "base", label: "Standard", price: p.basePrice, image: p.images?.[0] })
  }
  for (const v of (p.variations || []).filter((vv) => (vv.stock || 0) > 0)) {
    const label = v.quantity && v.unit ? `${v.quantity}${v.unit} ${v.name}` : v.name
    options.push({
      kind: "variation",
      id: v.id,
      label,
      price: v.price,
      image: v.image || undefined,
    })
  }
  return options
}

function computeRangeLabel(p: Product) {
  const options = buildOptions(p)
  const prices = options.map((o) => o.price)
  if (prices.length === 0) return formatPrice(p.basePrice)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`
}

export default function MarketplaceProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const { addItem } = useCartStore()

  const [product, setProduct] = React.useState<Product | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedId, setSelectedId] = React.useState<string>("")
  const [heroIndex, setHeroIndex] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/products/${productId}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load product")
        const data = (await res.json()) as Product
        if (cancelled) return
        data.images = normalizeImages(data.images)
        setProduct(data)
        setHeroIndex(0)
      } catch {
        if (!cancelled) setProduct(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [productId])

  const options = React.useMemo(() => (product ? buildOptions(product) : []), [product])
  const selected = React.useMemo(() => options.find((o) => o.id === selectedId), [options, selectedId])
  const canAdd = Boolean(selectedId) && Boolean(product)

  const handleAdd = () => {
    if (!product) return
    if (!selectedId) return
    const variation = selectedId !== "base" ? product.variations.find((v) => v.id === selectedId) : undefined

    addItem({
      productId: product.id,
      variationId: variation?.id,
      name: variation
        ? `${product.name} (${variation.quantity ?? ""} ${variation.unit ?? ""} ${variation.name})`.replace(/\s+/g, " ").trim()
        : product.name,
      price: variation?.price || product.basePrice,
      image: (variation?.image || product.images?.[0] || "/api/placeholder/300/200") as string,
      quantity: 1,
      unit: (variation?.unit || product.unit) as string,
      variation: variation
        ? {
            id: variation.id,
            name: variation.name,
            type: "Quantity",
            price: variation.price,
            stock: variation.stock,
          }
        : undefined,
      maxQuantity: variation ? variation.stock : product.stock,
      categoryId: (product as any).categoryId,
      categoryName: product.category?.name,
    })
    router.push("/cart")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-10 w-28 bg-white border border-gray-200 rounded-lg animate-pulse" />
          <div className="mt-6 grid lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-2xl bg-white border border-gray-200 animate-pulse" />
            <div className="h-80 rounded-2xl bg-white border border-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <p className="font-semibold text-gray-900">Product not found</p>
            <p className="text-sm text-gray-600 mt-2">This product may have been removed.</p>
            <div className="mt-5">
              <Link href="/marketplace">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">Back to marketplace</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hero = product.images?.[heroIndex]
  const inStock = (product.stock || 0) > 0 || (product.variations || []).some((v) => (v.stock || 0) > 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => router.back()} className="border-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Link href="/marketplace">
            <Button variant="ghost">Marketplace</Button>
          </Link>
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="h-80 bg-gray-100">
                {hero ? <img src={hero} alt={product.name} className="w-full h-full object-cover" /> : null}
              </div>
              {product.images?.length > 1 ? (
                <div className="p-3 grid grid-cols-5 gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={img + i}
                      type="button"
                      onClick={() => setHeroIndex(i)}
                      className={`h-14 rounded-lg overflow-hidden border ${i === heroIndex ? "border-orange-500" : "border-gray-200"}`}
                      aria-label={`View image ${i + 1}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                </div>
                <Badge variant={inStock ? "default" : "secondary"}>{inStock ? "Available" : "Unavailable"}</Badge>
              </div>

              <div className="mt-5">
                <p className="text-2xl font-black text-orange-600">
                  {selected ? formatPrice(selected.price) : computeRangeLabel(product)}
                </p>
                {product.category?.name ? <p className="text-sm text-gray-500 mt-1">{product.category.name}</p> : null}
              </div>

              <Separator className="my-5" />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Quantity</label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose quantity" />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={6} collisionPadding={12} className="bg-white border-gray-300 shadow-lg pointer-events-auto">
                    {options.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No options available
                      </SelectItem>
                    ) : (
                      options.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>
                          <span className="font-medium">{opt.label}</span>
                          <span className="text-gray-500"> - {formatPrice(opt.price)}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sticky add-to-cart */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
            <p className="text-xs text-gray-600">{selected ? formatPrice(selected.price) : computeRangeLabel(product)}</p>
          </div>
          <Button onClick={handleAdd} disabled={!canAdd} className="bg-orange-600 hover:bg-orange-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            {canAdd ? "Add to cart" : "Select quantity"}
          </Button>
        </div>
      </div>
    </div>
  )
}

