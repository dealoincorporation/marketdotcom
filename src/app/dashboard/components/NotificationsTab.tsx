"use client"

import { useState, useEffect } from "react"
import { Bell, Trash2, Check, CheckCheck, Filter } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  // Fetch notifications
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

  // Apply filter
  const applyFilter = (notifs: Notification[], currentFilter: typeof filter) => {
    let filtered = notifs
    
    if (currentFilter === "unread") {
      filtered = notifs.filter(n => !n.isRead)
    } else if (currentFilter !== "all") {
      filtered = notifs.filter(n => n.type === currentFilter)
    }
    
    setFilteredNotifications(filtered)
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
        applyFilter(
          notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n),
          filter
        )
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
        const updated = notifications.map(n => ({ ...n, isRead: true }))
        setNotifications(updated)
        applyFilter(updated, filter)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (notificationId: string) => {
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
        const updated = notifications.filter(n => n.id !== deleteModal.notificationId)
        setNotifications(updated)
        applyFilter(updated, filter)
        setDeleteModal({ isOpen: false, notificationId: null })
      } else {
        // Handle error - notification might have been deleted already
        console.error('Failed to delete notification:', data.error)
        // Still remove from UI if it was a "not found" error (already deleted)
        if (response.status === 404) {
          const updated = notifications.filter(n => n.id !== deleteModal.notificationId)
          setNotifications(updated)
          applyFilter(updated, filter)
        }
        setDeleteModal({ isOpen: false, notificationId: null })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      setDeleteModal({ isOpen: false, notificationId: null })
    }
  }

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    if (notification.orderId) {
      router.push(`/dashboard?tab=orders`)
    } else if (notification.type === 'WALLET') {
      router.push(`/dashboard?tab=wallet`)
    } else {
      router.push(`/dashboard?tab=orders`)
    }
  }

  // Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ORDER':
        return 'text-blue-500 bg-blue-50'
      case 'DELIVERY':
        return 'text-green-500 bg-green-50'
      case 'WALLET':
        return 'text-orange-500 bg-orange-50'
      case 'PROMOTION':
        return 'text-purple-500 bg-purple-50'
      default:
        return 'text-gray-500 bg-gray-50'
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    applyFilter(notifications, filter)
  }, [filter])

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'unread', 'ORDER', 'DELIVERY', 'WALLET', 'PROMOTION'] as const).map((filterOption) => (
          <Button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            variant={filter === filterOption ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter className="h-3 w-3" />
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading notifications...</p>
          </CardContent>
        </Card>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">
              {filter === "all" ? "No notifications yet" : `No ${filter.toLowerCase()} notifications`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                !notification.isRead ? 'border-orange-200 bg-orange-50/30' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className={`text-sm font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getNotificationColor(notification.type)}`}>
                            {notification.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteModal(notification.id)
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
