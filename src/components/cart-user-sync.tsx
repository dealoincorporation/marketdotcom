"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useCartStore } from "@/lib/cart-store"

/**
 * Syncs cart with user: on login, load user's server cart; on logout, clear local cart.
 * Ensures each user's cart is specific to them.
 */
export function CartUserSync() {
  const { user } = useAuth()
  const { setUserId, loadUserCart, clearCart } = useCartStore()
  const prevUserId = useRef<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id)
      loadUserCart()
      prevUserId.current = user.id
    } else {
      if (prevUserId.current != null) {
        setUserId(undefined)
        clearCart({ silent: true })
      }
      prevUserId.current = null
    }
  }, [user?.id, setUserId, loadUserCart, clearCart])

  return null
}
