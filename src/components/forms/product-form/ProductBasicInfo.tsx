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
    <div className="space-y-12">
      {/* Module Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <div className="p-3 bg-orange-100 rounded-2xl shadow-sm">
          <Info className="h-5 w-5 text-orange-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Product basics</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Name, category, price, stock, and delivery details</p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Optional product group for related listings */}
        <div className="space-y-3">
          <Label htmlFor="groupName" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            Product group <span className="opacity-50 text-[9px]">(Optional)</span>
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none">
              <Package className="h-full w-full" strokeWidth={1.5} />
            </div>
            <Input
              id="groupName"
              value={formData.groupName || ''}
              onChange={(e) => onInputChange('groupName', e.target.value)}
              placeholder="e.g. Rice, Grains, Cereals"
              className="h-14 pl-12 pr-4 rounded-2xl border-white bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            />
          </div>
          <div className="flex items-start gap-3 p-4 bg-orange-50/50 backdrop-blur-sm border border-orange-100/50 rounded-2xl">
            <Info className="h-4 w-4 text-orange-600 mt-0.5" />
            <p className="text-[10px] font-bold text-orange-800/70 leading-relaxed uppercase tracking-tight">
              Use a group name to link related products (for example: Rice, Grains, Cereals). Shoppers can browse by group in the marketplace.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Name */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Product name <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="Standard product name"
              className={`h-14 px-5 rounded-2xl border-white bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.name ? 'border-red-500 ring-red-50' : ''}`}
            />
            {errors.name && (
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-3 relative z-[100]">
            <Label htmlFor="category" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Category <span className="text-orange-500">*</span>
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => onInputChange('categoryId', value)}
            >
              <SelectTrigger className={`h-14 px-5 rounded-2xl border-white bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.categoryId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="glass-effect bg-white/95 backdrop-blur-3xl border border-white rounded-[1.5rem] shadow-2xl z-[9999]" position="popper">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="hover:bg-orange-50 focus:bg-orange-50 rounded-xl m-1 transition-all">
                    <div className="flex flex-col py-1">
                      <span className="text-[11px] font-black uppercase tracking-wider text-gray-900">{category.name}</span>
                      {category.description && (
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{category.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.categoryId}</p>
            )}
          </div>

          {/* Base Price */}
          <div className="space-y-3">
            <Label htmlFor="basePrice" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              Base price (₦) <span className="text-orange-500">*</span>
            </Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500 group-focus-within:scale-120 transition-transform pointer-events-none font-black text-lg">
                ₦
              </div>
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
                className={`h-14 pl-12 rounded-2xl border-white bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.basePrice ? 'border-red-500 ring-red-50' : ''}`}
              />
            </div>
            {errors.basePrice && (
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.basePrice}</p>
            )}
          </div>

          {/* Unit */}
          <div className="space-y-3">
            <Label htmlFor="unit" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Unit <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => onInputChange('unit', e.target.value)}
              placeholder="e.g. piece, kg, box"
              className={`h-14 px-5 rounded-2xl border-white bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.unit ? 'border-red-500 ring-red-50' : ''}`}
            />
            {errors.unit && (
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.unit}</p>
            )}
          </div>

          {/* Stock Quantity */}
          <div className="space-y-3">
            <Label htmlFor="stock" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              Inventory Level <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => onInputChange('stock', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={`h-14 px-5 rounded-2xl border-white bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${errors.stock ? 'border-red-500 ring-red-50' : ''}`}
            />
            {errors.stock && (
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.stock}</p>
            )}
          </div>

          {/* In Stock Checkbox */}
          <div className="flex items-center gap-4 px-6 h-14 bg-gray-50/50 rounded-2xl border border-gray-100 group/cb transition-all hover:bg-orange-50/30">
            <input
              type="checkbox"
              id="inStock"
              checked={formData.inStock}
              onChange={(e) => onInputChange('inStock', e.target.checked)}
              className="w-6 h-6 text-orange-600 bg-white border-white rounded-lg focus:ring-orange-500 focus:ring-offset-0 transition-all cursor-pointer accent-orange-500"
            />
            <Label htmlFor="inStock" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] cursor-pointer selection:bg-none group-hover/cb:text-orange-600 transition-colors">
              Product is available for sale
            </Label>
          </div>

          {/* Weight (kg) */}
          <div className="space-y-3">
            <Label htmlFor="weightKg" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              Weight (kg) <span className="opacity-50 text-[9px]">(Optional)</span>
            </Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none">
                <Package className="h-full w-full" strokeWidth={1.5} />
              </div>
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
                placeholder="0.0"
                className="h-14 pl-12 rounded-2xl border-white bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Delivery Fee override */}
          <div className="space-y-3">
            <Label htmlFor="deliveryFee" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
              Custom delivery fee (₦) <span className="opacity-50 text-[9px]">(Optional)</span>
            </Label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500 group-focus-within:scale-120 transition-transform pointer-events-none font-black text-lg">
                ₦
              </div>
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
                placeholder="Use default fee"
                className="h-14 pl-12 rounded-2xl border-white bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label htmlFor="description" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Describe the product, ingredients, pack size, storage tips, or anything buyers should know..."
            rows={5}
            className="min-h-[160px] p-6 rounded-[2rem] border-white bg-white shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 resize-none text-base"
          />
        </div>
      </div>
    </div>
  )
}
