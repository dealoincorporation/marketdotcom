'use client'

import { motion } from 'framer-motion'
import { Plus, Minus, FileText, Layers, Upload, X, Image as ImageIcon } from 'lucide-react'
import { toCharmPrice } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Variation } from './types'

interface ProductVariationsSectionProps {
  variations: Variation[]
  onAddVariation: () => void
  onUpdateVariation: (index: number, field: keyof Variation, value: any) => void
  onRemoveVariation: (index: number) => void
  onBulkImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  onVariationImageUpload: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveVariationImage: (index: number) => void
  uploadingVariationImages?: Record<number, boolean>
  errors?: Record<string, string>
}

export function ProductVariationsSection({
  variations,
  onAddVariation,
  onUpdateVariation,
  onRemoveVariation,
  onBulkImport,
  onVariationImageUpload,
  onRemoveVariationImage,
  uploadingVariationImages = {},
  errors = {},
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="col-span-1">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Quantity</Label>
                      <Input
                        type="text"
                        value={variation.quantity || ""}
                        onChange={(e) => onUpdateVariation(index, 'quantity', e.target.value)}
                        placeholder="e.g., 2 kg, Premium Pack, or 1"
                        className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">Describe the variation (e.g., "2 kg", "Premium Pack", "1 dozen")</p>
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Price (₦)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variation.price}
                        onChange={(e) => onUpdateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value) || 0
                          const charm = toCharmPrice(val)
                          if (val !== charm) onUpdateVariation(index, 'price', charm)
                        }}
                        placeholder="0.00"
                        className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                      />
                    </div>
                    <div className="col-span-1">
                      <Label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">Stock</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variation.stock || 0}
                        onChange={(e) => onUpdateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full h-10 sm:h-11 text-sm sm:text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Variation Image Upload */}
                  <div className="col-span-full pt-2">
                    <Label className="text-xs sm:text-sm font-semibold text-gray-800 mb-3 block">
                      Variation Image
                      <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                    </Label>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Image Preview */}
                      <div className="relative group flex-shrink-0">
                        {variation.image ? (
                          <>
                            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm ring-1 ring-gray-200/50 transition-all duration-200 group-hover:shadow-md group-hover:ring-orange-200">
                              <img
                                src={variation.image}
                                alt={variation.quantity ? String(variation.quantity) : `Variation ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveVariationImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200 opacity-0 group-hover:opacity-100 transform hover:scale-110 z-10"
                              aria-label="Remove image"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-xl transition-colors duration-200 pointer-events-none" />
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const fileInput = document.getElementById(`variation-image-${index}`) as HTMLInputElement
                              if (fileInput && !uploadingVariationImages[index]) {
                                fileInput.click()
                              }
                            }}
                            disabled={uploadingVariationImages[index]}
                            className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center transition-all duration-200 hover:border-orange-400 hover:bg-orange-50/30 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                          >
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white/80 flex items-center justify-center mb-2 shadow-sm">
                              <ImageIcon className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400 group-hover:text-orange-500 transition-colors" />
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 font-medium group-hover:text-orange-600 transition-colors">Click to upload</p>
                          </button>
                        )}
                      </div>

                      {/* Upload Controls */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onVariationImageUpload(index, e)}
                            className="hidden"
                            id={`variation-image-${index}`}
                            disabled={uploadingVariationImages[index]}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploadingVariationImages[index]}
                            onClick={() => {
                              const fileInput = document.getElementById(`variation-image-${index}`) as HTMLInputElement
                              if (fileInput && !uploadingVariationImages[index]) {
                                fileInput.click()
                              }
                            }}
                            className="w-full sm:w-auto cursor-pointer border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-700 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow"
                          >
                            {uploadingVariationImages[index] ? (
                              <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-400 border-t-transparent mr-2"></div>
                                Uploading...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <Upload className="h-4 w-4 mr-2" />
                                {variation.image ? 'Change Image' : 'Upload Image'}
                              </span>
                            )}
                          </Button>
                        </div>
                        
                        {errors[`variation_${index}_image`] && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                            <p className="text-xs text-red-700 font-medium flex items-center">
                              <X className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                              {errors[`variation_${index}_image`]}
                            </p>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Upload a specific image for this variation to help customers identify it better. Recommended: Square image, max 5MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={() => onRemoveVariation(index)}
                      variant="outline"
                      className="text-red-600 border-2 border-red-600 hover:bg-red-50 active:bg-red-100 hover:border-red-700 h-10 sm:h-11 rounded-lg font-medium text-sm sm:text-base"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Remove Variation
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
