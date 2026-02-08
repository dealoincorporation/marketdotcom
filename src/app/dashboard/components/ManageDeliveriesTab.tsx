"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Users,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NotificationModal } from "@/components/ui/notification-modal"
import { useNotification } from "@/hooks/useNotification"
import { Textarea } from "@/components/ui/textarea"
import { buildTimeSlotString, parseTimeSlotTo24h } from "@/lib/delivery-slots"

interface DeliverySlot {
  id: string
  date: string
  timeSlot: string
  isAvailable: boolean
  maxOrders: number
  currentOrders: number
  price?: number
  description?: string
  createdAt: string
  updatedAt: string
}

interface ManageDeliveriesTabProps {
  isAdmin: boolean
}

export default function ManageDeliveriesTab({ isAdmin }: ManageDeliveriesTabProps) {
  const { notification, showConfirmPromise, closeNotification } = useNotification()
  const [slots, setSlots] = useState<DeliverySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    date: "",
    timeSlot: "",
    startTime: "",
    endTime: "",
    maxOrders: 10,
    price: "",
    description: ""
  })

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const fetchSlots = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/delivery-slots', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        throw new Error('Failed to fetch delivery slots')
      }

      const data = await response.json()
      setSlots(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')
      const url = editingSlot ? `/api/delivery-slots/${editingSlot.id}` : '/api/delivery-slots'
      const method = editingSlot ? 'PUT' : 'POST'

      const timeSlotToSend =
        formData.timeSlot ||
        (formData.startTime && formData.endTime ? buildTimeSlotString(formData.startTime, formData.endTime) : "")

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          date: formData.date,
          timeSlot: timeSlotToSend,
          maxOrders: parseInt(formData.maxOrders.toString()),
          price: formData.price ? parseFloat(formData.price) : null,
          description: formData.description || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save delivery slot')
      }

      await fetchSlots()
      setEditingSlot(null)
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleEdit = (slot: DeliverySlot) => {
    setEditingSlot(slot)
    const parsed = parseTimeSlotTo24h(slot.timeSlot)
    setFormData({
      date: new Date(slot.date).toISOString().split('T')[0],
      timeSlot: slot.timeSlot,
      startTime: parsed?.start ?? "",
      endTime: parsed?.end ?? "",
      maxOrders: slot.maxOrders,
      price: slot.price?.toString() || "",
      description: slot.description || ""
    })
    // Scroll to the form
    document.querySelector('#delivery-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleDelete = async (slotId: string) => {
    const confirmed = await showConfirmPromise(
      'Delete Delivery Slot',
      'Are you sure you want to delete this delivery slot?'
    )
    if (!confirmed) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/delivery-slots/${slotId}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete delivery slot')
      }

      await fetchSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const toggleAvailability = async (slot: DeliverySlot) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/delivery-slots/${slot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ isAvailable: !slot.isAvailable })
      })

      if (!response.ok) {
        throw new Error('Failed to update slot availability')
      }

      await fetchSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const resetForm = () => {
    setFormData({
      date: "",
      timeSlot: "",
      startTime: "",
      endTime: "",
      maxOrders: 10,
      price: "",
      description: ""
    })
  }

  const openAddForm = () => {
    setEditingSlot(null)
    resetForm()
    // Scroll to the form
    document.querySelector('#delivery-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Statistics
  const totalSlots = slots.length
  const availableSlots = slots.filter(s => s.isAvailable).length
  const bookedSlots = slots.reduce((sum, s) => sum + s.currentOrders, 0)
  const totalRevenue = slots.reduce((sum, s) => sum + (s.price || 0) * s.currentOrders, 0)

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to manage delivery slots.</p>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Delivery Management</h1>
        <p className="text-sm sm:text-base text-gray-600">Configure available delivery dates and time slots</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-xs sm:text-sm font-medium">Total Slots</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-900">{totalSlots}</p>
                </div>
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
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
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-xs sm:text-sm font-medium">Available</p>
                  <p className="text-lg sm:text-xl font-bold text-green-900">{availableSlots}</p>
                </div>
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-xs sm:text-sm font-medium">Booked Orders</p>
                  <p className="text-lg sm:text-xl font-bold text-orange-900">{bookedSlots}</p>
                </div>
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-xs sm:text-sm font-medium">Revenue</p>
                  <p className="text-base sm:text-lg font-bold text-purple-900">{formatPrice(totalRevenue)}</p>
                </div>
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add Slot Section - Always Visible, responsive no overflow */}
      <Card className="mb-6 shadow-md border-orange-200 min-w-0 overflow-hidden w-full max-w-full">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 px-4 sm:px-6 py-4 sm:py-5">
          <CardTitle className="flex items-center space-x-2 text-orange-800 text-base sm:text-lg">
            <Plus className="h-5 w-5 flex-shrink-0" />
            <span className="break-words">Add New Delivery Slot</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 min-w-0 overflow-x-hidden">
          <form id="delivery-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 min-w-0 max-w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0">
              <div className="space-y-3">
                <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                  Delivery Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="h-12 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500 w-full max-w-full min-w-0"
                  placeholder="dd/mm/yyyy"
                />
                <p className="text-xs text-gray-500">Select the delivery date</p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Time Slot <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 min-w-0">
                  <div className="min-w-0">
                    <Label htmlFor="startTime" className="text-xs text-gray-500 block mb-1">Start time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => {
                        const start = e.target.value
                        const end = formData.endTime
                        const slot = start && end ? buildTimeSlotString(start, end) : formData.timeSlot
                        setFormData(prev => ({ ...prev, startTime: start, timeSlot: slot || prev.timeSlot }))
                      }}
                      className="h-12 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500 w-full min-w-0"
                    />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="endTime" className="text-xs text-gray-500 block mb-1">End time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => {
                        const end = e.target.value
                        const start = formData.startTime
                        const slot = start && end ? buildTimeSlotString(start, end) : formData.timeSlot
                        setFormData(prev => ({ ...prev, endTime: end, timeSlot: slot || prev.timeSlot }))
                      }}
                      className="h-12 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500 w-full min-w-0"
                    />
                  </div>
                </div>
                {formData.startTime && formData.endTime && (
                  <p className="text-xs text-green-700 font-medium">Preview: {buildTimeSlotString(formData.startTime, formData.endTime)}</p>
                )}
                <div className="pt-1 border-t border-gray-100">
                  <Label htmlFor="timeSlot" className="text-xs text-gray-500 block mb-1">Or type custom</Label>
                  <Input
                    id="timeSlot"
                    type="text"
                    value={formData.timeSlot}
                    onChange={(e) => {
                      const v = e.target.value
                      const parsed = parseTimeSlotTo24h(v)
                      setFormData(prev => ({
                        ...prev,
                        timeSlot: v,
                        startTime: parsed?.start ?? "",
                        endTime: parsed?.end ?? ""
                      }))
                    }}
                    placeholder="e.g. 9:00 AM - 12:00 PM"
                    required
                    className="h-10 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 min-w-0">
                  <span className="text-xs text-gray-500 self-center shrink-0">Quick fill:</span>
                  {["9:00 AM - 12:00 PM", "12:00 PM - 3:00 PM", "3:00 PM - 6:00 PM", "6:00 PM - 9:00 PM"].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 border-gray-300 hover:bg-orange-50 hover:border-orange-300"
                      onClick={() => {
                        const parsed = parseTimeSlotTo24h(preset)
                        setFormData(prev => ({
                          ...prev,
                          timeSlot: preset,
                          startTime: parsed?.start ?? "",
                          endTime: parsed?.end ?? ""
                        }))
                      }}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="maxOrders" className="text-sm font-medium text-gray-700">
                  Max Orders <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxOrders"
                  type="number"
                  value={formData.maxOrders}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxOrders: parseInt(e.target.value) || 10 }))}
                  min="1"
                  className="h-12 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500">Maximum number of orders for this slot</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                  Extra Fee (₦)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Optional"
                  min="0"
                  step="0.01"
                  className="h-12 text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500">Additional delivery fee (optional)</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Any special notes about this delivery slot..."
                rows={3}
                className="text-base border-gray-300 focus:border-orange-500 focus:ring-orange-500 resize-none w-full max-w-full min-w-0"
              />
              <p className="text-xs text-gray-500">Add any additional information about this delivery slot</p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-2 h-11 text-base border-gray-300 hover:bg-gray-50"
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto px-8 py-2 h-11 text-base bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                {editingSlot ? 'Update Delivery Slot' : 'Create Delivery Slot'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delivery Slots Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Delivery Slots ({slots.length})</span>
            <Badge variant="outline" className="text-xs">
              {slots.filter(s => s.isAvailable).length} available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading delivery slots...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Slots</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchSlots} variant="outline">
                Try Again
              </Button>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Delivery Slots</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first delivery slot.</p>
              <Button onClick={openAddForm} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add First Slot
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile: Card Layout */}
              <div className="block sm:hidden">
                <div className="divide-y divide-gray-200">
                  {slots.map((slot) => (
                    <div key={slot.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-gray-900">{formatDate(slot.date)}</span>
                        </div>
                        <Badge variant={slot.isAvailable ? "default" : "secondary"}>
                          {slot.isAvailable ? "Available" : "Unavailable"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-1 text-gray-900">{slot.timeSlot}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Capacity:</span>
                          <span className={`ml-1 ${slot.currentOrders >= slot.maxOrders ? 'text-red-600' : 'text-gray-900'}`}>
                            {slot.currentOrders}/{slot.maxOrders}
                          </span>
                        </div>
                        {slot.price && slot.price > 0 && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Extra Fee:</span>
                            <span className="ml-1 font-medium text-orange-600">{formatPrice(slot.price)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          Created: {new Date(slot.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleAvailability(slot)}
                            className={`h-8 w-8 p-0 ${slot.isAvailable ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}`}
                          >
                            {slot.isAvailable ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(slot)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(slot.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Table Layout */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Time Slot</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Capacity</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots.map((slot) => (
                        <tr key={slot.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {formatDate(slot.date)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">{slot.timeSlot}</td>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${slot.currentOrders >= slot.maxOrders ? 'text-red-600' : 'text-gray-900'}`}>
                              {slot.currentOrders}/{slot.maxOrders}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {slot.price && slot.price > 0 ? (
                              <span className="font-medium text-orange-600">{formatPrice(slot.price)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={slot.isAvailable ? "default" : "secondary"}>
                              {slot.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAvailability(slot)}
                                title={slot.isAvailable ? "Make Unavailable" : "Make Available"}
                                className={slot.isAvailable ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                              >
                                {slot.isAvailable ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(slot)}
                                title="Edit Slot"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(slot.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete Slot"
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
              </div>
            </>
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
    </motion.div>
  )
}