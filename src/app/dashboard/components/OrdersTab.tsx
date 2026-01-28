"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Trash2,
  Navigation,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Order {
  id: string
  status: string
  totalAmount?: number
  finalAmount?: number
  total?: number
  createdAt: string
  items: Array<{
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product?: {
      id: string
      name: string
      unit?: string
    }
    variation?: {
      id: string
      name: string
    }
    // Legacy fields for backward compatibility
    name?: string
    price?: number
    unit?: string
  }>
  user?: {
    id: string
    name: string | null
    email: string
  }
  customerName?: string
  customerEmail?: string
  deliveryAddress?: string
  delivery?: {
    address: string
    city: string
    state: string
  }
}

interface OrdersTabProps {
  orders: Order[]
  isAdmin: boolean
  onOrderStatusChange: (orderId: string, newStatus: string) => void
  onOrderDelete?: (orderId: string) => void
  updatingOrderId?: string | null
  onRefreshOrders?: () => void
  ordersLoading?: boolean
}

export default function OrdersTab({ orders, isAdmin, onOrderStatusChange, onOrderDelete, updatingOrderId, onRefreshOrders, ordersLoading }: OrdersTabProps) {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh orders every 30 seconds when customer is viewing orders tab
  useEffect(() => {
    if (!isAdmin && onRefreshOrders) {
      const interval = setInterval(() => {
        onRefreshOrders()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isAdmin, onRefreshOrders])

  // Refresh orders when component mounts or when tab becomes visible
  useEffect(() => {
    if (!isAdmin && onRefreshOrders) {
      // Refresh immediately when component mounts
      onRefreshOrders()
      
      // Also refresh when page becomes visible (user switches back to tab)
      const handleVisibilityChange = () => {
        if (!document.hidden && onRefreshOrders) {
          onRefreshOrders()
        }
      }
      
      document.addEventListener('visibilitychange', handleVisibilityChange)
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAdmin, onRefreshOrders])

  const handleRefresh = async () => {
    if (onRefreshOrders) {
      setIsRefreshing(true)
      await onRefreshOrders()
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  // Normalize status for display (ON_DELIVERY -> shipped)
  const normalizeStatus = (status: string) => {
    if (status === 'ON_DELIVERY' || status === 'on_delivery') return 'shipped'
    return status.toLowerCase()
  }

  const getStatusIcon = (status: string) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
      case 'processing':
        return <Package className="h-4 w-4" />
      case 'shipped':
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price == null || isNaN(price)) {
      return '₦0.00'
    }
    return `₦${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'all') return true
    return order.status.toLowerCase() === selectedStatus.toLowerCase()
  })

  const orderStatuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  // Get order status steps for timeline
  const getOrderStatusSteps = (currentStatus: string) => {
    const allSteps = [
      { key: 'pending', label: 'Order Placed', icon: Clock, color: 'yellow' },
      { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, color: 'blue' },
      { key: 'processing', label: 'Processing', icon: Package, color: 'blue' },
      { key: 'shipped', label: 'On the Way', icon: Truck, color: 'purple' },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'green' },
    ]

    const normalizedStatus = normalizeStatus(currentStatus)
    const currentIndex = allSteps.findIndex(step => step.key === normalizedStatus)
    
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }))
  }

  // Get status message
  const getStatusMessage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Your order is pending confirmation'
      case 'confirmed':
        return 'Your order has been confirmed and is being prepared'
      case 'processing':
        return 'Your order is being processed and packaged'
      case 'shipped':
        return '🚚 Your order is on the way! Track your delivery below'
      case 'delivered':
        return '✅ Your order has been delivered successfully'
      case 'cancelled':
        return 'Your order has been cancelled'
      default:
        return 'Order status update'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Manage and track all customer orders' : 'Track your order history and status'}
          </p>
          {!isAdmin && (
            <p className="text-sm text-gray-500 mt-1">
              Status updates automatically refresh every 30 seconds
            </p>
          )}
        </div>
        {onRefreshOrders && (
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || ordersLoading}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing || ordersLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>Filter Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Orders" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {orderStatuses.map(status => (
                  <SelectItem key={status} value={status} className="hover:bg-orange-50 focus:bg-orange-50">
                    {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <div className="space-y-6">
        {(ordersLoading || isRefreshing) && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 text-orange-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Refreshing orders...</p>
          </div>
        )}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {selectedStatus === 'all'
                ? "You haven't placed any orders yet."
                : `No orders with status "${selectedStatus}".`
              }
            </p>
          </motion.div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
                      <Badge className={`flex items-center space-x-1 px-3 py-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="uppercase">{normalizeStatus(order.status) === 'shipped' ? 'On the Way' : normalizeStatus(order.status)}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPrice(order?.finalAmount || order?.totalAmount || order?.total || 0)}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Delivery Status Timeline */}
                  {!isAdmin && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2 mb-4">
                        <Navigation className="h-5 w-5 text-orange-600" />
                        <h4 className="font-semibold text-gray-900">Delivery Status</h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 font-medium">
                        {getStatusMessage(order.status)}
                      </p>
                      
                      {/* Status Timeline */}
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          {getOrderStatusSteps(order.status).map((step, index) => {
                            const Icon = step.icon
                            const isLast = index === getOrderStatusSteps(order.status).length - 1
                            
                            // Get color classes based on step color
                            const getColorClasses = (color: string, completed: boolean, current: boolean) => {
                              if (completed) {
                                switch (color) {
                                  case 'yellow': return 'bg-yellow-500 border-yellow-500 text-white'
                                  case 'blue': return 'bg-blue-500 border-blue-500 text-white'
                                  case 'purple': return 'bg-purple-500 border-purple-500 text-white'
                                  case 'green': return 'bg-green-500 border-green-500 text-white'
                                  default: return 'bg-gray-500 border-gray-500 text-white'
                                }
                              }
                              if (current) {
                                switch (color) {
                                  case 'yellow': return 'bg-white border-yellow-500 text-yellow-500 ring-2 ring-yellow-200'
                                  case 'blue': return 'bg-white border-blue-500 text-blue-500 ring-2 ring-blue-200'
                                  case 'purple': return 'bg-white border-purple-500 text-purple-500 ring-2 ring-purple-200'
                                  case 'green': return 'bg-white border-green-500 text-green-500 ring-2 ring-green-200'
                                  default: return 'bg-white border-gray-500 text-gray-500 ring-2 ring-gray-200'
                                }
                              }
                              return 'bg-gray-100 border-gray-300 text-gray-400'
                            }

                            const getTextColor = (color: string, completed: boolean, current: boolean) => {
                              if (completed || current) {
                                switch (color) {
                                  case 'yellow': return 'text-yellow-600'
                                  case 'blue': return 'text-blue-600'
                                  case 'purple': return 'text-purple-600'
                                  case 'green': return 'text-green-600'
                                  default: return 'text-gray-600'
                                }
                              }
                              return 'text-gray-400'
                            }

                            const getLineColor = (color: string, completed: boolean) => {
                              if (completed) {
                                switch (color) {
                                  case 'yellow': return 'bg-yellow-500'
                                  case 'blue': return 'bg-blue-500'
                                  case 'purple': return 'bg-purple-500'
                                  case 'green': return 'bg-green-500'
                                  default: return 'bg-gray-500'
                                }
                              }
                              return 'bg-gray-200'
                            }
                            
                            return (
                              <div key={step.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${getColorClasses(step.color, step.completed, step.current)}`}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <p
                                    className={`text-xs mt-2 text-center font-medium ${getTextColor(step.color, step.completed, step.current)}`}
                                  >
                                    {step.label}
                                  </p>
                                </div>
                                {!isLast && (
                                  <div
                                    className={`flex-1 h-0.5 mx-2 ${getLineColor(step.color, step.completed)}`}
                                  />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => {
                        // Get item name from product, variation, or legacy name field
                        const itemName = item.product?.name || item.variation?.name || item.name || 'Product'
                        // Get unit from product or legacy unit field
                        const itemUnit = item.product?.unit || item.unit || 'item'
                        // Use unitPrice and totalPrice from API, fallback to legacy price field
                        const unitPrice = item.unitPrice ?? item.price ?? 0
                        const totalPrice = item.totalPrice ?? (item.quantity * unitPrice)
                        
                        return (
                          <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{itemName}</div>
                              <div className="text-sm text-gray-600">
                                {item.quantity} {itemUnit} × {formatPrice(unitPrice)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {formatPrice(totalPrice)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Customer Info (Admin Only) */}
                  {isAdmin && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {order.user?.name || order.customerName || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {order.user?.email || order.customerEmail || 'N/A'}
                        </div>
                        {(order.delivery?.address || order.deliveryAddress) && (
                          <div className="md:col-span-2">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                              <div>
                                <span className="font-medium">Delivery Address:</span>
                                <div className="text-gray-600">
                                  {order.delivery?.address 
                                    ? `${order.delivery.address}, ${order.delivery.city}, ${order.delivery.state}`
                                    : order.deliveryAddress || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Change order status:
                        </div>
                        <Select
                          value={normalizeStatus(order.status)}
                          onValueChange={(newStatus) => onOrderStatusChange(order.id, newStatus)}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-gray-200 shadow-lg">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">🚚 Shipped (On the Way)</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {onOrderDelete && (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => onOrderDelete(order.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Order
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}