"use client"

import { Calendar, Clock, Truck, Check, AlertTriangle, Plus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { DeliverySlot } from "../types"
import { useAuth } from "@/contexts/AuthContext"

const DEFAULT_DELIVERY_INFO_POINTS = [
  "Orders delivered within 4 hours of scheduled time",
  "Place orders before 10 AM for same-day delivery",
  "Orders after 3 PM delivered next day",
  "Delivery fees calculated per product",
  "SMS & email updates on delivery status",
]

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
  deliveryInfoPoints?: string[]
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
  deliveryInfoPoints = [],
}: DeliveryScheduleSectionProps) {
  const { user } = useAuth()
  const points = deliveryInfoPoints.filter(Boolean).length > 0 ? deliveryInfoPoints.filter(Boolean) : DEFAULT_DELIVERY_INFO_POINTS
  const uniqueDates = [...new Set(deliverySlots.map(slot => new Date(slot.date).toISOString().split('T')[0]))]
  const slotsForDate = deliverySlots.filter(
    slot => new Date(slot.date).toISOString().split('T')[0] === deliveryDate && slot.isAvailable
  )
  const availableSlotsForDate = slotsForDate

  return (
    <div className="bg-white/85 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/70 overflow-hidden w-full transition-all duration-500">
      {/* Section Header */}
      <div className="bg-gray-900 p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Calendar className="h-40 w-40 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Calendar className="h-6 w-6 text-orange-400" />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Delivery Schedule</h2>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
            Choose a delivery date and time from available slots. <br className="hidden sm:block" />
            Live slot status: <span className="text-orange-400 font-black">Available</span>
          </p>
        </div>
      </div>

      <div className="p-8 sm:p-10 space-y-10">
        {/* Selected Date Summary Node */}
        {deliveryDate && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-6 sm:p-8 flex items-center justify-between group hover:bg-emerald-50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Delivery Date Selected</p>
                <p className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight">
                  {new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {deliveryTime && (
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3 text-emerald-600" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{deliveryTime}</span>
                  </div>
                )}
              </div>
            </div>
            {user?.role === 'ADMIN' && (
              <Button
                onClick={onShowCreateSlotsModal}
                className="h-12 px-6 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" /> Adjust Slots
              </Button>
            )}
          </div>
        )}

        {deliverySlots.length === 0 && !deliverySlotsLoading && (
          <div className="bg-orange-50/50 border border-orange-100 rounded-[2rem] p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-orange-100 text-orange-600 rounded-2xl animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black text-orange-900 uppercase tracking-[0.2em] mb-2">No Delivery Slots Available</h4>
                <p className="text-xs font-bold text-orange-800/80 leading-relaxed mb-6">
                  Delivery slots are currently unavailable for this area. Please try again later.
                </p>
                {user?.role === 'ADMIN' && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={onShowCreateSlotsModal}
                      className="h-12 px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Create Slots
                    </Button>
                    <Button
                      onClick={() => window.open('/dashboard?tab=deliveries', '_blank')}
                      variant="outline"
                      className="h-12 px-6 border-orange-200 text-orange-700 hover:bg-orange-50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Manage Delivery Settings
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Date Selector Matrix */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Select Delivery Date</Label>
            {user?.role === 'ADMIN' && !deliveryDate && (
              <button
                onClick={onShowCreateSlotsModal}
                className="text-[9px] font-black text-orange-600 uppercase tracking-widest hover:underline"
              >
                + Create Slot
              </button>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => onShowDeliveryDateDropdown(!showDeliveryDateDropdown)}
              disabled={deliverySlotsLoading || deliverySlots.length === 0}
              className="w-full h-20 border-2 border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-900 rounded-[1.5rem] px-8 flex items-center justify-between transition-all duration-300 group disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${deliveryDate ? "text-gray-900" : "text-gray-400"}`}>
                  {deliverySlotsLoading
                    ? "Loading available dates..."
                    : deliveryDate
                      ? `${new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long' })}, ${new Date(deliveryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : "Select delivery date"
                  }
                </span>
              </div>
              <div className={`transition-transform duration-300 ${showDeliveryDateDropdown ? 'rotate-180' : ''}`}>
                <Truck className="h-4 w-4 text-gray-300 group-hover:text-gray-900" />
              </div>
            </button>

            <AnimatePresence>
              {showDeliveryDateDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_40px_80px_-16px_rgba(0,0,0,0.1)] z-[100] max-h-80 overflow-y-auto custom-scrollbar p-3"
                >
                  {deliverySlotsLoading ? (
                    <div className="py-10 text-center space-y-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading dates...</p>
                    </div>
                  ) : uniqueDates.length === 0 ? (
                    <div className="py-10 text-center space-y-4">
                      <Calendar className="h-10 w-10 text-gray-200 mx-auto" />
                      <div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">No Available Dates</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Please check again later</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {uniqueDates.map(date => (
                        <button
                          key={`date-${date}`}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onDeliveryDateChange(date)
                            onShowDeliveryDateDropdown(false)
                          }}
                          className="w-full p-6 text-left rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="block text-[11px] font-black text-gray-900 uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                              </span>
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">
                                {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="h-4 w-4 text-orange-600" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Time Window Selection */}
        {deliveryDate && (
          <div className="space-y-4">
            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Available Time Slots</Label>
            <RadioGroup value={deliveryTime} onValueChange={onDeliveryTimeChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableSlotsForDate.map(slot => {
                const atCapacity = slot.currentOrders >= slot.maxOrders
                const isSelected = deliveryTime === slot.timeSlot
                return (
                  <div
                    key={slot.id}
                    className={`relative rounded-[2rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${isSelected
                      ? 'border-gray-900 bg-white shadow-2xl scale-[1.02] z-10'
                      : atCapacity
                        ? 'border-amber-100 bg-amber-50/30'
                        : 'border-gray-50 bg-gray-50/50 hover:border-gray-300 hover:bg-white'
                      }`}
                  >
                    <div className="p-6 sm:p-8 flex items-start gap-5">
                      <div className="pt-1">
                        <RadioGroupItem value={slot.timeSlot} id={slot.id} className="h-5 w-5 border-gray-200 text-orange-600" />
                      </div>
                      <Label htmlFor={slot.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Clock className="h-4 w-4" />
                          </div>
                          <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">{slot.timeSlot}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter leading-tight pr-4">
                          {slot.description?.trim() || "Preferred delivery time"}
                        </p>
                        {atCapacity && (
                          <div className="mt-3 py-1.5 px-3 bg-amber-100 rounded-lg inline-flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3 text-amber-700" />
                            <span className="text-[8px] font-black text-amber-700 uppercase tracking-tighter">Slot Full</span>
                          </div>
                        )}
                      </Label>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>
          </div>
        )}

        {/* Transactional Notes */}
        <div className="space-y-4">
          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2">Delivery Notes <span className="text-gray-300">(Optional)</span></Label>
          <Textarea
            value={deliveryNotes}
            onChange={(e) => onDeliveryNotesChange(e.target.value)}
            placeholder="Add any notes for the delivery team..."
            rows={3}
            className="rounded-[2rem] border-2 border-gray-50 bg-gray-50/50 focus:bg-white focus:border-gray-900 transition-all font-bold text-sm resize-none p-6 min-h-[120px]"
          />
        </div>

        {/* Delivery guidelines */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 sm:p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Truck className="h-48 w-48 text-white rotate-[-12deg]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-10">
            <div className="md:w-1/3">
              <div className="p-4 bg-white/10 rounded-[1.5rem] w-fit mb-6">
                <Truck className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-3">Delivery Information</h3>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-relaxed">
                Here are the delivery rules and timelines to keep in mind.
              </p>
            </div>
            <div className="md:w-2/3">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {points.map((text, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group/item">
                    <div className="p-1.5 bg-orange-400/20 text-orange-400 rounded-lg group-hover/item:scale-110 transition-transform">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-normal">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
