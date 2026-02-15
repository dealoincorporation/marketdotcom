import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export interface Address {
  id: string
  userId?: string
  type: 'home' | 'work' | 'other'
  name: string // e.g., "Home", "Office", "Mom's Place"
  address: string // Full street address
  city: string
  state: string
  postalCode?: string
  phone: string
  isDefault: boolean
  isVerified?: boolean
  coordinates?: {
    lat: number
    lng: number
  }
  deliveryNotes?: string
  createdAt: Date
  updatedAt: Date
}

interface AddressStore {
  addresses: Address[]
  isLoading: boolean
  error: string | null

  // CRUD operations
  fetchAddresses: () => Promise<void>
  addAddress: (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>
  updateAddress: (id: string, updates: Partial<Address>) => Promise<boolean>
  deleteAddress: (id: string) => Promise<boolean>
  setDefaultAddress: (id: string) => Promise<boolean>

  // Getters
  getDefaultAddress: () => Address | undefined
  getAddressById: (id: string) => Address | undefined
  getAddressesByType: (type: Address['type']) => Address[]

  // Utilities
  validateAddress: (address: Partial<Address>) => { isValid: boolean; errors: string[] }
  formatAddress: (address: Address) => string
}

const DELIVERY_STATE = 'Lagos'

const validateAddress = (address: Partial<Address>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!address.name?.trim()) errors.push('Address name is required')
  if (!address.address?.trim()) errors.push('Street address is required')
  if (!address.city?.trim()) errors.push('City is required')
  if (!address.state?.trim()) errors.push('State is required')
  else if (address.state.trim().toLowerCase() !== DELIVERY_STATE.toLowerCase()) {
    errors.push('Delivery is only available in Lagos. Please use a Lagos address.')
  }
  if (!address.phone?.trim()) errors.push('Phone number is required')
  else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(address.phone.replace(/\s/g, ''))) {
    errors.push('Please enter a valid phone number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

const formatAddress = (address: Address): string => {
  const parts = [
    address.address,
    address.city,
    address.state,
    address.postalCode,
    address.phone
  ].filter(Boolean)

  return parts.join(', ')
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],
      isLoading: false,
      error: null,

      fetchAddresses: async () => {
        try {
          set({ isLoading: true, error: null })

          const token = localStorage.getItem('token')
          const response = await fetch('/api/addresses', {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          })

          if (!response.ok) {
            throw new Error('Failed to fetch addresses')
          }

          const addresses = await response.json()
          set({ addresses })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch addresses'
          set({ error: message })
          console.error('Error fetching addresses:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      addAddress: async (addressData) => {
        try {
          set({ isLoading: true, error: null })

          // Validate address
          const validation = validateAddress(addressData)
          if (!validation.isValid) {
            set({ error: validation.errors.join(', ') })
            return false
          }

          const token = localStorage.getItem('token')
          const response = await fetch('/api/addresses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(addressData)
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to add address')
          }

          const newAddress = await response.json()

          set((state) => ({
            addresses: [...state.addresses, newAddress]
          }))

          toast.success('Address added successfully', { icon: '📍' })
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to add address'
          set({ error: message })
          toast.error(message, { icon: '❌' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      updateAddress: async (id, updates) => {
        try {
          set({ isLoading: true, error: null })

          // Validate updates if they include address fields
          if (Object.keys(updates).some(key => ['name', 'address', 'city', 'state', 'phone'].includes(key))) {
            const existingAddress = get().getAddressById(id)
            if (existingAddress) {
              const validation = validateAddress({ ...existingAddress, ...updates })
              if (!validation.isValid) {
                set({ error: validation.errors.join(', ') })
                return false
              }
            }
          }

          const token = localStorage.getItem('token')
          const response = await fetch(`/api/addresses/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(updates)
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update address')
          }

          const updatedAddress = await response.json()

          set((state) => ({
            addresses: state.addresses.map(addr =>
              addr.id === id ? { ...addr, ...updatedAddress } : addr
            )
          }))

          toast.success('Address updated successfully', { icon: '📍' })
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update address'
          set({ error: message })
          toast.error(message, { icon: '❌' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      deleteAddress: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const token = localStorage.getItem('token')
          const response = await fetch(`/api/addresses/${id}`, {
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to delete address')
          }

          set((state) => ({
            addresses: state.addresses.filter(addr => addr.id !== id)
          }))

          toast.success('Address deleted successfully', { icon: '🗑️' })
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to delete address'
          set({ error: message })
          toast.error(message, { icon: '❌' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      setDefaultAddress: async (id) => {
        try {
          set({ isLoading: true, error: null })

          const token = localStorage.getItem('token')
          const response = await fetch(`/api/addresses/${id}/default`, {
            method: 'PUT',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to set default address')
          }

          set((state) => ({
            addresses: state.addresses.map(addr => ({
              ...addr,
              isDefault: addr.id === id
            }))
          }))

          toast.success('Default address updated', { icon: '🏠' })
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to set default address'
          set({ error: message })
          toast.error(message, { icon: '❌' })
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      // Getters
      getDefaultAddress: () => {
        return get().addresses.find(addr => addr.isDefault)
      },

      getAddressById: (id) => {
        return get().addresses.find(addr => addr.id === id)
      },

      getAddressesByType: (type) => {
        return get().addresses.filter(addr => addr.type === type)
      },

      // Utilities
      validateAddress,
      formatAddress,
    }),
    {
      name: 'marketdotcom-addresses',
      // Only persist addresses, not loading states
      partialize: (state) => ({
        addresses: state.addresses
      }),
    }
  )
)