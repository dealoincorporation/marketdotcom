export interface MarketplaceProduct {
  id: string
  name: string
  groupName?: string | null
  description: string
  basePrice: number
  categoryId: string
  category: { id: string; name: string }
  stock: number
  unit: string
  inStock: boolean
  weightKg?: number | null
  images: string[]
  variations: Array<{
    id: string
    name: string
    price: number
    stock: number
    unit?: string
    quantity?: number
    image?: string
  }>
}

export type VariationOption =
  | { kind: "base"; id: "base"; label: string; price: number; image?: string }
  | { kind: "variation"; id: string; label: string; price: number; image?: string }
