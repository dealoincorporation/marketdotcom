"use client"

import { MapPin, Plus, Home, Building, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { Address, NewAddress } from "../types"

interface DeliveryAddressSectionProps {
  addresses: Address[]
  selectedAddress: string
  onAddressSelect: (addressId: string) => void
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
  showNewAddressForm,
  onShowNewAddressForm,
  newAddress,
  onNewAddressChange,
  onAddAddress,
}: DeliveryAddressSectionProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden w-full max-w-full min-w-0">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
          <span className="break-words">Choose Delivery Address</span>
        </h2>
        <p className="text-orange-100 mt-1 text-sm sm:text-base break-words">Select where you'd like your order delivered</p>
      </div>
      <div className="p-4 sm:p-6 min-w-0">
        <RadioGroup value={selectedAddress} onValueChange={onAddressSelect} className="space-y-3 sm:space-y-4">
          {addresses.map(address => (
            <div key={address.id} className={`relative p-3 sm:p-4 md:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer min-w-0 overflow-hidden ${
              selectedAddress === address.id
                ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}>
              <div className="flex items-start space-x-2 sm:space-x-3 md:space-x-4">
                <RadioGroupItem
                  value={address.id}
                  id={address.id}
                  className="mt-1 flex-shrink-0"
                />
                <Label htmlFor={address.id} className="flex-1 cursor-pointer min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 gap-2">
                        <span className="font-bold text-base sm:text-lg text-gray-900 break-words">{address.name}</span>
                        <div className="flex items-center space-x-2">
                          {address.isDefault && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm text-xs">
                              Default
                            </Badge>
                          )}
                          <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                            address.type === "home"
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {address.type === "home" ? <Home className="h-3 w-3 sm:h-4 sm:w-4" /> : <Building className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base leading-tight break-words">{address.address}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <p className="text-gray-600 text-xs sm:text-sm break-words">{address.city}, {address.state}</p>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium break-all">{address.phone}</p>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
              {selectedAddress === address.id && (
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </RadioGroup>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={() => onShowNewAddressForm(true)}
            className="w-full h-12 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-dashed border-gray-300 hover:border-orange-400 transition-all duration-300 group"
          >
            <Plus className="h-5 w-5 mr-3 text-gray-500 group-hover:text-orange-600 transition-colors" />
            <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">Add New Address</span>
          </Button>
        </div>

        {showNewAddressForm && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Add New Address
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="addressType" className="text-sm font-semibold text-gray-700">Address Type</Label>
                  <Select value={newAddress.type} onValueChange={(value: any) => onNewAddressChange({...newAddress, type: value})}>
                    <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      <SelectItem value="home">🏠 Home</SelectItem>
                      <SelectItem value="work">🏢 Work</SelectItem>
                      <SelectItem value="other">📍 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressName" className="text-sm font-semibold text-gray-700">Address Name</Label>
                  <Input
                    id="addressName"
                    value={newAddress.name}
                    onChange={(e) => onNewAddressChange({...newAddress, name: e.target.value})}
                    placeholder="e.g., Home, Office"
                    className="h-12 border-2 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="streetAddress" className="text-sm font-semibold text-gray-700">Street Address</Label>
                <Textarea
                  id="streetAddress"
                  value={newAddress.address}
                  onChange={(e) => onNewAddressChange({...newAddress, address: e.target.value})}
                  placeholder="Enter your full address"
                  rows={3}
                  className="border-2 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City</Label>
                  <Input
                    id="city"
                    value={newAddress.city}
                    onChange={(e) => onNewAddressChange({...newAddress, city: e.target.value})}
                    className="h-12 border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State</Label>
                  <Input
                    id="state"
                    value={newAddress.state}
                    onChange={(e) => onNewAddressChange({...newAddress, state: e.target.value})}
                    className="h-12 border-2 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-700">Postal Code <span className="text-gray-500">(Optional)</span></Label>
                  <Input
                    id="postalCode"
                    value={newAddress.postalCode}
                    onChange={(e) => onNewAddressChange({...newAddress, postalCode: e.target.value})}
                    className="h-12 border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newAddress.phone}
                    onChange={(e) => onNewAddressChange({...newAddress, phone: e.target.value})}
                    placeholder="+234xxxxxxxxxx"
                    className="h-12 border-2 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={onAddAddress}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Address
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onShowNewAddressForm(false)}
                  className="flex-1 h-12 border-2 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
