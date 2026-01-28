"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DollarSign, Search, Save, X, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNotification } from "@/hooks/useNotification"
import { NotificationModal } from "@/components/ui/notification-modal"
import { DeliveryFeeModal } from "./DeliveryFeeModal"

interface Product {
  id: string
  name: string
  deliveryFee: number | null
  category?: { name: string }
}

interface ManageDeliveryFeesTabProps {
  isAdmin: boolean
}

export default function ManageDeliveryFeesTab({ isAdmin }: ManageDeliveryFeesTabProps) {
  const { notification, showSuccess, showError, closeNotification } = useNotification()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editedFees, setEditedFees] = useState<Record<string, string>>({})
  const [showModal, setShowModal] = useState(false)
  const [applyingFee, setApplyingFee] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/products', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data)
      
      // Initialize edited fees with current values
      const initialFees: Record<string, string> = {}
      data.forEach((product: Product) => {
        const fee = product.deliveryFee
        initialFees[product.id] = fee === null || fee === undefined ? '' : fee === 0 ? '0' : fee.toString()
      })
      setEditedFees(initialFees)
    } catch (err) {
      showError('Failed to load products', err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFeeChange = (productId: string, value: string) => {
    setEditedFees(prev => ({ ...prev, [productId]: value }))
  }

  const handleBulkUpdate = async (fee: number | null) => {
    // Open modal for product selection
    setShowModal(true)
  }

  const handleModalConfirm = async (selectedProductIds: string[], fee: number | null) => {
    if (selectedProductIds.length === 0) {
      showError('No products selected', 'Please select at least one product')
      return
    }

    try {
      setApplyingFee(true)
      const token = localStorage.getItem('token')
      
      // Update selected products with the fee
      const updates: Record<string, string> = {}
      selectedProductIds.forEach(productId => {
        updates[productId] = fee === null ? '' : fee.toString()
      })
      setEditedFees(prev => ({ ...prev, ...updates }))
      
      // Save immediately
      await handleSaveForProducts(selectedProductIds, fee)
      
      setShowModal(false)
      showSuccess('Delivery fees updated successfully!', `Updated ${selectedProductIds.length} product(s)`)
    } catch (err) {
      showError('Failed to update delivery fees', err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setApplyingFee(false)
    }
  }

  const handleSaveForProducts = async (productIds: string[], fee: number | null) => {
    const token = localStorage.getItem('token')
    const feeValue = fee === null ? null : fee

    await Promise.all(
      productIds.map(productId =>
        fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ deliveryFee: feeValue })
        })
      )
    )
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')

      // Prepare updates
      const updates = products.map(product => {
        const feeValue = editedFees[product.id] || ''
        return {
          id: product.id,
          deliveryFee: feeValue === '' ? null : feeValue === '0' ? 0 : parseFloat(feeValue)
        }
      })

      // Update products in batches
      const batchSize = 10
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)
        await Promise.all(
          batch.map(update =>
            fetch(`/api/products/${update.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ deliveryFee: update.deliveryFee })
            })
          )
        )
      }

      showSuccess('Success', 'Delivery fees updated successfully!')
      await fetchProducts()
    } catch (err) {
      showError('Failed to save delivery fees', err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const hasChanges = products.some(product => {
    const currentFee = product.deliveryFee === null || product.deliveryFee === undefined 
      ? '' 
      : product.deliveryFee === 0 
        ? '0' 
        : product.deliveryFee.toString()
    return editedFees[product.id] !== currentFee
  })

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to manage delivery fees.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Delivery Fee Management</h1>
        <p className="text-sm sm:text-base text-gray-600">Set delivery fees for individual products or bulk update</p>
      </div>

      {/* Bulk Actions */}
      <Card className="mb-6 shadow-md border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <DollarSign className="h-5 w-5" />
            <span>Bulk Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleBulkUpdate(null)}
              variant="outline"
              className="border-gray-300"
            >
              Set All to Default
            </Button>
            <Button
              onClick={() => handleBulkUpdate(0)}
              variant="outline"
              className="border-green-300 text-green-700"
            >
              Set All to Free
            </Button>
            <Button
              onClick={() => handleBulkUpdate(null)}
              variant="outline"
              className="border-blue-300 text-blue-700"
            >
              Set Custom Fee for Selected Products
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="mb-6 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600">{searchQuery ? 'Try a different search term' : 'No products available'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Current Fee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Delivery Fee (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const fee = product.deliveryFee
                    const currentFee = fee === null || fee === undefined ? 'Default' : fee === 0 ? 'Free' : `₦${fee}`
                    const currentFeeString = fee === null || fee === undefined ? '' : fee === 0 ? '0' : fee.toString()
                    const hasChange = editedFees[product.id] !== currentFeeString
                    
                    return (
                      <tr key={product.id} className={`border-b border-gray-100 hover:bg-gray-50 ${hasChange ? 'bg-yellow-50' : ''}`}>
                        <td className="py-4 px-4 font-medium text-gray-900">{product.name}</td>
                        <td className="py-4 px-4 text-gray-600">
                          {product.category?.name || 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={product.deliveryFee === 0 ? "default" : "outline"}>
                            {currentFee}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editedFees[product.id] || ''}
                              onChange={(e) => handleFeeChange(product.id, e.target.value)}
                              placeholder="Default"
                              className="w-32 h-10"
                            />
                            {hasChange && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Empty = Default | 0 = Free | Number = Custom fee
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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

      <DeliveryFeeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleModalConfirm}
        products={products}
        loading={applyingFee}
      />
    </motion.div>
  )
}
