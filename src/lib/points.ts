/**
 * Points calculation: every (amountThreshold) naira earns (pointsPerThreshold) points.
 * Example: threshold 50,000, pointsPerThreshold 10 → ₦100,000 = 20 points.
 */
export interface PointsEarningSettings {
  amountThreshold: number
  pointsPerThreshold: number
  isActive: boolean
}

const DEFAULT_THRESHOLD = 50000
const DEFAULT_POINTS_PER_THRESHOLD = 1

/**
 * Calculate points earned for a purchase amount using threshold-based logic.
 * Formula: floor(amount / amountThreshold) * pointsPerThreshold
 */
export function calculatePointsFromAmount(
  amountInNaira: number,
  settings: PointsEarningSettings | null
): number {
  if (!settings?.isActive || amountInNaira <= 0) return 0
  const threshold = settings.amountThreshold > 0 ? settings.amountThreshold : DEFAULT_THRESHOLD
  const pointsPer = settings.pointsPerThreshold > 0 ? settings.pointsPerThreshold : DEFAULT_POINTS_PER_THRESHOLD
  const blocks = Math.floor(amountInNaira / threshold)
  return blocks * pointsPer
}
