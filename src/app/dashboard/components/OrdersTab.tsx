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
  RefreshCw,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cleanCartItemNameForDisplay } from "@/components/marketplace/utils"

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
    postalCode?: string | null
    phone?: string
    scheduledDate?: string | Date
    scheduledTime?: string
    deliveryNotes?: string | null
  }
  deliveryFee?: number
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

  const handleExportOrders = () => {
    const list = filteredOrders.length > 0 ? filteredOrders : orders
    const headers = [
      'Order ID',
      'Order Date',
      'Customer Name',
      'Customer Email',
      'Status',
      'Delivery Date',
      'Delivery Time',
      'Address',
      'City',
      'State',
      'Postal Code',
      'Phone',
      'Delivery Notes',
      'Items Summary',
      'Subtotal (₦)',
      'Delivery Fee (₦)',
      'Total (₦)'
    ]
    const rows = list.map((order) => {
      const d = order.delivery
      const deliveryDate = d?.scheduledDate
        ? new Date(d.scheduledDate as string).toLocaleDateString('en-US', { dateStyle: 'short' })
        : ''
      const itemsSummary = (order.items || [])
        .map((item) => {
          const rawName = item.name ?? (item.product?.name ?? 'Item') + (item.variation?.name ? ` - ${item.variation.name}` : '')
          const displayName = cleanCartItemNameForDisplay(rawName)
          return `${item.quantity}x ${displayName}`
        })
        .join('; ')
      const customerName = order.user?.name ?? order.customerName ?? ''
      const customerEmail = order.user?.email ?? order.customerEmail ?? ''
      const subtotal = (order.totalAmount ?? order.total ?? 0) - (order.deliveryFee ?? 0)
      return [
        order.id,
        new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
        customerName,
        customerEmail,
        order.status,
        deliveryDate,
        d?.scheduledTime ?? '',
        d?.address ?? '',
        d?.city ?? '',
        d?.state ?? '',
        d?.postalCode ?? '',
        d?.phone ?? '',
        d?.deliveryNotes ?? '',
        itemsSummary,
        subtotal.toFixed(2),
        (order.deliveryFee ?? 0).toFixed(2),
        (order.finalAmount ?? order.totalAmount ?? order.total ?? 0).toFixed(2)
      ]
    })
    import('xlsx').then((XLSX) => {
      const data = [headers, ...rows]
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Orders')
      XLSX.writeFile(wb, `orders_export_${new Date().toISOString().slice(0, 10)}.xlsx`)
    })
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
      className="min-w-0 overflow-x-hidden w-full"
    >
      <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Orders</h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isAdmin ? 'Manage and track all customer orders' : 'Track your order history and status'}
          </p>
          {!isAdmin && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Status updates automatically refresh every 30 seconds
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onRefreshOrders && (
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || ordersLoading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 min-w-0"
            >
              <RefreshCw className={`h-4 w-4 shrink-0 ${isRefreshing || ordersLoading ? 'animate-spin' : ''}`} />
              <span className="truncate">Refresh</span>
            </Button>
          )}
          {isAdmin && orders.length > 0 && (
            <Button
              onClick={handleExportOrders}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 border-green-300 text-green-700 hover:bg-green-50 min-w-0 shrink-0"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Export to Excel</span>
              <span className="sm:hidden">Export</span>
            </Button>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <Card className="mb-4 sm:mb-6 md:mb-8 shadow-md overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
            <Truck className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span className="break-words">Filter Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
          <div className="w-full sm:max-w-xs">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full min-w-0">
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
      <div className="space-y-4 sm:space-y-6 min-w-0">
        {(ordersLoading || isRefreshing) && (
          <div className="text-center py-4 sm:py-6">
            <RefreshCw className="h-6 w-6 text-orange-600 animate-spin mx-auto mb-2" />
            <p className="text-xs sm:text-sm text-gray-600">Refreshing orders...</p>
          </div>
        )}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 sm:py-12 px-4"
          >
            <Truck className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 break-words">No orders found</h3>
            <p className="text-sm sm:text-base text-gray-600 break-words px-2">
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
              className="min-w-0"
            >
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4 p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-semibold break-all">Order #{order.id.slice(-8)}</CardTitle>
                      <Badge className={`flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 text-xs shrink-0 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="uppercase whitespace-nowrap">{normalizeStatus(order.status) === 'shipped' ? 'On the Way' : normalizeStatus(order.status)}</span>
                      </Badge>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1 min-w-0 shrink-0">
                      <div className="text-xl sm:text-2xl font-bold text-orange-600 tabular-nums">
                        {formatPrice(order?.finalAmount || order?.totalAmount || order?.total || 0)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span className="break-words">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6">
                  {/* Delivery Status Timeline */}
                  {!isAdmin && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg border border-orange-200 min-w-0">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4 min-w-0">
                        <Navigation className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 shrink-0" />
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">Delivery Status</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4 font-medium break-words">
                        {getStatusMessage(order.status)}
                      </p>
                      
                      {/* Status Timeline - horizontal scroll on mobile */}
                      <div className="relative -mx-1 min-w-0">
                        <div className="flex items-stretch justify-between overflow-x-auto gap-1 sm:gap-2 pb-2 sm:pb-0 scrollbar-thin min-w-0 overflow-y-hidden [scrollbar-width:thin]">
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
                              <div key={step.key} className="flex items-center flex-1 min-w-[64px] sm:min-w-0">
                                <div className="flex flex-col items-center flex-1 min-w-0">
                                  <div
                                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${getColorClasses(step.color, step.completed, step.current)}`}
                                  >
                                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                  </div>
                                  <p
                                    className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 text-center font-medium break-words max-w-[64px] sm:max-w-none ${getTextColor(step.color, step.completed, step.current)}`}
                                  >
                                    {step.label}
                                  </p>
                                </div>
                                {!isLast && (
                                  <div
                                    className={`flex-1 min-w-[6px] sm:min-w-0 h-0.5 mx-1 sm:mx-2 shrink-0 ${getLineColor(step.color, step.completed)}`}
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
                  <div className="mb-4 sm:mb-6 min-w-0">
                    <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Order Items</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {order.items.map((item) => {
                        // Prefer stored display name (cart name at order time), then product + variation; clean so "14 1 Carton" → "1 Carton"
                        const rawName = item.name || item.product?.name || (item.variation?.name ? `${item.product?.name ?? 'Product'} - ${item.variation.name}` : null) || 'Product'
                        const itemName = cleanCartItemNameForDisplay(rawName)
                        // Get unit from product or legacy unit field
                        const itemUnit = item.product?.unit || item.unit || 'item'
                        // Use unitPrice and totalPrice from API, fallback to legacy price field
                        const unitPrice = item.unitPrice ?? item.price ?? 0
                        const totalPrice = item.totalPrice ?? (item.quantity * unitPrice)
                        
                        return (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-gray-100 last:border-b-0 min-w-0">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm sm:text-base break-words">{itemName}</div>
                              <div className="text-xs sm:text-sm text-gray-600 break-words">
                                {item.quantity} {itemUnit} × {formatPrice(unitPrice)}
                              </div>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                              <div className="font-medium text-gray-900 text-sm sm:text-base tabular-nums">
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
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg min-w-0">
                      <h4 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Customer Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                        <div className="min-w-0 break-words">
                          <span className="font-medium">Name:</span> {order.user?.name || order.customerName || 'N/A'}
                        </div>
                        <div className="min-w-0 break-words">
                          <span className="font-medium">Email:</span>{' '}
                          <span className="break-all">{order.user?.email || order.customerEmail || 'N/A'}</span>
                        </div>
                        {(order.delivery?.address || order.deliveryAddress) && (
                          <div className="md:col-span-2 min-w-0">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-0.5 text-gray-500 shrink-0" />
                              <div className="min-w-0">
                                <span className="font-medium">Delivery Address:</span>
                                <div className="text-gray-600 break-words">
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
                    <div className="pt-3 sm:pt-4 border-t border-gray-200 space-y-3 min-w-0">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs sm:text-sm text-gray-600 shrink-0">
                          Change order status:
                        </div>
                        <Select
                          value={normalizeStatus(order.status)}
                          onValueChange={(newStatus) => onOrderStatusChange(order.id, newStatus)}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger className="w-full sm:w-48 min-w-0">
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
                            className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-50 hover:border-red-700 flex items-center justify-center gap-2"
                          >
                            <Trash2 className="h-4 w-4 shrink-0" />
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