"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import { CartUserSync } from "@/components/cart-user-sync"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartUserSync />
      {children}
    </AuthProvider>
  )
}
