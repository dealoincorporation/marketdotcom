"use client"

import { useState, useEffect } from "react"
import { Bell, Send, Users, Trash2, Eye, Filter, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NotificationModal } from "@/components/ui/notification-modal"
import toast from "react-hot-toast"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  orderId?: string | null
  user?: {
    id: string
    name: string | null
    email: string
  }
}

export default function AdminNotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "ORDER" | "DELIVERY" | "WALLET" | "PROMOTION">("all")
  
  // Broadcast notification form
  const [showBroadcastForm, setShowBroadcastForm] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState("")
  const [broadcastMessage, setBroadcastMessage] = useState("")
  const [broadcastType, setBroadcastType] = useState("PROMOTION")
  const [isSending, setIsSending] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; notificationId: string | null }>({
    isOpen: false,
    notificationId: null
  })

  // Fetch all notifications (admin can see all)
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications?limit=200', {
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
      toast.error('Failed to load notifications')
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

  // Broadcast notification to all users
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!broadcastTitle.trim()) {
      toast.error('Title is required')
      return
    }

    setIsSending(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/notifications/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: broadcastTitle,
          message: broadcastMessage || broadcastTitle,
          type: broadcastType,
          broadcastToAll: true
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Notification sent to ${data.count} users!`)
        setBroadcastTitle("")
        setBroadcastMessage("")
        setShowBroadcastForm(false)
        // Refresh notifications
        setTimeout(() => fetchNotifications(), 1000)
      } else {
        toast.error(data.error || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error broadcasting notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setIsSending(false)
    }
  }

  // Open delete modal
  const openDeleteModal = (notificationId: string) => {
    setDeleteModal({ isOpen: true, notificationId })
  }

  // Confirm delete
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

      if (response.ok) {
        toast.success('Notification deleted')
        const updated = notifications.filter(n => n.id !== deleteModal.notificationId)
        setNotifications(updated)
        applyFilter(updated, filter)
        setDeleteModal({ isOpen: false, notificationId: null })
      } else {
        toast.error('Failed to delete notification')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
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
  const totalNotifications = notifications.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Notifications</h2>
          <p className="text-gray-600 mt-1">
            {totalNotifications} total • {unreadCount} unread
          </p>
        </div>
        <Button
          onClick={() => setShowBroadcastForm(!showBroadcastForm)}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {showBroadcastForm ? 'Cancel' : 'Broadcast Notification'}
        </Button>
      </div>

      {/* Broadcast Form */}
      {showBroadcastForm && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Broadcast Notification to All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <Label htmlFor="broadcast-title">Title *</Label>
                <Input
                  id="broadcast-title"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g., New Feature Available!"
                  required
                />
              </div>
              <div>
                <Label htmlFor="broadcast-message">Message</Label>
                <Textarea
                  id="broadcast-message"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter notification message..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="broadcast-type">Type</Label>
                <select
                  id="broadcast-type"
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="PROMOTION">Promotion</option>
                  <option value="ORDER">Order</option>
                  <option value="DELIVERY">Delivery</option>
                  <option value="WALLET">Wallet</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSending} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {isSending ? 'Sending...' : 'Send to All Users'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBroadcastForm(false)
                    setBroadcastTitle("")
                    setBroadcastMessage("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
              className={`hover:shadow-md transition-shadow ${
                !notification.isRead ? 'border-orange-200 bg-orange-50/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'ORDER' ? 'bg-blue-100 text-blue-600' :
                    notification.type === 'DELIVERY' ? 'bg-green-100 text-green-600' :
                    notification.type === 'WALLET' ? 'bg-orange-100 text-orange-600' :
                    notification.type === 'PROMOTION' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {notification.user && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {notification.user.name || notification.user.email}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            notification.type === 'ORDER' ? 'bg-blue-100 text-blue-700' :
                            notification.type === 'DELIVERY' ? 'bg-green-100 text-green-700' :
                            notification.type === 'WALLET' ? 'bg-orange-100 text-orange-700' :
                            notification.type === 'PROMOTION' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {notification.type}
                          </span>
                          {!notification.isRead && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => openDeleteModal(notification.id)}
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
