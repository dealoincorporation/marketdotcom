export interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  categoryId: string
  category: { id: string; name: string }
  stock: number
  unit: string
  inStock: boolean
  variations: Array<{
    id: string
    name: string
    price: number
    stock: number
  }>
}

export interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    unit: string
  }>
}

export interface AdminTabProps {
  products: Product[]
  orders: Order[]
  onDeleteProduct: (productId: string) => void
}

export interface ReferralSettings {
  referrerReward: number
  refereeReward: number
  isActive: boolean
  description: string
}

export interface PointsSettings {
  pointsPerNaira: number
  nairaPerPoint: number
  minimumPointsToConvert: number
  conversionCooldownDays: number
  isActive: boolean
  description: string
}
