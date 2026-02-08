"use client"

import { Calendar, Clock, Truck, Check, AlertTriangle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { DeliverySlot } from "../types"
import { useAuth } from "@/contexts/AuthContext"

interface DeliveryScheduleSectionProps {
  deliverySlots: DeliverySlot[]
  deliverySlotsLoading: boolean
  deliveryDate: string
  deliveryTime: string
  deliveryNotes: string
  onDeliveryDateChange: (date: string) => void
  onDeliveryTimeChange: (time: string) => void
  onDeliveryNotesChange: (notes: string) => void
  showDeliveryDateDropdown: boolean
  onShowDeliveryDateDropdown: (show: boolean) => void
  dropdownRef: React.RefObject<HTMLDivElement | null>
  onShowCreateSlotsModal: () => void
}

export function DeliveryScheduleSection({
  deliverySlots,
  deliverySlotsLoading,
  deliveryDate,
  deliveryTime,
  deliveryNotes,
  onDeliveryDateChange,
  onDeliveryTimeChange,
  onDeliveryNotesChange,
  showDeliveryDateDropdown,
  onShowDeliveryDateDropdown,
  dropdownRef,
  onShowCreateSlotsModal,
}: DeliveryScheduleSectionProps) {
  const { user } = useAuth()
  const uniqueDates = [...new Set(deliverySlots.map(slot => new Date(slot.date).toISOString().split('T')[0]))]
  const slotsForDate = deliverySlots.filter(
    slot => new Date(slot.date).toISOString().split('T')[0] === deliveryDate && slot.isAvailable
  )
  const availableSlotsForDate = slotsForDate

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden w-full max-w-full min-w-0">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6 min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center flex-wrap">
          <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 flex-shrink-0" />
          <span className="break-words">Schedule Your Delivery</span>
        </h2>
        <p className="text-orange-100 mt-1 text-sm sm:text-base break-words">Choose when you'd like your order delivered</p>
      </div>
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-w-0">
        {/* Selected Delivery Date Display */}
        {deliveryDate && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-green-700 font-medium mb-1">Selected Delivery Date</p>
                  <p className="text-lg font-bold text-green-900">
                    {new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  {deliveryTime && (
                    <p className="text-sm text-green-700 mt-1">Time: {deliveryTime}</p>
                  )}
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <Button
                  onClick={onShowCreateSlotsModal}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Slot
                </Button>
              )}
            </div>
          </div>
        )}

        {deliverySlots.length === 0 && !deliverySlotsLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800 mb-1">Delivery dates not available</h4>
                <p className="text-xs text-yellow-700 mb-3">
                  No delivery slots have been configured yet. Configure delivery options to continue with your order.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  {user?.role === 'ADMIN' && (
                    <>
                      <Button
                        onClick={onShowCreateSlotsModal}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Create Delivery Slots
                      </Button>
                      <Button
                        onClick={() => window.open('/dashboard?tab=deliveries', '_blank')}
                        variant="outline"
                        size="sm"
                        className="text-xs px-3 py-1 h-8 border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        Advanced Setup
                      </Button>
                    </>
                  )}
                  {user?.role !== 'ADMIN' && (
                    <Button
                      onClick={onShowCreateSlotsModal}
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Configure Slots
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-orange-600" />
              Preferred Delivery Date
            </Label>
            {user?.role === 'ADMIN' && !deliveryDate && (
              <Button
                onClick={onShowCreateSlotsModal}
                size="sm"
                variant="outline"
                className="text-xs px-3 py-1 h-8 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Slot
              </Button>
            )}
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => onShowDeliveryDateDropdown(!showDeliveryDateDropdown)}
              disabled={deliverySlotsLoading || deliverySlots.length === 0}
              className="w-full h-12 border-2 focus:border-orange-500 bg-white text-sm sm:text-base px-3 py-2 text-left rounded-md flex items-center justify-between hover:border-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-0"
            >
              <span className={`${deliveryDate ? "text-gray-900" : "text-gray-500"} break-words text-left`}>
                {deliverySlotsLoading
                  ? "Loading delivery dates..."
                  : deliveryDate
                  ? `${new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long' })}, ${new Date(deliveryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                  : deliverySlots.length === 0
                  ? "No delivery dates available"
                  : "Select delivery date"
                }
              </span>
              <span className="text-gray-400">▼</span>
            </button>

            {showDeliveryDateDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-md shadow-2xl z-[9999] max-h-60 overflow-y-auto">
                {deliverySlotsLoading ? (
                  <div className="px-3 py-4 text-center text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    Loading delivery dates...
                  </div>
                ) : uniqueDates.length === 0 ? (
                  <div className="px-3 py-6 text-center">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">No delivery dates available</p>
                    <p className="text-xs text-gray-400">Please contact support or try again later</p>
                  </div>
                ) : (
                  uniqueDates.map(date => (
                    <button
                      key={`date-${date}`}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onDeliveryDateChange(date)
                        onShowDeliveryDateDropdown(false)
                      }}
                      className="w-full h-12 sm:h-14 hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2 text-left border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex flex-col items-start min-w-0 w-full">
                        <span className="font-medium text-gray-900 text-sm sm:text-base break-words">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 break-words">
                          {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {deliveryDate && (
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center">
              <Clock className="h-4 w-4 mr-2 text-orange-600" />
              Preferred Time Slot
            </Label>
            <RadioGroup value={deliveryTime} onValueChange={onDeliveryTimeChange} className="space-y-2 sm:space-y-3">
              {availableSlotsForDate.map(slot => {
                const atCapacity = slot.currentOrders >= slot.maxOrders
                return (
                  <div key={slot.id} className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    deliveryTime === slot.timeSlot
                      ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
                      : atCapacity
                        ? 'border-amber-200 bg-amber-50/50'
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                  }`}>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <RadioGroupItem value={slot.timeSlot} id={slot.id} className="flex-shrink-0" />
                      <Label htmlFor={slot.id} className="flex-1 cursor-pointer min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-gray-900 text-sm sm:text-base block truncate">{slot.timeSlot}</span>
                            {slot.description?.trim() ? (
                              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 break-words">{slot.description.trim()}</p>
                            ) : (
                              <p className="text-xs sm:text-sm text-gray-600">Fast & reliable delivery</p>
                            )}
                            {atCapacity && (
                              <p className="text-xs font-medium text-amber-700 mt-1">Slot full — order noted for next available day</p>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="deliveryNotes" className="text-sm font-semibold text-gray-700 flex items-center flex-wrap">
            <span className="break-words">📝 Delivery Notes</span> <span className="text-gray-500 ml-1">(Optional)</span>
          </Label>
          <Textarea
            id="deliveryNotes"
            value={deliveryNotes}
            onChange={(e) => onDeliveryNotesChange(e.target.value)}
            placeholder="Any special instructions for delivery..."
            rows={3}
            className="border-2 focus:border-orange-500 resize-none bg-white text-sm sm:text-base min-h-[80px] sm:min-h-[100px] w-full"
          />
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-3 sm:p-4 md:p-5">
          <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-xl flex-shrink-0">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-orange-900 mb-2 text-sm sm:text-base break-words">🚚 Delivery Information</h3>
              <ul className="text-xs sm:text-sm text-orange-800 space-y-1 sm:space-y-1.5">
                <li className="flex items-start">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="break-words">Orders delivered within 4 hours of scheduled time</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="break-words">Place orders before 10 AM for same-day delivery</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="break-words">Orders after 3 PM delivered next day</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="break-words">Delivery fees calculated per product</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="break-words">SMS & email updates on delivery status</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
