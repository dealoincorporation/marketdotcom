"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  id: string
  name: string
}

interface BulkEditData {
  categoryId: string
  stock: string
  inStock: boolean | null
}

interface BulkEditProductModalProps {
  selectedCount: number
  categories: Category[]
  bulkEditData: BulkEditData
  onBulkEditDataChange: (data: BulkEditData) => void
  onApply: () => void
  onClose: () => void
}

export function BulkEditProductModal({
  selectedCount,
  categories,
  bulkEditData,
  onBulkEditDataChange,
  onApply,
  onClose,
}: BulkEditProductModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bulk Edit Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Update {selectedCount} selected products
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Category
              </label>
              <select
                value={bulkEditData.categoryId}
                onChange={(e) => onBulkEditDataChange({ ...bulkEditData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Don&apos;t change</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Stock
              </label>
              <input
                type="number"
                value={bulkEditData.stock}
                onChange={(e) => onBulkEditDataChange({ ...bulkEditData, stock: e.target.value })}
                placeholder="Don't change"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bulk-inStock"
                    checked={bulkEditData.inStock === true}
                    onChange={() => onBulkEditDataChange({ ...bulkEditData, inStock: true })}
                    className="mr-2 text-orange-600 focus:ring-orange-500"
                  />
                  In Stock
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bulk-inStock"
                    checked={bulkEditData.inStock === false}
                    onChange={() => onBulkEditDataChange({ ...bulkEditData, inStock: false })}
                    className="mr-2 text-orange-600 focus:ring-orange-500"
                  />
                  Out of Stock
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bulk-inStock"
                    checked={bulkEditData.inStock === null}
                    onChange={() => onBulkEditDataChange({ ...bulkEditData, inStock: null })}
                    className="mr-2 text-orange-600 focus:ring-orange-500"
                  />
                  Don&apos;t change
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onApply} className="bg-orange-600 hover:bg-orange-700">
              Apply Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
