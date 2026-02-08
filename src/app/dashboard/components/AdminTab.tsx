"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Save,
  X,
  Trophy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  categoryId: string
  category: { id: string; name: string }
  stock: number
  unit: string
  inStock: boolean
  variations: Array<{
    id: string
    name: string
    price: number
    stock: number
  }>
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    unit: string
  }>
}

interface AdminTabProps {
  products: Product[]
  orders: Order[]
  onDeleteProduct: (productId: string) => void
}

export default function AdminTab({
  products = [],
  orders = [],
  onDeleteProduct
}: AdminTabProps) {
  const [showProducts, setShowProducts] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<any>(null)
  const [newPrice, setNewPrice] = useState("")
  const [priceStartDate, setPriceStartDate] = useState("")
  const [priceEndDate, setPriceEndDate] = useState("")
  const [showReferralSettings, setShowReferralSettings] = useState(false)
  const [referralSettings, setReferralSettings] = useState({
    referrerReward: 100,
    refereeReward: 50,
    isActive: true,
    description: "Refer a friend and earn rewards!"
  })
  const [referralSettingsLoading, setReferralSettingsLoading] = useState(false)
  const [showPointsSettings, setShowPointsSettings] = useState(false)
  const [pointsSettingsLoading, setPointsSettingsLoading] = useState(false)
  const [pointsSettings, setPointsSettings] = useState({
    amountThreshold: 50000,
    periodDays: 30,
    pointsPerThreshold: 1,
    pointsPerNaira: 0.01,
    nairaPerPoint: 10,
    minimumPointsToConvert: 100,
    conversionCooldownDays: 30,
    isActive: true,
    description: "Earn points on every purchase and convert to cash!"
  })

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '₦0'
    }
    return `₦${price.toLocaleString()}`
  }

  const totalRevenue = (orders || []).reduce((sum, order) => sum + (order.total || 0), 0)
  const totalOrders = (orders || []).length
  const totalProducts = (products || []).length
  const lowStockProducts = (products || []).filter(product => product.stock < 10).length

  const recentOrders = (orders || []).slice(0, 5)
  const lowStockItems = (products || []).filter(product => product.stock < 10)

  const handlePriceManagement = (product: any) => {
    setSelectedProductForPrice(product)
    // TODO: Fetch price history for this product
    setPriceHistory([
      { date: "2024-01-01", price: product.basePrice - 500, type: "regular" },
      { date: "2024-01-15", price: product.basePrice, type: "current" },
    ])
    setShowPriceModal(true)
  }

  const handleToggleStockStatus = async (product: Product) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...product,
          inStock: !product.inStock
        }),
      })

      if (response.ok) {
        // Refresh products - you might want to implement a refresh function
        window.location.reload() // Temporary solution
      } else {
        console.error('Failed to update stock status')
      }
    } catch (error) {
      console.error('Error toggling stock status:', error)
    }
  }

  const handleUpdatePrice = async () => {
    if (!selectedProductForPrice || !newPrice) return

    try {
      // TODO: Implement price update API call
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/products/${selectedProductForPrice.id}/price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          price: parseFloat(newPrice),
          startDate: priceStartDate,
          endDate: priceEndDate
        }),
      })

      if (response.ok) {
        // Refresh products
        // TODO: Implement refresh
        setShowPriceModal(false)
        setNewPrice("")
        setPriceStartDate("")
        setPriceEndDate("")
      }
    } catch (error) {
      console.error('Error updating price:', error)
    }
  }

  const handleSaveReferralSettings = async () => {
    try {
      setReferralSettingsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/referrals/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(referralSettings)
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setReferralSettings(updatedSettings)
        alert('Referral settings updated successfully!')
      } else {
        alert('Failed to update referral settings')
      }
    } catch (error) {
      console.error('Error saving referral settings:', error)
      alert('Error updating referral settings')
    } finally {
      setReferralSettingsLoading(false)
    }
  }

  // Fetch referral settings
  useEffect(() => {
    const fetchReferralSettings = async () => {
      try {
        setReferralSettingsLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch('/api/referrals/settings', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })

        if (response.ok) {
          const settings = await response.json()
          setReferralSettings(settings)
        } else {
          console.error('Failed to fetch referral settings')
        }
      } catch (error) {
        console.error('Error fetching referral settings:', error)
      } finally {
        setReferralSettingsLoading(false)
      }
    }

    fetchReferralSettings()
  }, [])

  // Fetch points settings
  useEffect(() => {
    const fetchPointsSettings = async () => {
      try {
        const response = await fetch('/api/points-settings')
        if (response.ok) {
          const data = await response.json()
          setPointsSettings({
            amountThreshold: data.amountThreshold ?? 50000,
            periodDays: data.periodDays ?? 30,
            pointsPerThreshold: data.pointsPerThreshold ?? 1,
            pointsPerNaira: data.pointsPerNaira ?? 0.01,
            nairaPerPoint: data.nairaPerPoint ?? 10,
            minimumPointsToConvert: data.minimumPointsToConvert ?? 100,
            conversionCooldownDays: data.conversionCooldownDays ?? 30,
            isActive: data.isActive !== false,
            description: data.description ?? "Earn points on every purchase and convert to cash!"
          })
        }
      } catch (error) {
        console.error('Error fetching points settings:', error)
      }
    }
    fetchPointsSettings()
  }, [])

  const handleSavePointsSettings = async () => {
    try {
      setPointsSettingsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/points-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(pointsSettings)
      })
      if (response.ok) {
        alert('Points settings saved successfully!')
      } else {
        const err = await response.json().catch(() => ({}))
        alert(err?.error || 'Failed to save points settings')
      }
    } catch (error) {
      console.error('Error saving points settings:', error)
      alert('Error saving points settings')
    } finally {
      setPointsSettingsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage products, orders, and oversee platform operations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-900">{formatPrice(totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-bold text-green-900">{totalOrders}</p>
                </div>
                <Package className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-purple-900">{totalProducts}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Low Stock Alert</p>
                  <p className="text-2xl font-bold text-orange-900">{lowStockProducts}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Content Toggle */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button
          variant={showProducts ? "default" : "outline"}
          onClick={() => {
            setShowProducts(true)
            setShowReferralSettings(false)
          }}
          className="flex items-center space-x-2"
        >
          <Package className="h-4 w-4" />
          <span>Products ({products.length})</span>
        </Button>
        <Button
          variant={!showProducts && !showReferralSettings ? "default" : "outline"}
          onClick={() => {
            setShowProducts(false)
            setShowReferralSettings(false)
          }}
          className="flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>Orders ({orders.length})</span>
        </Button>
        <Button
          variant={showReferralSettings ? "default" : "outline"}
          onClick={() => {
            setShowProducts(false)
            setShowReferralSettings(true)
            setShowPointsSettings(false)
          }}
          className="flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>Referral Settings</span>
        </Button>
        <Button
          variant={showPointsSettings ? "default" : "outline"}
          onClick={() => {
            setShowProducts(false)
            setShowReferralSettings(false)
            setShowPointsSettings(true)
          }}
          className="flex items-center space-x-2"
        >
          <Trophy className="h-4 w-4" />
          <span>Points Settings</span>
        </Button>
      </div>

      {/* Products Section */}
      {showProducts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
            <Link href="/dashboard/add-product">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <TrendingUp className="h-5 w-5" />
                  <span>Low Stock Alert</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockItems.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-orange-200">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.stock} {product.unit} remaining</div>
                      </div>
                      <Badge variant="destructive">Low Stock</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Products Table */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>All Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-600 line-clamp-1">{product.description}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{product.category.name}</td>
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {formatPrice(product.basePrice)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                            {product.stock} {product.unit}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant={product.inStock ? "default" : "secondary"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/dashboard/edit-product/${product.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                title="Edit Product"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStockStatus(product)}
                              title={product.inStock ? "Put Out of Stock" : "Put In Stock"}
                              className={product.inStock ? "text-yellow-600 hover:text-yellow-700 hover:border-yellow-300" : "text-green-600 hover:text-green-700 hover:border-green-300"}
                            >
                              {product.inStock ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePriceManagement(product)}
                              title="Manage Price"
                              className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Orders Section */}
      {!showProducts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>

          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Card key={order.id} className="shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium text-gray-900">Order #{order.id.slice(-8)}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">{formatPrice(order.total)}</div>
                      <Badge className="capitalize">{order.status}</Badge>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} • Total: {formatPrice(order.total)}
                  </div>
                </CardContent>
              </Card>
            ))}

            {recentOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">Orders will appear here once customers start placing them.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Points Settings Section */}
      {showPointsSettings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Points Program Settings</h2>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Configure Points & Rewards</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Earn points per purchase: every ₦X spent = Y points (e.g. ₦50,000 = 1 point; ₦100,000 = 2 points)</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount threshold (₦)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pointsSettings.amountThreshold}
                    onChange={(e) => setPointsSettings({
                      ...pointsSettings,
                      amountThreshold: parseInt(e.target.value, 10) || 50000
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-gray-500">Every purchase up to this amount = one block (e.g. 50,000)</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Points per threshold
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={pointsSettings.pointsPerThreshold}
                    onChange={(e) => setPointsSettings({
                      ...pointsSettings,
                      pointsPerThreshold: parseInt(e.target.value, 10) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-gray-500">Points per block (e.g. 1 or 10). ₦100K with ₦50K threshold = 2 × this</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Points per ₦1 Spent (legacy)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pointsSettings.pointsPerNaira}
                    onChange={(e) => setPointsSettings({
                      ...pointsSettings,
                      pointsPerNaira: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-gray-500">Optional; earning uses threshold above</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ₦ per Point (Conversion)
                  </label>
                  <input
                    type="number"
                    value={pointsSettings.nairaPerPoint}
                    onChange={(e) => setPointsSettings({
                      ...pointsSettings,
                      nairaPerPoint: parseFloat(e.target.value) || 1
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-gray-500">Cash value per point when converting</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Points to Convert
                  </label>
                  <input
                    type="number"
                    value={pointsSettings.minimumPointsToConvert}
                    onChange={(e) => setPointsSettings({
                      ...pointsSettings,
                      minimumPointsToConvert: parseInt(e.target.value) || 100
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Conversion Cooldown (Days)
                  </label>
                  <input
                    type="number"
                    value={pointsSettings.conversionCooldownDays}
                    onChange={(e) => setPointsSettings({
                      ...pointsSettings,
                      conversionCooldownDays: parseInt(e.target.value) || 30
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Program Description
                </label>
                <textarea
                  value={pointsSettings.description}
                  onChange={(e) => setPointsSettings({
                    ...pointsSettings,
                    description: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe the points program to users"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pointsActive"
                  checked={pointsSettings.isActive}
                  onChange={(e) => setPointsSettings({
                    ...pointsSettings,
                    isActive: e.target.checked
                  })}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="pointsActive" className="text-sm font-medium text-gray-700">
                  Points program is active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setPointsSettings({
                    amountThreshold: 50000,
                    periodDays: 30,
                    pointsPerThreshold: 1,
                    pointsPerNaira: 0.01,
                    nairaPerPoint: 10,
                    minimumPointsToConvert: 100,
                    conversionCooldownDays: 30,
                    isActive: true,
                    description: "Earn points on every purchase and convert to cash!"
                  })}
                >
                  Reset to Default
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={handleSavePointsSettings}
                  disabled={pointsSettingsLoading}
                >
                  {pointsSettingsLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Referral Settings Section */}
      {showReferralSettings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Referral Program Settings</h2>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Configure Referral Rewards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Referrer Reward (₦)
                  </label>
                  <input
                    type="number"
                    value={referralSettings.referrerReward}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      referrerReward: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-gray-500">Amount referrer receives when someone signs up</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Referee Reward (₦)
                  </label>
                  <input
                    type="number"
                    value={referralSettings.refereeReward}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      refereeReward: parseFloat(e.target.value) || 0
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-gray-500">Amount new user receives on first purchase</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Program Description
                </label>
                <textarea
                  value={referralSettings.description}
                  onChange={(e) => setReferralSettings({
                    ...referralSettings,
                    description: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Describe the referral program to users"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="referralActive"
                  checked={referralSettings.isActive}
                  onChange={(e) => setReferralSettings({
                    ...referralSettings,
                    isActive: e.target.checked
                  })}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="referralActive" className="text-sm font-medium text-gray-700">
                  Referral program is active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline">
                  Reset to Default
                </Button>
                <Button
                  onClick={handleSaveReferralSettings}
                  disabled={referralSettingsLoading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {referralSettingsLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Price Management Modal */}
      {showPriceModal && selectedProductForPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Price Management - {selectedProductForPrice.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Price */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Current Price</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatPrice(selectedProductForPrice.basePrice)}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                </div>
              </div>

              {/* Price History */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Price History</h4>
                <div className="space-y-2">
                  {priceHistory.map((priceEntry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="font-medium">{formatPrice(priceEntry.price)}</div>
                        <div className="text-sm text-gray-600">{priceEntry.date}</div>
                      </div>
                      <Badge variant={priceEntry.type === 'current' ? 'default' : 'secondary'}>
                        {priceEntry.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Set New Price */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Set New Price</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Price</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="Enter new price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date (Optional)</label>
                    <input
                      type="date"
                      value={priceStartDate}
                      onChange={(e) => setPriceStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                    <input
                      type="date"
                      value={priceEndDate}
                      onChange={(e) => setPriceEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPriceModal(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePrice}
                  disabled={!newPrice}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Update Price
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  )
}