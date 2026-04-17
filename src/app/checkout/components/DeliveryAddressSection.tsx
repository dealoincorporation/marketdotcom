"use client"

import { MapPin, Plus, Home, Building, Check, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Address, NewAddress } from "../types"

/** (title, message, onConfirm, onCancel?) => void — used for delete confirmation modal */
type ShowConfirmFn = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void

interface DeliveryAddressSectionProps {
  addresses: Address[]
  selectedAddress: string
  onAddressSelect: (addressId: string) => void
  onDeleteAddress?: (addressId: string) => Promise<void>
  showConfirm?: ShowConfirmFn
  showNewAddressForm: boolean
  onShowNewAddressForm: (show: boolean) => void
  newAddress: NewAddress
  onNewAddressChange: (address: NewAddress) => void
  onAddAddress: () => Promise<void>
}

export function DeliveryAddressSection({
  addresses,
  selectedAddress,
  onAddressSelect,
  onDeleteAddress,
  showConfirm,
  showNewAddressForm,
  onShowNewAddressForm,
  newAddress,
  onNewAddressChange,
  onAddAddress,
}: DeliveryAddressSectionProps) {
  return (
    <div className="checkout-card bg-white/85 backdrop-blur-3xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/70 overflow-hidden w-full transition-all duration-500">
      {/* Section Header */}
      <div className="bg-gray-900 p-5 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <MapPin className="h-40 w-40 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="p-2.5 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl">
              <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
            </div>
            <h2 className="text-[11px] sm:text-sm font-black text-white uppercase tracking-[0.2em] sm:tracking-[0.4em]">Delivery Address</h2>
          </div>
          <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wide sm:tracking-widest leading-relaxed">
            Choose where you want your order delivered. <br className="hidden sm:block" />
            Current delivery area: <span className="text-orange-400">Lagos Region</span>
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-10">
        <RadioGroup value={selectedAddress} onValueChange={onAddressSelect} className="space-y-4">
          {addresses.map(address => (
            <motion.div
              key={address.id}
              layout
              className={`relative group rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${selectedAddress === address.id
                  ? 'border-gray-900 bg-white shadow-xl scale-[1.02]'
                  : 'border-gray-100 bg-gray-50/50 hover:border-gray-300 hover:bg-white'
                }`}
            >
              <div className="p-4 sm:p-8 flex items-start gap-3 sm:gap-6">
                <div className="pt-1">
                  <RadioGroupItem
                    value={address.id}
                    id={address.id}
                    className="h-6 w-6 border-2 border-gray-200 text-orange-600 focus:ring-orange-600"
                  />
                </div>

                <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className={`p-3 rounded-2xl ${address.type === "home" ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                        {address.type === "home" ? <Home className="h-5 w-5" /> : <Building className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="text-[10px] sm:text-[11px] font-black text-gray-900 uppercase tracking-wide sm:tracking-widest break-words">{address.name}</h3>
                        {address.isDefault && (
                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Default Address</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedAddress === address.id && (
                        <div className="px-3 py-1 bg-gray-900 rounded-lg">
                          <span className="text-[9px] font-black text-white uppercase tracking-widest">Selected</span>
                        </div>
                      )}
                      {onDeleteAddress && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (showConfirm) {
                              showConfirm(
                                'Delete this address?',
                                `"${address.name}" will be removed from your saved addresses.`,
                                () => { onDeleteAddress(address.id) }
                              )
                            } else {
                              onDeleteAddress(address.id)
                            }
                          }}
                          className="p-3 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-black text-gray-900 leading-snug break-words">{address.address}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-tight break-words">{address.city}, {address.state}</p>
                      <div className="w-1 h-1 bg-gray-200 rounded-full" />
                      <p className="text-[9px] sm:text-[10px] font-black text-gray-900 tracking-wide sm:tracking-widest break-all">{address.phone}</p>
                    </div>
                  </div>
                </Label>
              </div>
            </motion.div>
          ))}
        </RadioGroup>

        <div className="mt-6 sm:mt-10">
          <Button
            variant="outline"
            onClick={() => onShowNewAddressForm(true)}
            className="w-full h-14 sm:h-20 bg-gray-50 border-2 border-dashed border-gray-200 hover:border-gray-900 hover:bg-white rounded-xl sm:rounded-[1.5rem] transition-all duration-500 group"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                <span className="text-[11px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-widest transition-colors">Add New Delivery Address</span>
              </div>
            </div>
          </Button>
        </div>

        <AnimatePresence>
          {showNewAddressForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 sm:mt-8 p-4 sm:p-10 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.3em]">Add New Address</h3>
              </div>

              <div className="space-y-5 sm:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Type</Label>
                    <Select value={newAddress.type} onValueChange={(value: any) => onNewAddressChange({ ...newAddress, type: value })}>
                      <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-blue-100 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-100 rounded-2xl shadow-2xl z-[150]">
                        <SelectItem value="home">🏠 Home</SelectItem>
                        <SelectItem value="work">🏢 Work</SelectItem>
                        <SelectItem value="other">📍 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Name</Label>
                    <Input
                      value={newAddress.name}
                      onChange={(e) => onNewAddressChange({ ...newAddress, name: e.target.value })}
                      placeholder="e.g. Home"
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-blue-100 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</Label>
                  <Textarea
                    value={newAddress.address}
                    onChange={(e) => onNewAddressChange({ ...newAddress, address: e.target.value })}
                    placeholder="Enter full address details"
                    rows={3}
                    className="rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-blue-100 font-bold resize-none p-4"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</Label>
                    <Input
                      value={newAddress.city}
                      onChange={(e) => onNewAddressChange({ ...newAddress, city: e.target.value })}
                      placeholder="e.g. Lekki Phase 01"
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-blue-100 font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</Label>
                    <Input value="Lagos State" readOnly className="h-14 rounded-2xl border-gray-100 bg-gray-50 text-gray-400 font-bold cursor-not-allowed" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Postal Code</Label>
                    <Input
                      value={newAddress.postalCode}
                      onChange={(e) => onNewAddressChange({ ...newAddress, postalCode: e.target.value })}
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-blue-100 font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</Label>
                    <Input
                      value={newAddress.phone}
                      onChange={(e) => onNewAddressChange({ ...newAddress, phone: e.target.value })}
                      placeholder="+234..."
                      className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-4 focus:ring-blue-100 font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                  <Button
                    onClick={onAddAddress}
                    className="flex-1 h-12 sm:h-16 bg-gray-900 hover:bg-gray-800 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-xl sm:rounded-[1.25rem] shadow-xl transition-all active:scale-95"
                  >
                    Save Address
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onShowNewAddressForm(false)}
                    className="flex-1 h-12 sm:h-16 border-gray-100 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-xl sm:rounded-[1.25rem] hover:bg-gray-50 transition-all font-sans"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
