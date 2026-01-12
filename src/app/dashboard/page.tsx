"use client"

import React, { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import { useDashboard } from "@/hooks/useDashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Loading } from "@/components/ui/loading"
import { Error } from "@/components/ui/error"
import { User } from "lucide-react"

// Import components
import MarketplaceTab from "./components/MarketplaceTab"
import OrdersTab from "./components/OrdersTab"
import WalletTab from "./components/WalletTab"
import AdminTab from "./components/AdminTab"
import ManageProductsTab from "./components/ManageProductsTab"
import { ProductForm } from "@/components/forms/product-form"

// Import hooks
import { useProducts } from "@/hooks/useProducts"
import { useCartStore } from "@/lib/cart-store"

// Import types
import { Product } from "@prisma/client"

type DashboardTab = "marketplace" | "orders" | "manage-products" | "wallet" | "admin"

function DashboardContent() {
  // Custom hooks
  const { user } = useAuth()
  const { logout } = useAuth()
  const { products: rawProducts, categories: rawCategories, orders: rawOrders, walletInfo, loading, refreshAll } = useDashboard()
  const products = rawProducts as any[]
  const orders = rawOrders as any[]
  const categories = rawCategories as any[]
  const { createProduct, updateProduct, deleteProduct } = useProducts(products)

  // UI state
  const [activeTab, setActiveTab] = useState<DashboardTab>("marketplace")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState("all")
  const [selectedVariation, setSelectedVariation] = useState("all")
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { items, addItem } = useCartStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  const isAdmin = user?.role === "ADMIN"

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['marketplace', 'orders', 'wallet', 'admin', 'manage-products'].includes(tabParam)) {
      setActiveTab(tabParam as DashboardTab)
    }
  }, [searchParams])

  // Filter products based on selections
  useEffect(() => {
    let filtered = products

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }

    if (selectedProduct && selectedProduct !== "all") {
      filtered = filtered.filter(product => product.id === selectedProduct)
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedProduct])

  const handleAddToCart = (product: any, variation?: any, quantity: number = 1) => {
    const cartItem = {
      id: variation ? `${product.id}-${variation.id}` : product.id,
      name: variation ? `${product.name} - ${variation.name}` : product.name,
      price: variation ? variation.price : product.basePrice,
      image: product.image || "/api/placeholder/300/200",
      quantity,
      unit: product.unit,
      productId: product.id,
      variationId: variation?.id,
    }
    addItem(cartItem)
  }


  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const success = await deleteProduct(productId)
    if (success) {
      refreshAll()
    }
  }

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (response.ok) {
        refreshAll()
      } else {
        console.error('Error updating order status:', await response.text())
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const handleToggleStockStatus = async (product: any) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          inStock: !product.inStock
        }),
      })

      if (response.ok) {
        refreshAll()
      } else {
        console.error('Error updating stock status:', await response.text())
      }
    } catch (error) {
      console.error('Error toggling stock status:', error)
    }
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Access Restricted</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
              <div className="flex gap-3">
                <Button onClick={() => router.push("/auth/login")} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Sign In
                </Button>
                <Button onClick={() => router.push("/auth/register")} variant="outline" className="flex-1">
                  Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      >
        {activeTab === "marketplace" && (
          <MarketplaceTab
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            selectedProduct={selectedProduct}
            selectedVariation={selectedVariation}
            filteredProducts={filteredProducts}
            onCategoryChange={setSelectedCategory}
            onProductChange={setSelectedProduct}
            onVariationChange={setSelectedVariation}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            isAdmin={isAdmin}
            onOrderStatusChange={handleOrderStatusChange}
          />
        )}

        {activeTab === "wallet" && (
          <WalletTab walletInfo={walletInfo} />
        )}

        {isAdmin && activeTab === "admin" && (
          <AdminTab
            products={products}
            orders={orders}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {isAdmin && activeTab === "manage-products" && (
          <ManageProductsTab
            products={products}
            categories={categories}
            onDeleteProduct={handleDeleteProduct}
            onToggleStockStatus={handleToggleStockStatus}
          />
        )}
      </DashboardLayout>

    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}