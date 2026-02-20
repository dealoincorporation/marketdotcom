'use client'

import { Info, DollarSign, Package } from 'lucide-react'
import { toCharmPrice } from '@/lib/helpers'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductFormType } from './types'

interface ProductBasicInfoProps {
  formData: ProductFormType
  categories: any[]
  errors: Record<string, string>
  onInputChange: (field: keyof ProductFormType, value: any) => void
}

export function ProductBasicInfo({
  formData,
  categories,
  errors,
  onInputChange,
}: ProductBasicInfoProps) {
  return (
    <Card className="border-2 border-gray-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Basic Information</CardTitle>
            <p className="text-sm text-gray-600 mt-0.5">Product details and pricing</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Product (for Category → Product → Variant) */}
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              Product
              <span className="text-xs font-normal text-gray-400">(e.g. Rice, Beans — optional)</span>
            </Label>
            <Input
              id="groupName"
              value={formData.groupName || ''}
              onChange={(e) => onInputChange('groupName', e.target.value)}
              placeholder='e.g. Rice, Beans, Oloyin'
              className="h-12 text-base border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
            />
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Set this so you can browse by Category → Product → Variant in the dashboard. Example: Category: Grains and Cereals → Product: Rice → Variant: this product (e.g. Mama&apos;s Pride Basmati 5kg).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                placeholder="Enter product name"
                className={`h-12 text-base border-2 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} rounded-lg`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>✗</span> {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2 relative z-[100]">
              <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => onInputChange('categoryId', value)}
              >
                <SelectTrigger className={`h-12 text-base border-2 relative z-[100] ${errors.categoryId ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} rounded-lg`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-200 shadow-xl max-h-[300px] overflow-y-auto z-[9999]" position="popper">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="hover:bg-orange-50 focus:bg-orange-50">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{category.name}</span>
                        {category.description && (
                          <span className="text-xs text-gray-500">- {category.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>✗</span> {errors.categoryId}
                </p>
              )}
            </div>

            {/* Base Price */}
            <div className="space-y-2">
              <Label htmlFor="basePrice" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                Base Price (₦) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="basePrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => onInputChange('basePrice', parseFloat(e.target.value) || 0)}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value) || 0
                  const charm = toCharmPrice(val)
                  if (val !== charm) onInputChange('basePrice', charm)
                }}
                placeholder="0.00"
                className={`h-12 text-base border-2 ${errors.basePrice ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} rounded-lg`}
              />
              {errors.basePrice && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>✗</span> {errors.basePrice}
                </p>
              )}
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-semibold text-gray-700">
                Unit <span className="text-red-500">*</span>
              </Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => onInputChange('unit', e.target.value)}
                placeholder="kg, liter, piece, etc."
                className={`h-12 text-base border-2 ${errors.unit ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} rounded-lg`}
              />
              {errors.unit && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>✗</span> {errors.unit}
                </p>
              )}
            </div>

            {/* Stock Quantity */}
            <div className="space-y-2">
              <Label htmlFor="stock" className="text-sm font-semibold text-gray-700">
                Stock Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => onInputChange('stock', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={`h-12 text-base border-2 ${errors.stock ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'} rounded-lg`}
              />
              {errors.stock && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span>✗</span> {errors.stock}
                </p>
              )}
            </div>

            {/* In Stock Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <input
                type="checkbox"
                id="inStock"
                checked={formData.inStock}
                onChange={(e) => onInputChange('inStock', e.target.checked)}
                className="w-5 h-5 text-orange-600 bg-white border-2 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <Label htmlFor="inStock" className="text-sm font-medium text-gray-700 cursor-pointer">
                Product is in stock
              </Label>
            </div>

            {/* Weight (kg) - for delivery fee calculation */}
            <div className="space-y-2">
              <Label htmlFor="weightKg" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                Weight (kg)
                <span className="text-xs font-normal text-gray-400">(optional)</span>
              </Label>
              <Input
                id="weightKg"
                type="number"
                min="0"
                step="0.1"
                value={formData.weightKg === null || formData.weightKg === undefined ? '' : formData.weightKg}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    onInputChange('weightKg', null)
                  } else {
                    const numValue = parseFloat(value)
                    onInputChange('weightKg', isNaN(numValue) ? null : numValue)
                  }
                }}
                placeholder="e.g. 5"
                className="h-12 text-base border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200 rounded-lg"
              />
              <p className="text-xs text-gray-500">Used for weight-based delivery fee. Leave empty to treat as 0.</p>
            </div>

            {/* Delivery Fee override */}
            <div className="space-y-2">
              <Label htmlFor="deliveryFee" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-600" />
                Delivery override (₦)
                <span className="text-xs font-normal text-gray-400">(optional)</span>
              </Label>
              <Input
                id="deliveryFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.deliveryFee === null || formData.deliveryFee === undefined ? '' : formData.deliveryFee}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '') {
                    onInputChange('deliveryFee', null)
                  } else {
                    const numValue = parseFloat(value)
                    onInputChange('deliveryFee', isNaN(numValue) ? null : numValue)
                  }
                }}
                placeholder="Default (weight-based) | 0 = free | Number = custom"
                className="h-12 text-base border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200 rounded-lg"
              />
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Leave empty for weight-based calculation, set to 0 for free delivery, or enter a custom fee per item.
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="Enter product description..."
              rows={4}
              className="min-h-[120px] text-base resize-none border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
