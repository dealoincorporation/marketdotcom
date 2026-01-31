'use client'

import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateProductForm } from "@/lib/helpers/index"
import { ProductFormProps } from './types'
import { ProductImageUpload } from './ProductImageUpload'
import { ProductBasicInfo } from './ProductBasicInfo'
import { ProductVariationsSection } from './ProductVariationsSection'
import { useProductForm } from './hooks/useProductForm'

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const {
    formData,
    imagePreviews,
    uploadingImages,
    uploadingVariationImages,
    errors,
    selectedImages,
    handleInputChange,
    handleImageUpload,
    removeImage,
    addVariation,
    updateVariation,
    removeVariation,
    handleVariationImageUpload,
    removeVariationImage,
    handleBulkVariationImport,
    handleSubmit,
  } = useProductForm({
    initialData,
    onSubmit,
  })

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {initialData?.id ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="text-orange-50 text-sm sm:text-base mt-1">
                {initialData?.id ? 'Update your product information' : 'Create a new product listing'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <ProductImageUpload
            imagePreviews={imagePreviews}
            uploadingImages={uploadingImages}
            errors={errors}
            selectedImages={selectedImages}
            onImageUpload={handleImageUpload}
            onRemoveImage={removeImage}
          />

          {/* Basic Information Section */}
          <ProductBasicInfo
            formData={formData}
            categories={categories}
            errors={errors}
            onInputChange={handleInputChange}
          />

          {/* Variations Section */}
          <ProductVariationsSection
            variations={formData.variations}
            onAddVariation={addVariation}
            onUpdateVariation={updateVariation}
            onRemoveVariation={removeVariation}
            onBulkImport={handleBulkVariationImport}
            onVariationImageUpload={handleVariationImageUpload}
            onRemoveVariationImage={removeVariationImage}
            uploadingVariationImages={uploadingVariationImages}
            errors={errors}
          />

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto h-12 text-base border-2 border-gray-300 hover:bg-gray-50 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 w-full sm:w-auto h-12 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </span>
              ) : (
                initialData?.id ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
