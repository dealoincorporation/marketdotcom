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
    <Card className="border-2 border-gray-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">Product Images</CardTitle>
            <p className="text-sm text-gray-600 mt-0.5">{imagePreviews.length}/10 images uploaded</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Image Previews Grid */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  <div className="aspect-square border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-md hover:shadow-xl transition-all duration-200 group-hover:border-orange-400">
                    <img
                      src={preview}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 active:bg-red-700 transition-all shadow-lg opacity-0 group-hover:opacity-100 touch-manipulation"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white font-medium text-center">
                        Image {index + 1}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {imagePreviews.length < 10 && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-orange-400 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 transition-all duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-2xl flex items-center justify-center bg-white group-hover:border-orange-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 group-hover:text-orange-500" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onImageUpload}
                    disabled={uploadingImages}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">
                    {imagePreviews.length === 0 ? 'Click to upload images' : 'Click to add more images'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Recommended: 800x800px • Max 5MB per file • JPG, PNG, WebP
                  </p>
                  {uploadingImages && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-600 border-t-transparent"></div>
                      <p className="text-sm font-medium text-orange-600">Uploading...</p>
                    </div>
                  )}
                  {selectedImages.length > 0 && !uploadingImages && (
                    <div className="pt-2">
                      <p className="text-sm font-medium text-green-600 flex items-center justify-center gap-1">
                        <span className="text-lg">✓</span> {selectedImages.length} image(s) uploaded successfully
                      </p>
                    </div>
                  )}
                  {errors.images && (
                    <div className="pt-2">
                      <p className="text-sm font-medium text-red-600 flex items-center justify-center gap-1">
                        <span className="text-lg">✗</span> {errors.images}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
