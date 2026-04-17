'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProductImageUploadProps {
  imagePreviews: string[]
  uploadingImages: boolean
  errors: Record<string, string>
  selectedImages: File[]
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (index: number) => void
}

export function ProductImageUpload({
  imagePreviews,
  uploadingImages,
  errors,
  selectedImages,
  onImageUpload,
  onRemoveImage,
}: ProductImageUploadProps) {
  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <div className="p-3 bg-orange-100 rounded-2xl shadow-sm">
          <ImageIcon className="h-5 w-5 text-orange-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Product images</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Up to 10 images ({imagePreviews.length}/10 uploaded)</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Upload Area - Redesigned as Premium Dropzone */}
        {imagePreviews.length < 10 && (
          <div className="relative group/zone">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-transparent rounded-[2.5rem] blur opacity-0 group-hover/zone:opacity-100 transition-opacity" />
            <div className="relative border-2 border-dashed border-gray-100 rounded-[2.5rem] p-10 bg-white shadow-sm hover:border-orange-400 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/20 via-transparent to-transparent opacity-0 group-hover/zone:opacity-100 transition-opacity" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-6 rounded-[2rem] bg-orange-50 border border-orange-100 flex items-center justify-center group-hover/zone:scale-110 group-hover/zone:rotate-3 transition-transform duration-500">
                  <Upload className="h-10 w-10 text-orange-600" strokeWidth={1.5} />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">
                    {imagePreviews.length === 0 ? 'Upload images' : 'Add more images'}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    JPG, PNG, or WebP • Max 5MB per image
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onImageUpload}
                  disabled={uploadingImages}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                />

                {uploadingImages && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 mt-6 px-5 py-2.5 bg-gray-900 rounded-full shadow-2xl"
                  >
                    <div className="animate-spin rounded-full h-3 w-3 border-[1.5px] border-white/30 border-t-white"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Uploading...</span>
                  </motion.div>
                )}
              </div>
            </div>

            {errors.images && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-4 text-[9px] font-black text-red-500 uppercase tracking-widest ml-1"
              >
                {errors.images}
              </motion.p>
            )}
          </div>
        )}

        {/* Image Previews Grid - Redesigned with Cinematic Hover and Glass Frames */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
            {imagePreviews.map((preview, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                layout
                className="relative aspect-square"
              >
                <div className="group relative h-full w-full rounded-[2rem] overflow-hidden bg-gray-100 shadow-lg border border-white transition-all duration-500 hover:shadow-2xl hover:scale-[1.05] hover:z-10">
                  <img
                    src={preview}
                    alt={`Product image ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Glass Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="p-3 bg-red-500/90 text-white rounded-2xl hover:bg-red-600 transition-all hover:scale-110 active:scale-90 shadow-xl"
                    >
                      <X className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Slot Indicator */}
                  <div className="absolute top-4 left-4 h-6 px-2.5 glass-effect bg-black/30 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
                    <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Image {index + 1}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
