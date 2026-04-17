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
    <div className="space-y-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-2xl shadow-sm">
            <Layers className="h-5 w-5 text-indigo-600" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Variations</h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Different pack sizes, prices, and stock for the same product</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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
            className="h-12 px-5 border border-white/70 bg-white/80 backdrop-blur-sm rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-all hover:bg-gray-900 hover:text-white hover:border-gray-900 group"
          >
            <FileText className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Import CSV
          </Button>
          <Button
            type="button"
            onClick={onAddVariation}
            variant="outline"
            className="h-12 px-6 border border-white/70 bg-white/80 backdrop-blur-sm rounded-xl text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] transition-all hover:bg-orange-600 hover:text-white hover:border-orange-600 group"
          >
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
            Add variation
          </Button>
        </div>
      </div>

      {/* CSV import format */}
      <div className="glass-effect rounded-[2rem] border border-white/70 bg-indigo-50/50 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="mt-1 p-2 bg-indigo-500/10 rounded-xl">
            <FileText className="h-4 w-4 text-indigo-600" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em] mb-2">CSV column order</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Name', 'Quantity', 'Unit', 'Price', 'Stock', 'ImageURL'].map((col) => (
                <span key={col} className="px-2.5 py-1 bg-white/80 rounded-lg text-[9px] font-black text-indigo-800 uppercase tracking-widest border border-indigo-100/50">{col}</span>
              ))}
            </div>
            <p className="text-[9px] font-bold text-indigo-700/60 uppercase tracking-widest">
              Example row: <span className="font-mono text-indigo-800">"Gold Blend, 2, kg, 4500, 25, https://example.com/image.webp"</span>
            </p>
          </div>
        </div>
      </div>

      {/* Variations List */}
      <div className="space-y-6">
        {variations.map((variation, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative"
          >
            <div className="glass-effect rounded-[2.5rem] border border-white bg-white/85 backdrop-blur-3xl p-8 shadow-xl premium-shadow transition-all duration-500 hover:bg-white/95">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Media Control */}
                <div className="lg:col-span-3">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 block">Variation image</Label>
                    <div className="relative aspect-square rounded-[1.8rem] overflow-hidden bg-gray-100 border border-white shadow-inner group/media">
                      {variation.image ? (
                        <>
                          <img
                            src={variation.image}
                            alt={`Variant ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => onRemoveVariationImage(index)}
                            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover/media:opacity-100 transition-opacity hover:scale-110"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => document.getElementById(`variation-image-${index}`)?.click()}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                            <Upload className="h-5 w-5 text-gray-400 group-hover/media:text-orange-500 transition-colors" />
                          </div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Upload image</span>
                        </button>
                      )}

                      {uploadingVariationImages[index] && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onVariationImageUpload(index, e)}
                      className="hidden"
                      id={`variation-image-${index}`}
                    />
                  </div>
                </div>

                {/* Parameters Matrix */}
                <div className="lg:col-span-9 flex flex-col justify-between space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Pack or size</Label>
                      <Input
                        value={variation.quantity || ""}
                        onChange={(e) => onUpdateVariation(index, 'quantity', e.target.value)}
                        placeholder="e.g. 2kg Pack"
                        className="h-12 px-4 rounded-xl border-white bg-white shadow-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Price (₦)</Label>
                      <Input
                        type="number"
                        value={variation.price}
                        onChange={(e) => onUpdateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="h-12 px-4 rounded-xl border-white bg-white shadow-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all font-black"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Availability</Label>
                      <Input
                        type="number"
                        value={variation.stock || 0}
                        onChange={(e) => onUpdateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="h-12 px-4 rounded-xl border-white bg-white shadow-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Mass (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={variation.weightKg ?? ''}
                          onChange={(e) => onUpdateVariation(index, 'weightKg', e.target.value === '' ? null : parseFloat(e.target.value) || 0)}
                          placeholder="0.0"
                          className="w-32 h-10 px-4 rounded-xl border-white bg-white shadow-sm text-xs font-bold"
                        />
                      </div>
                      {errors[`variation_${index}_image`] && (
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                          Invalid variation image
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={() => onRemoveVariation(index)}
                      variant="outline"
                      className="h-10 px-4 border-none text-red-500 hover:bg-red-50 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      <Minus className="h-3 w-3 mr-2" />
                      Remove variation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {variations.length === 0 && (
          <div className="py-20 border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center bg-gray-50/30">
            <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center mb-6">
              <Layers className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">No variations yet</p>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">Add a variation or import rows from a CSV file</p>
          </div>
        )}
      </div>
    </div>
  )
}
