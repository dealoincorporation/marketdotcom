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
import { NotificationModal } from "@/components/ui/notification-modal"
import { useNotification } from "@/hooks/useNotification"

// Import components
import MarketplaceTab from "./components/MarketplaceTab"
import OrdersTab from "./components/OrdersTab"
import WalletTab from "./components/WalletTab"
import AdminTab from "./components/AdminTab"
import ManageProductsTab from "./components/ManageProductsTab"
import ManageCategoriesTab from "./components/ManageCategoriesTab"
import ManageDeliveriesTab from "./components/ManageDeliveriesTab"
import ManageDeliveryFeesTab from "./components/ManageDeliveryFeesTab"
import ManageReferralsTab from "./components/ManageReferralsTab"
import ManagePointsTab from "./components/ManagePointsTab"
import NotificationsTab from "./components/NotificationsTab"
import AdminNotificationsTab from "./components/AdminNotificationsTab"
import TransactionsTab from "./components/TransactionsTab"
import { ProductForm } from "@/components/forms/product-form"

// Import hooks
import { useProducts } from "@/hooks/useProducts"
import { useCartStore } from "@/lib/cart-store"

// Import types
import { Product } from "@prisma/client"
import { getCartItemDisplayName } from "@/components/marketplace/utils"

type DashboardTab = "marketplace" | "orders" | "manage-products" | "manage-categories" | "manage-deliveries" | "manage-delivery-fees" | "manage-referrals" | "manage-points" | "wallet" | "transactions" | "admin" | "notifications" | "admin-notifications"

function DashboardContent() {
  // Custom hooks
  const { user } = useAuth()
  const { logout } = useAuth()
  const { products: rawProducts, categories: rawCategories, orders: rawOrders, walletInfo, loading, ordersLoading, refreshAll, refreshOrders } = useDashboard()
  const products = rawProducts as any[]
  const orders = rawOrders as any[]
  const categories = rawCategories as any[]
  const { createProduct, updateProduct, deleteProduct } = useProducts(products)
  const { notification, showConfirm, showError, showSuccess, closeNotification } = useNotification()

  // UI state
  const [activeTab, setActiveTab] = useState<DashboardTab>("marketplace")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [selectedBrand, setSelectedBrand] = useState("all")
  const [selectedPack, setSelectedPack] = useState("all")
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const { items, addItem } = useCartStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  const isAdmin = user?.role === "ADMIN"

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['marketplace', 'orders', 'wallet', 'transactions', 'admin', 'manage-products', 'manage-categories', 'manage-deliveries', 'manage-delivery-fees', 'manage-referrals', 'manage-points', 'notifications', 'admin-notifications'].includes(tabParam)) {
      setActiveTab(tabParam as DashboardTab)
    }
  }, [searchParams])

  // Filter products based on selections
  useEffect(() => {
    let filtered = products

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }

    if (selectedGroup && selectedGroup !== "all") {
      filtered = filtered.filter(product => (product.groupName || product.name) === selectedGroup)
    }

    if (selectedBrand && selectedBrand !== "all") {
      filtered = filtered.filter(product => product.id === selectedBrand)
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedGroup, selectedBrand])

  const handleAddToCart = (product: any, variation?: any, quantity: number = 1) => {
    // Handle base product selection (when variation is "base")
    let actualVariation = variation
    if (variation === "base") {
      actualVariation = undefined
    }

    const cartItem = {
      id: actualVariation ? `${product.id}-${actualVariation.id}` : `${product.id}-base`,
      name: getCartItemDisplayName(product.name, actualVariation ?? undefined),
      price: actualVariation ? actualVariation.price : product.basePrice,
      image: product.image || "/api/placeholder/300/200",
      quantity,
      unit: product.unit,
      productId: product.id,
      variationId: actualVariation?.id,
      variation: actualVariation,
      isAvailable: product.inStock && (!actualVariation || actualVariation.stock > 0),
      maxQuantity: actualVariation ? actualVariation.stock : product.stock,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      weight: actualVariation?.weightKg ?? product.weightKg ?? 0,
    }
    addItem(cartItem)
  }


  const handleDeleteProduct = async (productId: string) => {
    console.log('Delete product clicked for ID:', productId)
    console.log('User role:', user?.role)
    console.log('Is admin:', isAdmin)

    showConfirm(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      async () => {
        const success = await deleteProduct(productId)
        if (success) {
          console.log('Product deleted successfully, refreshing...')
          refreshAll()
        } else {
          console.error('Product deletion failed')
          showError('Delete Failed', 'Failed to delete product. Check console for details.')
        }
      }
    )
  }

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      })

      if (response.ok) {
        // Refresh orders immediately to show updated status
        await refreshOrders()
        showSuccess('Status Updated', `Order status has been updated to ${newStatus}`)
      } else {
        const errorData = await response.json()
        showError('Update Failed', errorData.error || 'Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      showError('Update Failed', 'Failed to update order status. Please try again.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleOrderDelete = async (orderId: string) => {
    showConfirm(
      'Delete Order',
      'Are you sure you want to delete this order? This action cannot be undone.',
      async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          })

          if (response.ok) {
            // Refresh orders
            refreshAll()
            showSuccess('Order Deleted', 'Order deleted successfully')
          } else {
            const errorData = await response.json()
            showError('Delete Failed', `Failed to delete order: ${errorData.error || 'Unknown error'}`)
          }
        } catch (error) {
          console.error('Error deleting order:', error)
          showError('Delete Failed', 'Failed to delete order. Please try again.')
        }
      }
    )
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
        onTabChange={(tab) => setActiveTab(tab)}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      >
        {activeTab === "marketplace" && (
          <MarketplaceTab
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            selectedGroup={selectedGroup}
            selectedBrand={selectedBrand}
            filteredProducts={filteredProducts}
            onCategoryChange={setSelectedCategory}
            onGroupChange={setSelectedGroup}
            onBrandChange={setSelectedBrand}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            isAdmin={isAdmin}
            onOrderStatusChange={handleOrderStatusChange}
            onOrderDelete={handleOrderDelete}
            updatingOrderId={updatingOrderId}
            onRefreshOrders={refreshOrders}
            ordersLoading={ordersLoading}
          />
        )}

        {activeTab === "wallet" && (
          <WalletTab walletInfo={walletInfo} onTabChange={setActiveTab} />
        )}

        {activeTab === "transactions" && (
          <TransactionsTab />
        )}

        {activeTab === "notifications" && (
          <NotificationsTab />
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

        {isAdmin && activeTab === "manage-categories" && (
          <ManageCategoriesTab
            categories={categories}
            onRefresh={refreshAll}
          />
        )}

        {isAdmin && activeTab === "manage-deliveries" && (
          <ManageDeliveriesTab
            isAdmin={isAdmin}
          />
        )}

        {activeTab === "manage-delivery-fees" && (
          <ManageDeliveryFeesTab isAdmin={isAdmin ?? false} />
        )}

        {isAdmin && activeTab === "manage-referrals" && (
          <ManageReferralsTab />
        )}

        {isAdmin && activeTab === "manage-points" && (
          <ManagePointsTab />
        )}

        {isAdmin && activeTab === "admin-notifications" && (
          <AdminNotificationsTab />
        )}
      </DashboardLayout>

      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
      />
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