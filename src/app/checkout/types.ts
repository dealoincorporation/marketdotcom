export interface Address {
  id: string
  type: "home" | "work" | "other"
  name: string
  address: string
  city: string
  state: string
  postalCode?: string
  phone: string
  isDefault: boolean
}

export interface DeliverySlot {
  id: string
  date: string
  timeSlot: string
  isAvailable: boolean
  maxOrders: number
  currentOrders: number
  price?: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface NewAddress {
  type: "home" | "work" | "other"
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
}

export interface SlotConfig {
  daysAhead: number
  timeSlots: Array<{
    time: string
    enabled: boolean
  }>
  maxOrders: number
  price: string
}
