"use client"

import { Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SlotConfig } from "../types"

interface CreateDeliverySlotsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slotConfig: SlotConfig
  onSlotConfigChange: (config: SlotConfig) => void
  loading: boolean
  onCreateSlots: () => Promise<void>
}

export function CreateDeliverySlotsModal({
  open,
  onOpenChange,
  slotConfig,
  onSlotConfigChange,
  loading,
  onCreateSlots,
}: CreateDeliverySlotsModalProps) {
  const enabledSlotsCount = slotConfig.timeSlots.filter(s => s.enabled).length
  const totalSlots = slotConfig.daysAhead * enabledSlotsCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-2 border-orange-200/50 shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-orange-50 to-red-50 px-6 pt-6 pb-4 rounded-t-lg border-b border-orange-200 flex-shrink-0">
          <DialogTitle className="flex items-center text-orange-700 text-xl font-bold">
            <Calendar className="h-6 w-6 mr-2" />
            Configure Delivery Slots
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Customize delivery slots for your store. Choose which days and times to offer delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4 px-6 overflow-y-auto flex-1 min-h-0">
          {/* Days Configuration */}
          <div className="space-y-3 bg-gradient-to-br from-orange-50/50 to-white p-4 rounded-lg border border-orange-100">
            <Label className="text-sm font-semibold text-gray-800">How many days ahead to create slots?</Label>
            <Select
              value={slotConfig.daysAhead.toString()}
              onValueChange={(value) => onSlotConfigChange({ ...slotConfig, daysAhead: parseInt(value) })}
            >
              <SelectTrigger className="bg-white border-2 border-orange-200 hover:border-orange-300 focus:border-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-2 border-orange-200 shadow-xl">
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Slots Configuration */}
          <div className="space-y-3 bg-gradient-to-br from-orange-50/50 to-white p-4 rounded-lg border border-orange-100">
            <Label className="text-sm font-semibold text-gray-800">Which time slots to offer?</Label>
            <div className="space-y-2.5">
              {slotConfig.timeSlots.map((slot, index) => (
                <div key={slot.time} className="flex items-center space-x-3 p-2 rounded-md hover:bg-orange-50/50 transition-colors">
                  <input
                    type="checkbox"
                    id={`time-${index}`}
                    checked={slot.enabled}
                    onChange={(e) => {
                      const newTimeSlots = [...slotConfig.timeSlots]
                      newTimeSlots[index].enabled = e.target.checked
                      onSlotConfigChange({ ...slotConfig, timeSlots: newTimeSlots })
                    }}
                    className="h-4 w-4 text-orange-600 focus:ring-2 focus:ring-orange-500 border-2 border-gray-300 rounded cursor-pointer"
                  />
                  <Label htmlFor={`time-${index}`} className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                    {slot.time}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity and Pricing */}
          <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-orange-50/50 to-white p-4 rounded-lg border border-orange-100">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800">Max Orders per Slot</Label>
              <Input
                type="number"
                value={slotConfig.maxOrders}
                onChange={(e) => onSlotConfigChange({ ...slotConfig, maxOrders: parseInt(e.target.value) || 10 })}
                min="1"
                className="h-10 border-2 border-orange-200 focus:border-orange-500 bg-white"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800">Extra Fee (₦) <span className="text-gray-500 text-xs font-normal">Optional</span></Label>
              <Input
                type="number"
                value={slotConfig.price}
                onChange={(e) => onSlotConfigChange({ ...slotConfig, price: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
                className="h-10 border-2 border-orange-200 focus:border-orange-500 bg-white"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200/60 rounded-lg p-4 shadow-md backdrop-blur-sm">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Summary:
            </h4>
            <p className="text-sm text-blue-800 font-medium">
              This will create <strong className="text-blue-900 text-base">{totalSlots}</strong> delivery slots
              ({slotConfig.daysAhead} days × {enabledSlotsCount} time slots)
              starting today.
            </p>
          </div>
        </div>
        
        {/* Footer with gradient fade - Fixed at bottom */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 pb-6 pt-4 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-orange-100 flex-shrink-0 sticky bottom-0">
          <Button
            onClick={onCreateSlots}
            disabled={loading || enabledSlotsCount === 0}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Slots...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create {totalSlots} Slots
              </>
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
