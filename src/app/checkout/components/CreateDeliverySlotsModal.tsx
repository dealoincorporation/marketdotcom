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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-orange-700">
            <Calendar className="h-5 w-5 mr-2" />
            Configure Delivery Slots
          </DialogTitle>
          <DialogDescription>
            Customize delivery slots for your store. Choose which days and times to offer delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Days Configuration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">How many days ahead to create slots?</Label>
            <Select
              value={slotConfig.daysAhead.toString()}
              onValueChange={(value) => onSlotConfigChange({ ...slotConfig, daysAhead: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Slots Configuration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Which time slots to offer?</Label>
            <div className="space-y-2">
              {slotConfig.timeSlots.map((slot, index) => (
                <div key={slot.time} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`time-${index}`}
                    checked={slot.enabled}
                    onChange={(e) => {
                      const newTimeSlots = [...slotConfig.timeSlots]
                      newTimeSlots[index].enabled = e.target.checked
                      onSlotConfigChange({ ...slotConfig, timeSlots: newTimeSlots })
                    }}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <Label htmlFor={`time-${index}`} className="text-sm text-gray-700 cursor-pointer">
                    {slot.time}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Capacity and Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Max Orders per Slot</Label>
              <Input
                type="number"
                value={slotConfig.maxOrders}
                onChange={(e) => onSlotConfigChange({ ...slotConfig, maxOrders: parseInt(e.target.value) || 10 })}
                min="1"
                max="50"
                className="h-10"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Extra Fee (₦) <span className="text-gray-500 text-xs">Optional</span></Label>
              <Input
                type="number"
                value={slotConfig.price}
                onChange={(e) => onSlotConfigChange({ ...slotConfig, price: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
                className="h-10"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Summary:</h4>
            <p className="text-sm text-blue-800">
              This will create <strong>{totalSlots}</strong> delivery slots
              ({slotConfig.daysAhead} days × {enabledSlotsCount} time slots)
              starting tomorrow.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
