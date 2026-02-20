import type { MarketplaceProduct, VariationOption } from "./types"
import { normalizeImageUrl, normalizeImageUrls } from "@/lib/image-utils"

export function formatPrice(price: number): string {
  return `₦${price.toLocaleString()}`
}

/** Strip leading numeric "code" (e.g. "110 ", "14 ") so "14 1 Carton (4 Bottels)" → "1 Carton (4 Bottels)". */
export function stripLeadingNumericCode(s: string): string {
  const trimmed = s.trim()
  const match = trimmed.match(/^\d+\s+(.+)$/)
  return match ? match[1].trim() : trimmed
}

/** Clean a stored cart/order item name for display: strip leading number from the variation part (e.g. "Product - 14 1 Carton" → "Product - 1 Carton"). */
export function cleanCartItemNameForDisplay(name: string): string {
  const idx = name.indexOf(" - ")
  if (idx < 0) return name.trim()
  const productPart = name.slice(0, idx).trim()
  const variationPart = name.slice(idx + 3).trim()
  if (!variationPart) return productPart
  return `${productPart} - ${stripLeadingNumericCode(variationPart)}`
}

/** True if unit looks like a pack description (e.g. "Half Carton (5 bags)") rather than a simple unit ("kg", "L"). */
function isDescriptiveUnit(unit: string): boolean {
  const u = unit.trim()
  if (!u || u.length < 4) return false
  // Contains space or parens → phrase like "Half Carton (5 bags)" or "1 Carton (10 bags)"
  if (/\s|\(|\)/.test(u)) return true
  // Simple units: kg, L, g, ml, etc.
  if (/^(kg|l|g|ml|oz|lb)$/i.test(u)) return false
  return true
}

/**
 * Single display label for a variation (e.g. "Half Carton (5 bags)").
 * Prefers variation.name; strips leading numeric codes. If no name, uses unit only when it's
 * descriptive (e.g. "Half Carton (5 bags)"); otherwise quantity+unit (e.g. "25 L").
 */
export function getVariationDisplayLabel(v: {
  name?: string | null
  quantity?: number | null
  unit?: string | null
}): string {
  const name = (v.name ?? "").trim()
  if (name) return stripLeadingNumericCode(name)
  const q = v.quantity
  const u = (v.unit ?? "").trim()
  if (u && isDescriptiveUnit(u)) return stripLeadingNumericCode(u)
  if (q != null || u) return `${q ?? ""} ${u}`.replace(/\s+/g, " ").trim()
  return "Variation"
}

/**
 * Cart display name: product only, or "Product - Variation label" with clean variation label.
 */
export function getCartItemDisplayName(productName: string, variation?: {
  name?: string | null
  quantity?: number | null
  unit?: string | null
} | null): string {
  if (!variation) return productName.trim()
  const label = getVariationDisplayLabel(variation)
  if (!label || label === "Variation") return productName.trim()
  return `${productName.trim()} - ${label}`
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

/** Get base option label: prefer unit (e.g. "Bag", "Carton"), then weightKg, then "Standard". */
function getBaseOptionLabel(product: MarketplaceProduct): string {
  // Prioritize the explicit unit set by the user (e.g. "Bag", "Carton", "50kg")
  if (product.unit && product.unit.trim()) {
    return product.unit
  }

  const rawWeight = (product as unknown as Record<string, unknown>).weightKg
  const weightKg = typeof rawWeight === "number" && !Number.isNaN(rawWeight)
    ? rawWeight
    : typeof rawWeight === "string" && rawWeight.trim() !== ""
      ? parseFloat(rawWeight)
      : null
  if (weightKg != null && !Number.isNaN(weightKg) && weightKg > 0) {
    return `${Number(weightKg) % 1 === 0 ? Math.round(weightKg) : weightKg} kg`
  }

  // Try to parse weight from unit as last resort fallback if unit was somehow empty string but matched regex (unlikely given first check)
  // or if we want to support some legacy behavior, but for now we just return Standard
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
