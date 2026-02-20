import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import toast from 'react-hot-toast'

// Enhanced CartItem interface with comprehensive fields
export interface CartItem {
  id: string // Unique cart item ID (usually `${productId}-${variationId || 'base'}`)
  productId: string // Base product ID
  variationId?: string // Variation ID if applicable
  name: string
  description?: string
  price: number // Current price at time of adding
  originalPrice?: number // Original price for comparison
  image: string
  quantity: number
  unit: string
  deliveryFee?: number | null // Per-product delivery fee (null = use default, 0 = free, number = custom fee)
  variation?: {
    id: string
    name: string
    type: string
    price?: number
    stock?: number
    quantity?: number // Variation quantity (e.g., 55)
    unit?: string // Variation unit (e.g., "kg")
  }
  categoryId?: string
  categoryName?: string
  brand?: string
  isAvailable: boolean // Product availability status
  maxQuantity?: number // Maximum allowed quantity (stock limit)
  weight?: number // For shipping calculations
  dimensions?: {
    length: number
    width: number
    height: number
  }
  tags?: string[]
  addedAt: Date // When item was added to cart
  updatedAt: Date // Last update timestamp
}

// Cart validation result
export interface CartValidationResult {
  isValid: boolean
  errors: CartValidationError[]
  warnings: CartValidationWarning[]
}

// Cart validation error
export interface CartValidationError {
  itemId: string
  type: 'out_of_stock' | 'quantity_exceeded' | 'price_changed' | 'unavailable'
  message: string
  suggestedAction?: 'remove' | 'update_quantity' | 'update_price'
}

// Cart validation warning
export interface CartValidationWarning {
  itemId: string
  type: 'low_stock' | 'price_increased' | 'price_decreased'
  message: string
}

// Cart summary for checkout
export interface CartSummary {
  items: CartItem[]
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  totalItems: number
  totalWeight?: number
}

// Enhanced CartStore interface
interface CartStore {
  // State
  items: CartItem[]
  isLoading: boolean
  lastValidation: Date | null
  userId?: string
  /** Admin-only: override delivery fee for current order (null = use calculated) */
  adminDeliveryFeeOverride: number | null

  // Basic operations
  addItem: (item: Omit<CartItem, 'id' | 'addedAt' | 'updatedAt' | 'quantity' | 'isAvailable'> & { quantity?: number }) => Promise<boolean>
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => Promise<boolean>
  clearCart: (opts?: { silent?: boolean }) => void

  // Advanced operations
  mergeCart: (items: CartItem[]) => Promise<void>
  validateCart: () => Promise<CartValidationResult>
  applyBulkUpdate: (updates: { id: string; quantity: number }[]) => Promise<boolean>
  syncWithServer: () => Promise<void>

  // Getters
  getItem: (id: string) => CartItem | undefined
  getItemQuantity: (id: string) => number
  getTotalItems: () => number
  getTotalPrice: () => number
  getTotalWeight: () => number
  getCartSummary: (includeShipping?: boolean) => CartSummary

  // Utilities
  hasItem: (productId: string, variationId?: string) => boolean
  getItemsByCategory: (categoryId: string) => CartItem[]
  getLowStockItems: () => CartItem[]
  getUnavailableItems: () => CartItem[]
  setAdminDeliveryFeeOverride: (fee: number | null) => void
  setUserId: (userId: string | undefined) => void
  loadUserCart: () => Promise<void>
}

// Utility functions

/** Round to 2 decimal places to prevent floating-point drift (e.g. 29.99 * 3 = 89.97, not 89.97000…01) */
export const roundCurrency = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100

const generateCartItemId = (productId: string, variationId?: string): string => {
  return variationId ? `${productId}-${variationId}` : `${productId}-base`
}

const validateQuantity = (quantity: number, maxQuantity?: number): boolean => {
  if (!Number.isFinite(quantity) || quantity <= 0) return false
  if (!Number.isInteger(quantity)) return false
  return quantity <= (maxQuantity || 999)
}

const calculateCartTotals = (items: CartItem[]) => {
  const subtotal = roundCurrency(
    items.reduce((total, item) => total + roundCurrency(item.price * item.quantity), 0)
  )
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const totalWeight = roundCurrency(
    items.reduce((total, item) => total + ((item.weight ?? 0) * item.quantity), 0)
  )

  return { subtotal, totalItems, totalWeight }
}

/** Merge duplicate cart items by id (sum quantities) so React keys are unique. */
const deduplicateCartItems = (items: CartItem[]): CartItem[] => {
  const byId = new Map<string, CartItem>()
  for (const item of items) {
    const existing = byId.get(item.id)
    if (existing) {
      const mergedQty = Math.min(
        (existing.quantity ?? 0) + (item.quantity ?? 0),
        existing.maxQuantity ?? 999
      )
      byId.set(item.id, { ...existing, quantity: mergedQty, updatedAt: new Date() })
    } else {
      byId.set(item.id, { ...item, addedAt: item.addedAt ?? new Date(), updatedAt: item.updatedAt ?? new Date() })
    }
  }
  return Array.from(byId.values())
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      lastValidation: null,
      userId: undefined,
      adminDeliveryFeeOverride: null,

      setAdminDeliveryFeeOverride: (fee) => set({ adminDeliveryFeeOverride: fee }),

      addItem: async (newItem) => {
        try {
          const qty = Math.max(1, Math.floor(newItem.quantity || 1))

          // Validate quantity
          if (!validateQuantity(qty, newItem.maxQuantity)) {
            toast.error('Invalid quantity specified', { icon: '⚠️' })
            return false
          }

          // Check if item is available (via maxQuantity)
          if (newItem.maxQuantity !== undefined && newItem.maxQuantity <= 0) {
            toast.error(`${newItem.name} is currently unavailable`, { icon: '⚠️' })
            return false
          }

          const cartItemId = generateCartItemId(newItem.productId, newItem.variationId)

          set((state) => {
            const existingItem = state.items.find(item => item.id === cartItemId)

            if (existingItem) {
              const newQuantity = existingItem.quantity + qty

              // Check if new quantity exceeds limits
              if (!validateQuantity(newQuantity, existingItem.maxQuantity)) {
                toast.error(`Cannot add more ${newItem.name}. Maximum quantity exceeded.`, { icon: '⚠️' })
                return state
              }

              toast.success(`Updated ${newItem.name} quantity to ${newQuantity} in cart`, {
                duration: 3000,
                style: {
                  background: 'rgba(34, 197, 94, 0.95)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                },
                icon: '🛒',
              })

              return {
                items: state.items.map(item =>
                  item.id === cartItemId
                    ? {
                        ...item,
                        quantity: newQuantity,
                        updatedAt: new Date()
                      }
                    : item
                )
              }
            }

            // Add new item
            const newCartItem: CartItem = {
              ...newItem,
              id: cartItemId,
              quantity: qty,
              isAvailable: newItem.maxQuantity === undefined || newItem.maxQuantity > 0,
              addedAt: new Date(),
              updatedAt: new Date()
            }

            toast.success(`Added ${newItem.name} to cart`, {
              duration: 3000,
              style: {
                background: 'rgba(34, 197, 94, 0.95)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              },
              icon: '🛒',
            })

            return {
              items: [...state.items, newCartItem]
            }
          })

          // Sync with server if user is logged in
          if (get().userId) {
            await get().syncWithServer()
          }

          return true
        } catch (error) {
          console.error('Error adding item to cart:', error)
          toast.error('Failed to add item to cart', { icon: '❌' })
          return false
        }
      },

      removeItem: (id) => {
        const item = get().items.find(item => item.id === id)
        if (item) {
          toast.success(`Removed ${item.name} from cart`, {
            duration: 2000,
            style: {
              background: 'rgba(239, 68, 68, 0.95)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            },
            icon: '🗑️',
          })
        }

        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }))

        // Sync with server if user is logged in
        if (get().userId) {
          get().syncWithServer()
        }
      },

      updateQuantity: async (id, quantity) => {
        try {
          const safeQty = Math.floor(quantity)
          if (safeQty <= 0) {
            get().removeItem(id)
            return true
          }

          const item = get().items.find(item => item.id === id)
          if (!item) {
            toast.error('Item not found in cart', { icon: '⚠️' })
            return false
          }

          if (!validateQuantity(safeQty, item.maxQuantity)) {
            toast.error(`Cannot update quantity. Maximum allowed: ${item.maxQuantity}`, { icon: '⚠️' })
            return false
          }

          set((state) => ({
            items: state.items.map(cartItem =>
              cartItem.id === id
                ? { ...cartItem, quantity: safeQty, updatedAt: new Date() }
                : cartItem
            )
          }))

          // Sync with server if user is logged in
          if (get().userId) {
            await get().syncWithServer()
          }

          return true
        } catch (error) {
          console.error('Error updating cart quantity:', error)
          toast.error('Failed to update quantity', { icon: '❌' })
          return false
        }
      },

      clearCart: (opts) => {
        set({ items: [], adminDeliveryFeeOverride: null })
        if (!opts?.silent) {
          toast.success('Cart cleared', {
            duration: 2000,
            style: {
              background: 'rgba(156, 163, 175, 0.95)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(156, 163, 175, 0.3)',
            },
            icon: '🗑️',
          })
        }
        if (get().userId) {
          get().syncWithServer()
        }
      },

      // Advanced operations
      mergeCart: async (items) => {
        set((state) => {
          const mergedItems = [...state.items]

          items.forEach(newItem => {
            const existingIndex = mergedItems.findIndex(item => item.id === newItem.id)

            if (existingIndex >= 0) {
              // Merge quantities
              const existingItem = mergedItems[existingIndex]
              const newQuantity = existingItem.quantity + newItem.quantity

              mergedItems[existingIndex] = {
                ...existingItem,
                quantity: Math.min(newQuantity, existingItem.maxQuantity || 999),
                updatedAt: new Date()
              }
            } else {
              // Add new item
              mergedItems.push(newItem)
            }
          })

          return { items: mergedItems }
        })

        toast.success('Cart synchronized', { icon: '🔄' })
      },

      validateCart: async () => {
        const items = get().items
        const errors: CartValidationError[] = []
        const warnings: CartValidationWarning[] = []

        // Check each item
        for (const item of items) {
          // Check availability
          if (!item.isAvailable) {
            errors.push({
              itemId: item.id,
              type: 'unavailable',
              message: `${item.name} is no longer available`,
              suggestedAction: 'remove'
            })
          }

          // Check stock
          if (item.maxQuantity && item.quantity > item.maxQuantity) {
            errors.push({
              itemId: item.id,
              type: 'quantity_exceeded',
              message: `Only ${item.maxQuantity} ${item.name} available`,
              suggestedAction: 'update_quantity'
            })
          }

          // Check for low stock warning
          if (item.maxQuantity && item.quantity >= item.maxQuantity * 0.8) {
            warnings.push({
              itemId: item.id,
              type: 'low_stock',
              message: `Only ${item.maxQuantity - item.quantity} ${item.name} remaining`
            })
          }
        }

        set({ lastValidation: new Date() })

        return {
          isValid: errors.length === 0,
          errors,
          warnings
        }
      },

      applyBulkUpdate: async (updates) => {
        try {
          set((state) => {
            const updatedItems = state.items.map(item => {
              const update = updates.find(u => u.id === item.id)
              if (update && validateQuantity(update.quantity, item.maxQuantity)) {
                return { ...item, quantity: update.quantity, updatedAt: new Date() }
              }
              return item
            })

            return { items: updatedItems }
          })

          // Sync with server if user is logged in
          if (get().userId) {
            await get().syncWithServer()
          }

          return true
        } catch (error) {
          console.error('Error applying bulk update:', error)
          toast.error('Failed to update cart items', { icon: '❌' })
          return false
        }
      },

      syncWithServer: async () => {
        const uid = get().userId
        if (!uid) return
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) return
        const items = get().items
        try {
          const res = await fetch('/api/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: items.map((i) => ({
                productId: i.productId,
                variationId: i.variationId ?? null,
                quantity: i.quantity,
              })),
            }),
          })
          if (!res.ok) throw new Error('Sync failed')
        } catch (e) {
          console.error('Cart sync failed:', e)
        }
      },

      setUserId: (userId) => set({ userId }),

      loadUserCart: async () => {
        const uid = get().userId
        if (!uid) return
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token) return
        try {
          const res = await fetch('/api/cart', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) throw new Error('Fetch failed')
          const data = (await res.json()) as { items?: CartItem[] }
          const raw = data.items ?? []
          const parsed: CartItem[] = raw.map((i: any) => ({
            ...i,
            addedAt: i.addedAt ? new Date(i.addedAt) : new Date(),
            updatedAt: i.updatedAt ? new Date(i.updatedAt) : new Date(),
          }))
          const items = deduplicateCartItems(parsed)
          set({ items })
        } catch (e) {
          console.error('Load user cart failed:', e)
        }
      },

      // Getters
      getItem: (id) => {
        return get().items.find(item => item.id === id)
      },

      getItemQuantity: (id) => {
        const item = get().items.find(item => item.id === id)
        return item?.quantity || 0
      },

      getTotalItems: () => {
        return calculateCartTotals(get().items).totalItems
      },

      getTotalPrice: () => {
        return calculateCartTotals(get().items).subtotal
      },

      getTotalWeight: () => {
        return calculateCartTotals(get().items).totalWeight
      },

      getCartSummary: (includeShipping = false) => {
        const items = get().items
        const { subtotal, totalItems, totalWeight } = calculateCartTotals(items)

        // Shipping is handled by weight-tier delivery fees in the checkout hook.
        // This summary provides the cart-level view; delivery fee is added at checkout.
        const shipping = 0
        const tax = 0
        const discount = 0

        return {
          items,
          subtotal,
          discount,
          tax,
          shipping,
          total: roundCurrency(subtotal + shipping - discount),
          totalItems,
          totalWeight,
        }
      },

      // Utilities
      hasItem: (productId, variationId) => {
        const cartItemId = generateCartItemId(productId, variationId)
        return get().items.some(item => item.id === cartItemId)
      },

      getItemsByCategory: (categoryId) => {
        return get().items.filter(item => item.categoryId === categoryId)
      },

      getLowStockItems: () => {
        return get().items.filter(item =>
          item.maxQuantity && item.quantity >= item.maxQuantity * 0.8
        )
      },

      getUnavailableItems: () => {
        return get().items.filter(item => !item.isAvailable)
      },
    }),
    {
      name: 'marketdotcom-cart-v2', // Updated storage key for new version
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          try {
            const state = JSON.parse(str) as { state?: { items?: CartItem[] } }
            const items = state?.state?.items
            if (Array.isArray(items) && items.length > 0) {
              const deduped = deduplicateCartItems(items.map((i: any) => ({
                ...i,
                addedAt: i.addedAt ? new Date(i.addedAt) : new Date(),
                updatedAt: i.updatedAt ? new Date(i.updatedAt) : new Date(),
              })))
              return JSON.stringify({ ...state, state: { ...state.state, items: deduped } })
            }
          } catch (_) { /* ignore */ }
          return str
        },
        setItem: (name: string, value: string) => localStorage.setItem(name, value),
        removeItem: (name: string) => localStorage.removeItem(name),
      })),
      // Only persist items, not loading states
      partialize: (state) => ({
        items: state.items,
        userId: state.userId,
        lastValidation: state.lastValidation
      }),
    }
  )
)
