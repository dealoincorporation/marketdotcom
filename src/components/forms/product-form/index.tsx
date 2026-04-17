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
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
        <form onSubmit={handleSubmit} className="space-y-16">
          <div className="space-y-16">
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
          </div>

          {/* Form actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-5 pt-12 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-40 h-14 border border-white/70 bg-white/85 backdrop-blur-sm rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-all hover:bg-gray-50 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-64 h-14 rounded-xl bg-gray-900 border border-white/20 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-transparent to-orange-600/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5 text-orange-500" />
                    {initialData?.id ? 'Update product' : 'Create product'}
                  </>
                )}
              </div>
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
