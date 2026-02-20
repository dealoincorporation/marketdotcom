"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bell, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { NotificationModal } from "@/components/ui/notification-modal"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  orderId?: string | null
}

export function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; notificationId: string | null }>({
    isOpen: false,
    notificationId: null
  })

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications?limit=20', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Mark notification as read
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
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
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
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the click handler
    setDeleteModal({ isOpen: true, notificationId })
  }

  // Delete notification (confirmed)
  const confirmDelete = async () => {
    if (!deleteModal.notificationId) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/notifications/${deleteModal.notificationId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      const data = await response.json()

      if (response.ok) {
        // Remove from local state
        setNotifications(prev => {
          const filtered = prev.filter(n => n.id !== deleteModal.notificationId)
          setUnreadCount(filtered.filter(n => !n.isRead).length)
          return filtered
        })
        setDeleteModal({ isOpen: false, notificationId: null })
      } else {
        // Handle error - notification might have been deleted already
        console.error('Failed to delete notification:', data.error)
        // Still remove from UI if it was a "not found" error (already deleted)
        if (response.status === 404) {
          setNotifications(prev => {
            const filtered = prev.filter(n => n.id !== deleteModal.notificationId)
            setUnreadCount(filtered.filter(n => !n.isRead).length)
            return filtered
          })
        }
        setDeleteModal({ isOpen: false, notificationId: null })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      setDeleteModal({ isOpen: false, notificationId: null })
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    // Listen for custom refresh event (e.g., after wallet funding)
    const handleRefresh = () => {
      fetchNotifications()
    }
    window.addEventListener('refreshNotifications', handleRefresh)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('refreshNotifications', handleRefresh)
    }
  }, [])

  // Handle notification click - navigate to relevant page
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    setIsOpen(false)
    
    // Navigate based on notification type and orderId
    if (notification.orderId) {
      router.push(`/dashboard?tab=orders`)
    } else if (notification.type === 'WALLET') {
      router.push(`/dashboard?tab=wallet`)
    } else if (notification.type === 'DELIVERY') {
      router.push(`/dashboard?tab=orders`)
    } else if (notification.type === 'ORDER') {
      router.push(`/dashboard?tab=orders`)
    } else {
      // Default to orders tab
      router.push(`/dashboard?tab=orders`)
    }
  }

  // Get notification icon color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ORDER':
        return 'text-blue-500'
      case 'DELIVERY':
        return 'text-green-500'
      case 'WALLET':
        return 'text-orange-500'
      case 'PROMOTION':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 bg-orange-600 text-white text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[105]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed md:absolute right-4 md:right-0 left-4 md:left-auto top-20 md:top-full mt-0 md:mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 mx-auto md:mx-0 bg-white rounded-lg shadow-xl border border-gray-200 z-[110] max-h-[calc(100vh-6rem)] md:max-h-[500px] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="overflow-y-auto flex-1">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-2 text-sm">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`relative group w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-orange-50/50' : ''
                        }`}
                      >
                        <button
                          onClick={() => handleNotificationClick(notification)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 mt-0.5 ${getNotificationColor(notification.type)}`}>
                              <div className={`w-2 h-2 rounded-full ${!notification.isRead ? 'bg-orange-600' : 'bg-transparent'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => openDeleteModal(notification.id, e)}
                          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete notification"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <a
                    href="/dashboard?tab=notifications"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    View all notifications
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
