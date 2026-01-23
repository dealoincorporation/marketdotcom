'use client'

import { motion } from 'framer-motion'
import { Plus, Minus, FileText, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Variation } from './types'

interface ProductVariationsSectionProps {
  variations: Variation[]
  onAddVariation: () => void
  onUpdateVariation: (index: number, field: keyof Variation, value: any) => void
  onRemoveVariation: (index: number) => void
  onBulkImport: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const UNIT_OPTIONS = [
  // Volume
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'L' },
  { value: 'cup', label: 'cup' },
  // Weight
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
  { value: 'oz', label: 'oz' },
  // Count
  { value: 'pc', label: 'pc' },
  { value: 'pcs', label: 'pcs' },
  { value: 'pack', label: 'pack' },
  { value: 'dozen', label: 'dozen' },
  // Packaging
  { value: 'bag', label: 'bag' },
  { value: 'box', label: 'box' },
  { value: 'bottle', label: 'bottle' },
  { value: 'can', label: 'can' },
  { value: 'tin', label: 'tin' },
  { value: 'jar', label: 'jar' },
  // Other
  { value: 'roll', label: 'roll' },
  { value: 'set', label: 'set' },
]

export function ProductVariationsSection({
  variations,
  onAddVariation,
  onUpdateVariation,
  onRemoveVariation,
  onBulkImport,
}: ProductVariationsSectionProps) {
  return (
    <Card className="border-2 border-gray-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Layers className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Product Variations</CardTitle>
              <p className="text-sm text-gray-600 mt-0.5">Add different sizes, quantities, or options</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="file"
              accept=".csv"
              onChange={onBulkImport}
              className="hidden"
              id="variation-csv-import"
            />
            <Button
              type="button"
              onClick={() => document.getElementById('variation-csv-import')?.click()}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 active:bg-blue-100 w-full sm:w-auto h-10 sm:h-9 text-sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">Import</span>
            </Button>
            <Button
              type="button"
              onClick={onAddVariation}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-600 hover:bg-orange-50 active:bg-orange-100 w-full sm:w-auto h-10 sm:h-9 text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Variation</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* CSV Format Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-sm mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-blue-900 mb-2">
                CSV Bulk Import Format
              </p>
              <p className="text-xs text-blue-700 mb-3 break-words">
                Columns: <code className="bg-white px-2 py-1 rounded font-mono text-xs break-all border border-blue-200">Name, Quantity, Unit, Price, Stock, ImageURL</code>
              </p>
              <div className="bg-white/80 rounded-lg p-3 border border-blue-200">
                <p className="text-xs font-semibold text-blue-800 mb-1">Example:</p>
                <code className="font-mono text-xs text-blue-700 break-all block">
                  "Mama Gold, 2, kg, 4500, 25, https://example.com/image.jpg"
                </code>
              </div>
            </div>
          </div>
        </div>

        {variations.length > 0 && (
          <div className="space-y-4">
            {variations.map((variation, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all duration-200 overflow-visible"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 items-end relative">
                  <div className="col-span-1">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Name</Label>
                    <Input
                      value={variation.name}
                      onChange={(e) => onUpdateVariation(index, 'name', e.target.value)}
                      placeholder="Mama Gold"
                      className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={variation.quantity || ""}
                      onChange={(e) => onUpdateVariation(index, 'quantity', parseFloat(e.target.value) || undefined)}
                      placeholder="1"
                      className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                    />
                  </div>
                  <div className="col-span-1 relative z-[100]">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Unit</Label>
                    <Select
                      value={variation.unit || ""}
                      onValueChange={(value) => onUpdateVariation(index, 'unit', value)}
                    >
                      <SelectTrigger className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg relative z-[100]">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-300 shadow-xl max-h-60 overflow-y-auto z-[9999]" position="popper">
                        {UNIT_OPTIONS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Price (₦)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variation.price}
                      onChange={(e) => onUpdateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                    />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Stock</Label>
                    <Input
                      type="number"
                      min="0"
                      value={variation.stock}
                      onChange={(e) => onUpdateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-2 flex justify-end items-end pt-2 sm:pt-4 md:pt-6">
                    <Button
                      type="button"
                      onClick={() => onRemoveVariation(index)}
                      variant="outline"
                      className="text-red-600 border-2 border-red-600 hover:bg-red-50 active:bg-red-100 hover:border-red-700 w-full sm:w-auto h-10 sm:h-11 rounded-lg font-medium text-sm sm:text-base"
                    >
                      <Minus className="h-4 w-4 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">Remove Variation</span>
                      <span className="sm:hidden">Remove</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {variations.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">
              No variations added yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Add variations for different sizes, quantities, or packaging options
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
