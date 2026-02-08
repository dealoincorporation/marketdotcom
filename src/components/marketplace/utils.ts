import type { MarketplaceProduct, VariationOption } from "./types"
import { normalizeImageUrl, normalizeImageUrls } from "@/lib/image-utils"

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`
}

/** True if base has a meaningful unit (weightKg or unit like "50kg") to show as option label. */
function hasMeaningfulBaseUnit(product: MarketplaceProduct): boolean {
  const rawWeight = (product as unknown as Record<string, unknown>).weightKg
  const weightKg = typeof rawWeight === "number" && !Number.isNaN(rawWeight)
    ? rawWeight
    : typeof rawWeight === "string" && rawWeight.trim() !== ""
      ? parseFloat(rawWeight)
      : null
  if (weightKg != null && !Number.isNaN(weightKg) && weightKg > 0) return true
  const unit = (product.unit ?? "").trim()
  const m = unit.match(/^(\d+(?:\.\d+)?)\s*kg\s*$/i) || unit.match(/^(\d+(?:\.\d+)?)\s*kg$/i) || unit.match(/^(\d+(?:\.\d+)?)kg$/i)
  if (m) {
    const n = parseFloat(m[1])
    if (!Number.isNaN(n) && n > 0) return true
  }
  return false
}

/** Get base option label: prefer weightKg, then unit (e.g. "50kg"), then "Standard". */
function getBaseOptionLabel(product: MarketplaceProduct): string {
  const rawWeight = (product as unknown as Record<string, unknown>).weightKg
  const weightKg = typeof rawWeight === "number" && !Number.isNaN(rawWeight)
    ? rawWeight
    : typeof rawWeight === "string" && rawWeight.trim() !== ""
      ? parseFloat(rawWeight)
      : null
  if (weightKg != null && !Number.isNaN(weightKg) && weightKg > 0) {
    return `${Number(weightKg) % 1 === 0 ? Math.round(weightKg) : weightKg} kg`
  }
  const unit = (product.unit ?? "").trim()
  const unitWeightMatch = unit.match(/^(\d+(?:\.\d+)?)\s*kg\s*$/i) || unit.match(/^(\d+(?:\.\d+)?)\s*kg$/i) || unit.match(/^(\d+(?:\.\d+)?)kg$/i)
  if (unitWeightMatch) {
    const n = parseFloat(unitWeightMatch[1])
    if (!Number.isNaN(n) && n > 0) {
      return `${n % 1 === 0 ? Math.round(n) : n} kg`
    }
  }
  return "Standard"
}

export function buildVariationOptions(product: MarketplaceProduct): VariationOption[] {
  const options: VariationOption[] = []
  const inStockVariations = product.variations.filter((vv) => vv.stock > 0)

  // Include base option only when: no variations (add-to-cart needs one option) or base has a meaningful unit (weightKg or "50kg").
  // If base has no unit but product has variations, show only variations.
  const includeBase = product.stock > 0 && (inStockVariations.length === 0 || hasMeaningfulBaseUnit(product))

  if (includeBase) {
    const normalizedImages = normalizeImageUrls(product.images, (product as any).image)
    const baseImage = normalizedImages.length > 0
      ? normalizedImages[0]
      : normalizeImageUrl((product as any).image) || undefined
    const baseLabel = getBaseOptionLabel(product)

    options.push({
      kind: "base",
      id: "base",
      label: baseLabel,
      price: product.basePrice,
      image: baseImage,
    })
  }

  for (const v of inStockVariations) {
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
