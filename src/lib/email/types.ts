export interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  items: Array<{
    name: string
    quantity: number
    price: number
    unit: string
  }>
  total: number
  deliveryAddress: string
  deliveryDate: string
  deliveryTime: string
  /** When true, the chosen day's delivery limit was exceeded; order will be delivered next available day */
  slotAtCapacity?: boolean
}

export interface OrderStatusUpdateData {
  orderId: string
  customerName: string
  customerEmail: string
  status: string
  message?: string
}

export interface AdminUserRegistrationData {
  userName: string
  userEmail: string
  registrationDate: string
}

export interface AdminPaymentNotificationData {
  orderId: string
  customerName: string
  customerEmail: string
  amount: number
  paymentMethod: string
  transactionId?: string
}

export interface AdminWalletDepositData {
  userName: string
  userEmail: string
  amount: number
  transactionId?: string
}
