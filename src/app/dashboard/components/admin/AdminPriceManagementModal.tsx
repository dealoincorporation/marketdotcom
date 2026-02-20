"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PriceHistoryEntry {
  date: string
  price: number
  type: string
}

interface AdminPriceManagementModalProps {
  productName: string
  currentPrice: number
  priceHistory: PriceHistoryEntry[]
  newPrice: string
  priceStartDate: string
  priceEndDate: string
  onNewPriceChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onUpdatePrice: () => void
  onClose: () => void
  formatPrice: (price: number | undefined | null) => string
}

export function AdminPriceManagementModal({
  productName,
  currentPrice,
  priceHistory,
  newPrice,
  priceStartDate,
  priceEndDate,
  onNewPriceChange,
  onStartDateChange,
  onEndDateChange,
  onUpdatePrice,
  onClose,
  formatPrice,
}: AdminPriceManagementModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Price Management - {productName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Current Price</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(currentPrice)}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Active</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Price History</h4>
            <div className="space-y-2">
              {priceHistory.map((priceEntry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium">{formatPrice(priceEntry.price)}</div>
                    <div className="text-sm text-gray-600">{priceEntry.date}</div>
                  </div>
                  <Badge variant={priceEntry.type === 'current' ? 'default' : 'secondary'}>
                    {priceEntry.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Set New Price</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Price</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => onNewPriceChange(e.target.value)}
                  placeholder="Enter new price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date (Optional)</label>
                <input
                  type="date"
                  value={priceStartDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={priceEndDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={onUpdatePrice}
              disabled={!newPrice}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Update Price
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
