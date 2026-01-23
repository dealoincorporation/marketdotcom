/**
 * User-related types
 */

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string
  email: string
  name?: string
  phone?: string
  role: UserRole
  emailVerified?: Date
  image?: string
  walletBalance: number
  points: number
  referralCode: string
  referredById?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  name?: string
  phone?: string
  image?: string
}

export interface Address {
  id: string
  userId: string
  address: string
  city: string
  state: string
  postalCode: string
  phone: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface WalletTransaction {
  id: string
  userId: string
  type: 'credit' | 'debit'
  amount: number
  description: string
  reference?: string
  createdAt: Date
}
