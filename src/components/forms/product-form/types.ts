export interface ProductFormType {
  groupName?: string
  name: string
  description: string
  basePrice: number
  categoryId: string
  stock: number
  unit: string
  inStock: boolean
  images: string[]
  variations: Array<{
    id?: string
    name: string
    price: number
    stock: number
    unit?: string
    quantity?: number
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
  name: string
  price: number
  stock: number
  unit?: string
  quantity?: number
  image?: string
}
