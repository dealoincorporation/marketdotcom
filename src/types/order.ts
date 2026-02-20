/**
 * Order-related types
 */

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  ON_DELIVERY = 'ON_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variationId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  product?: {
    id: string
    name: string
    image?: string
  }
  variation?: {
    id: string
    name: string
  }
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  totalAmount: number
  deliveryFee: number
  taxAmount: number
  discountAmount: number
  finalAmount: number
  paymentMethod: string
  paymentStatus: string
  transactionId?: string
  items: OrderItem[]
  delivery?: Delivery
  createdAt: Date
  updatedAt: Date
}

export interface Delivery {
  id: string
  orderId: string
  userId: string
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
  deliveryNotes?: string
  scheduledDate?: Date
  scheduledTime?: string
  status: string
  trackingNumber?: string
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateOrderData {
  items: Array<{
    productId: string
    variationId?: string
    quantity: number
  }>
  deliveryAddress: {
    address: string
    city: string
    state: string
    postalCode: string
    phone: string
    deliveryNotes?: string
  }
  paymentMethod: string
}
