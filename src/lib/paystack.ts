import { NextResponse } from 'next/server'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

export interface PaystackTransactionData {
  amount: number // Amount in kobo (multiply Naira by 100)
  email: string
  reference?: string
  callback_url?: string
  metadata?: any
}

export interface PaystackResponse {
  status: boolean
  message: string
  data?: any
}

export class PaystackService {
  private static async makeRequest(endpoint: string, data?: any): Promise<PaystackResponse> {
    const url = `${PAYSTACK_BASE_URL}${endpoint}`

    const headers = {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    }

    const config: RequestInit = {
      method: data ? 'POST' : 'GET',
      headers,
    }

    if (data) {
      config.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, config)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Paystack API error')
      }

      return result
    } catch (error: any) {
      console.error('Paystack API error:', error)
      throw error
    }
  }

  /**
   * Initialize a transaction
   */
  static async initializeTransaction(data: PaystackTransactionData): Promise<PaystackResponse> {
    // Convert amount to kobo (Paystack expects amount in the smallest currency unit)
    const transactionData = {
      ...data,
      amount: data.amount * 100, // Convert Naira to Kobo
    }

    return this.makeRequest('/transaction/initialize', transactionData)
  }

  /**
   * Verify a transaction
   */
  static async verifyTransaction(reference: string): Promise<PaystackResponse> {
    return this.makeRequest(`/transaction/verify/${reference}`)
  }

  /**
   * Get transaction details
   */
  static async getTransaction(reference: string): Promise<PaystackResponse> {
    return this.makeRequest(`/transaction/${reference}`)
  }

  /**
   * Create a transfer recipient
   */
  static async createTransferRecipient(data: {
    type: 'nuban'
    name: string
    account_number: string
    bank_code: string
    currency: 'NGN'
  }): Promise<PaystackResponse> {
    return this.makeRequest('/transferrecipient', data)
  }

  /**
   * Initiate a transfer
   */
  static async initiateTransfer(data: {
    source: 'balance'
    amount: number
    recipient: string
    reason?: string
  }): Promise<PaystackResponse> {
    return this.makeRequest('/transfer', data)
  }
}

// Utility functions
export const generateReference = (): string => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const formatAmountForPaystack = (amount: number): number => {
  return Math.round(amount * 100) // Convert to kobo and round to avoid decimals
}