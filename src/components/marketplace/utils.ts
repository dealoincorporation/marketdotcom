import type { MarketplaceProduct, VariationOption } from "./types"

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`
}

export function buildVariationOptions(product: MarketplaceProduct): VariationOption[] {
  const options: VariationOption[] = []

  if (product.stock > 0) {
    options.push({
      kind: "base",
      id: "base",
      label: `Standard`,
      price: product.basePrice,
    })
  }

  for (const v of product.variations.filter((vv) => vv.stock > 0)) {
    // Use name field (which contains full string like "2 cartons") for the label
    // Fallback to quantity if name is missing, or a default if both are missing
    let label: string
    if (v.name) {
      label = v.name
    } else if (v.quantity) {
      // If name is missing but quantity exists, format it with unit
      label = v.unit 
        ? `${v.quantity}${v.unit}` 
        : String(v.quantity)
    } else {
      label = `Variation ${v.id?.slice(0, 8) || ''}`
    }

    options.push({
      kind: "variation",
      id: v.id,
      label,
      price: v.price,
      image: v.image,
    })
  }

  return options
}

export function resolveSelectedOption(product: MarketplaceProduct, selectedId: string | undefined) {
  const options = buildVariationOptions(product)
  const selected = options.find((o) => o.id === selectedId)
  return { options, selected }
}

export function getPriceLabel(options: VariationOption[], basePrice: number): string {
  const prices = options.map((o) => o.price).filter((p) => typeof p === "number" && !Number.isNaN(p))
  if (prices.length === 0) return formatPrice(basePrice)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${formatPrice(min)} - ${formatPrice(max)}`
}
