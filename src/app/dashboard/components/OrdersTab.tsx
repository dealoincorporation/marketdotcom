import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  MapPin,
  Calendar,
  Trash2,
  Navigation,
  RefreshCw,
  Download,
  ArrowRight,
  ChevronDown,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
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
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders)
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId)
    } else {
      newExpanded.add(orderId)
    }
    setExpandedOrders(newExpanded)
  }

  useEffect(() => {
    if (!isAdmin && onRefreshOrders) {
      const interval = setInterval(() => {
        onRefreshOrders()
      }, 30000)
      return () => clearInterval(interval)
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
      'Order ID', 'Order Date', 'Customer Name', 'Customer Email', 'Status',
      'Address', 'City', 'State', 'Phone', 'Items Summary', 'Total (₦)'
    ]
    const rows = list.map((order) => {
      const d = order.delivery
      const itemsSummary = (order.items || [])
        .map((item) => {
          const rawName = item.name ?? (item.product?.name ?? 'Item') + (item.variation?.name ? ` - ${item.variation.name}` : '')
          return `${item.quantity}x ${cleanCartItemNameForDisplay(rawName)}`
        })
        .join('; ')
      return [
        order.id,
        new Date(order.createdAt).toLocaleString(),
        order.user?.name ?? order.customerName ?? '',
        order.user?.email ?? order.customerEmail ?? '',
        order.status,
        d?.address ?? '',
        d?.city ?? '',
        d?.state ?? '',
        d?.phone ?? '',
        itemsSummary,
        (order.finalAmount ?? order.totalAmount ?? order.total ?? 0).toFixed(2)
      ]
    })

    // Simple CSV export for now to keep it lightweight
    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  const normalizeStatus = (status: string) => {
    if (status === 'ON_DELIVERY' || status === 'on_delivery') return 'shipped'
    return status.toLowerCase()
  }

  const getStatusIcon = (status: string) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'confirmed': case 'processing': return <Package className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case 'pending': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
      case 'confirmed': case 'processing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'shipped': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      case 'delivered': return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  const formatPrice = (price: number | undefined | null) => {
    if (price == null || isNaN(price)) return '₦0.00'
    return `₦${price.toLocaleString()}`
  }

  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'all') return true
    return order.status.toLowerCase() === selectedStatus.toLowerCase()
  })

  const orderStatuses = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Orders</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {isAdmin ? 'Customer Orders & Fulfillment' : 'Your purchase history'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onRefreshOrders && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || ordersLoading}
              className="h-12 px-6 glass-effect border border-white/60 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/80 transition-all flex items-center gap-2 group shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-orange-600 ${isRefreshing || ordersLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              Refresh
            </button>
          )}
          {isAdmin && orders.length > 0 && (
            <button
              onClick={handleExportOrders}
              className="h-12 px-6 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 group shadow-xl"
            >
              <Download className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
              Export Records
            </button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <div className="glass-effect border border-white/60 rounded-[2rem] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        {orderStatuses.map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedStatus === status
              ? 'bg-gray-900 text-white shadow-lg shadow-black/10'
              : 'text-gray-400 hover:text-gray-900 hover:bg-white/50'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="glass-effect border border-white/60 rounded-[3rem] p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No Orders Found</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest max-w-xs mx-auto">
              You haven't placed any orders yet.
            </p>
          </div>
        ) : (
          filteredOrders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative"
            >
              <Card className={`overflow-hidden glass-effect border border-white/60 rounded-[2.5rem] transition-all duration-500 hover:shadow-xl ${expandedOrders.has(order.id) ? 'premium-shadow' : 'premium-shadow-sm'
                }`}>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/60">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-2">
                          Order <span className="text-gray-400">#</span>{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                            {normalizeStatus(order.status)}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-10">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Valuation</p>
                        <h4 className="text-3xl font-black text-gray-900 tracking-tighter tabular-nums">
                          {formatPrice(order?.finalAmount || order?.totalAmount || order?.total)}
                        </h4>
                      </div>
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${expandedOrders.has(order.id) ? 'bg-gray-900 text-white shadow-xl' : 'glass-effect border border-white/60 text-gray-400 hover:text-gray-900'
                          }`}
                      >
                        <ChevronDown className={`h-6 w-6 transition-transform duration-500 ${expandedOrders.has(order.id) ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedOrders.has(order.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Order Items */}
                          <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Package className="h-4 w-4 text-orange-600" />
                              <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Order Items</h5>
                            </div>
                            {order.items.map((item) => {
                              const rawName = item.name || item.product?.name || (item.variation?.name ? `${item.product?.name ?? 'Product'} - ${item.variation.name}` : 'Product')
                              return (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-white/40 border border-white/60 rounded-2xl">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400">
                                      {item.quantity}x
                                    </div>
                                    <div>
                                      <p className="font-black text-gray-900 text-sm tracking-tight">{cleanCartItemNameForDisplay(rawName)}</p>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatPrice(item.unitPrice ?? item.price)} per {item.product?.unit || item.unit || 'unit'}</p>
                                    </div>
                                  </div>
                                  <span className="font-black text-gray-900 tabular-nums">{formatPrice(item.totalPrice ?? (item.quantity * (item.unitPrice ?? item.price ?? 0)))}</span>
                                </div>
                              )
                            })}
                          </div>

                          {/* Logistics & Admin */}
                          <div className="space-y-6">
                            <div className="p-6 bg-gray-900 text-white rounded-[2rem] shadow-xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Navigation className="h-16 w-16" />
                              </div>
                              <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Delivery Details</h5>
                              <div className="space-y-4 relative z-10">
                                <div className="flex items-start gap-4">
                                  <MapPin className="h-5 w-5 text-orange-500 shrink-0 mt-1" />
                                  <div>
                                    <p className="font-bold text-sm leading-relaxed">
                                      {order.delivery?.address
                                        ? `${order.delivery.address}, ${order.delivery.city}, ${order.delivery.state}`
                                        : order.deliveryAddress || 'Address Undetermined'}
                                    </p>
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Confirmed Address</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Recipent</p>
                                    <p className="text-xs font-bold">{order.user?.name || order.customerName || 'Anonymous User'}</p>
                                  </div>
                                  {order.delivery?.phone && (
                                    <div className="text-right">
                                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Line</p>
                                      <p className="text-xs font-bold">{order.delivery.phone}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Admin Controls Area */}
                            {isAdmin && (
                              <div className="p-6 bg-white/40 border-2 border-dashed border-gray-200 rounded-[2rem]">
                                <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Order Controls</h5>
                                <div className="space-y-3">
                                  <Select
                                    value={normalizeStatus(order.status)}
                                    onValueChange={(newStatus) => onOrderStatusChange(order.id, newStatus)}
                                    disabled={updatingOrderId === order.id}
                                  >
                                    <SelectTrigger className="w-full h-12 bg-white border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-gray-200 shadow-2xl rounded-2xl">
                                      {orderStatuses.slice(1).map(status => (
                                        <SelectItem key={status} value={status} className="uppercase text-[9px] font-black tracking-widest py-3">
                                          {status}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  {onOrderDelete && (
                                    <button
                                      onClick={() => onOrderDelete(order.id)}
                                      className="w-full h-12 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Delete Record
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}