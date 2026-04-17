"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Trash2,
  Check,
  CheckCheck,
  Filter,
  Package,
  Truck,
  Wallet,
  Zap,
  ChevronRight,
  Info
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { NotificationModal } from "@/components/ui/notification-modal"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  orderId?: string | null
}

export default function NotificationsTab() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "ORDER" | "DELIVERY" | "WALLET" | "PROMOTION">("all")
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; notificationId: string | null }>({
    isOpen: false,
    notificationId: null
  })

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications?limit=100', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        applyFilter(data, filter)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilter = (notifs: Notification[], currentFilter: typeof filter) => {
    let filtered = notifs
    if (currentFilter === "unread") {
      filtered = notifs.filter(n => !n.isRead)
    } else if (currentFilter !== "all") {
      filtered = notifs.filter(n => n.type === currentFilter)
    }
    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal.notificationId) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notifications/${deleteModal.notificationId}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      })
      if (response.ok || response.status === 404) {
        setNotifications(notifications.filter(n => n.id !== deleteModal.notificationId))
        setDeleteModal({ isOpen: false, notificationId: null })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      setDeleteModal({ isOpen: false, notificationId: null })
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) markAsRead(notification.id)
    if (notification.orderId) router.push(`/dashboard?tab=orders`)
    else if (notification.type === 'WALLET') router.push(`/dashboard?tab=wallet`)
    else router.push(`/dashboard?tab=orders`)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER': return <Package className="h-5 w-5" />
      case 'DELIVERY': return <Truck className="h-5 w-5" />
      case 'WALLET': return <Wallet className="h-5 w-5" />
      case 'PROMOTION': return <Zap className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  const getNotificationColors = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-100 text-gray-400 border-gray-100'
    switch (type) {
      case 'ORDER': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'DELIVERY': return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'WALLET': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
      case 'PROMOTION': return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilter(notifications, filter)
  }, [filter, notifications])

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg relative">
              <Bell className="h-6 w-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Notifications</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Real-time account and order updates</p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="h-12 px-6 glass-effect border border-white/60 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/80 transition-all flex items-center gap-2 group shadow-sm"
          >
            <CheckCheck className="h-4 w-4 text-green-600" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-effect border border-white/60 rounded-[2rem] p-3 flex flex-wrap items-center gap-2 shadow-sm sticky top-4 z-20 backdrop-blur-xl">
        {(['all', 'unread', 'ORDER', 'DELIVERY', 'WALLET', 'PROMOTION'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setFilter(opt)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === opt
                ? 'bg-gray-900 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-900 hover:bg-white/50'
              }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="glass-effect border border-white/60 rounded-[3rem] p-24 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-gray-900/10 border-t-gray-900 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="glass-effect border border-white/60 rounded-[3rem] p-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Bell className="h-10 w-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">No Notifications</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs mx-auto">You are all caught up.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative overflow-hidden glass-effect border transition-all duration-500 rounded-[2rem] p-6 sm:p-8 cursor-pointer ${!notif.isRead
                      ? 'border-orange-500/30 bg-white/60 premium-shadow'
                      : 'border-white/60 opacity-80 premium-shadow-sm'
                    }`}
                >
                  <div className="flex items-start gap-6 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 transition-transform group-hover:scale-110 duration-500 ${getNotificationColors(notif.type, notif.isRead)}`}>
                      {getNotificationIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getNotificationColors(notif.type, notif.isRead)}`}>
                            {notif.type}
                          </span>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <h3 className={`text-lg font-black tracking-tight leading-tight mb-2 ${notif.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                        {notif.title}
                      </h3>
                      <p className={`text-sm font-bold leading-relaxed max-w-2xl ${notif.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notif.message}
                      </p>

                      <div className="mt-6 flex items-center gap-4">
                        <button className="h-8 px-4 bg-gray-900/5 group-hover:bg-gray-900 text-gray-400 group-hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                          Open <ChevronRight className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteModal({ isOpen: true, notificationId: notif.id })
                          }}
                          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Glassmorphic Glow for unread */}
                  {!notif.isRead && (
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/5 blur-[80px] rounded-full pointer-events-none" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <NotificationModal
        isOpen={deleteModal.isOpen}
        type="confirm"
        title="Delete Notification"
        message="Are you sure you want to delete this notification? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, notificationId: null })}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
