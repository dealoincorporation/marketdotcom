export interface ProductFormType {
  groupName?: string
  name: string
  description: string
  basePrice: number
  categoryId: string
  stock: number
  unit: string
  inStock: boolean
  weightKg?: number | null // Weight in kg for delivery calculation (admin-editable)
  deliveryFee?: number | null // null = use default calculation, 0 = free delivery, number = custom fee
  images: string[]
  variations: Array<{
    id?: string
    name?: string // Optional for backward compatibility
    price: number
    stock?: number // Optional - removed from form but kept for backward compatibility
    unit?: string
    quantity?: string | number // Can be string (e.g., "2 kg") or number for backward compatibility
    weightKg?: number | null // Weight in kg for this variation (delivery fee); optional, not shown to customers
    image?: string
  }>
}

export interface ProductFormProps {
  initialData?: any
  categories: any[]
  onSubmit: (data: ProductFormType) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export interface Variation {
  id?: string
  name?: string // Optional - parent product has name
  price: number
  stock?: number
  quantity?: string | number // String format: "2 kg", "1 cup", etc. or just a number
  weightKg?: number | null // Weight in kg for delivery fee calculation (optional)
  image?: string
}
