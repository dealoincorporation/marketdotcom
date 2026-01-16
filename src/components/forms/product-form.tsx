'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Product, Category } from '@prisma/client'
import { validateProductForm } from '@/lib/helpers'

interface ProductFormType {
  name: string
  description: string
  basePrice: number
  categoryId: string
  stock: number
  unit: string
  inStock: boolean
  images: string[]
  variations: Array<{
    id?: string
    name: string
    price: number
    stock: number
  }>
}

interface ProductFormProps {
  initialData?: any
  categories: Category[]
  onSubmit: (data: ProductFormType) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface Variation {
  id?: string
  name: string
  price: number
  stock: number
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormType>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || 0,
    categoryId: initialData?.categoryId || '',
    stock: initialData?.stock || 0,
    unit: initialData?.unit || '',
    inStock: initialData?.inStock ?? true,
    images: Array.isArray(initialData?.images) ? initialData.images : (initialData?.image ? [initialData.image] : []),
    variations: initialData?.variations?.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      stock: v.stock,
    })) || [],
  })

  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(formData.images)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ProductFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate files
    const validFiles: File[] = []
    const validationErrors: string[] = []

    files.forEach((file, index) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        validationErrors.push(`File ${index + 1}: Only image files are allowed`)
        return
      }

      // Validate file size (max 5MB per file)
      if (file.size > 5 * 1024 * 1024) {
        validationErrors.push(`File ${index + 1}: File size must be less than 5MB`)
        return
      }

      // Check total images limit (max 10 images)
      if (imagePreviews.length + validFiles.length >= 10) {
        validationErrors.push(`Cannot add more than 10 images total`)
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length === 0) {
      if (validationErrors.length > 0) {
        setErrors(prev => ({ ...prev, images: validationErrors.join('. ') }))
      }
      return
    }

    setUploadingImages(true)
    setErrors(prev => ({ ...prev, images: '' }))

    try {
      const formDataObj = new FormData()
      validFiles.forEach(file => {
        formDataObj.append('files', file)
      })
      formDataObj.append('folder', 'marketdotcom/products')

      // Get auth token from localStorage
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formDataObj,
      })

      const data = await response.json()

      if (response.ok && data.successfulUploads > 0) {
        const newUrls = data.results.map((result: any) => result.url)
        setImagePreviews(prev => [...prev, ...newUrls])
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newUrls]
        }))
        setSelectedImages(prev => [...prev, ...validFiles])

        if (data.failedUploads > 0) {
          setErrors(prev => ({
            ...prev,
            images: `${data.failedUploads} file(s) failed to upload`
          }))
        }
      } else {
        setErrors(prev => ({
          ...prev,
          images: data.errors?.[0]?.error || 'Failed to upload images'
        }))
      }
    } catch (error) {
      console.error('Image upload error:', error)
      setErrors(prev => ({ ...prev, images: 'Network error. Please try again.' }))
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [
        ...prev.variations,
        { name: '', price: 0, stock: 0 }
      ]
    }))
  }

  const updateVariation = (index: number, field: keyof Variation, value: any) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === index ? { ...variation, [field]: value } : variation
      )
    }))
  }

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateProductForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-0"
    >
      <Card className="shadow-xl">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {initialData?.id ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Image Upload */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Product Images ({imagePreviews.length}/10)</Label>
              <div className="space-y-4">
                {/* Image Previews Grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square border border-gray-200 rounded-lg overflow-hidden">
                          <img
                            src={preview}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Image {index + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                {imagePreviews.length < 10 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                        <div className="text-center">
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2 group-hover:text-gray-600" />
                          <span className="text-xs sm:text-sm text-gray-500">
                            {imagePreviews.length === 0 ? 'Upload Images' : 'Add More'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploadingImages}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-2">
                        Upload high-quality images of your product (max 10 images)
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Recommended size: 800x800px. Max 5MB per file. Formats: JPG, PNG, WebP
                      </p>
                      {uploadingImages && (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                          <p className="text-sm text-orange-600">Uploading to Cloudinary...</p>
                        </div>
                      )}
                      {selectedImages.length > 0 && !uploadingImages && (
                        <p className="text-sm text-green-600">
                          ✓ {selectedImages.length} image(s) uploaded successfully
                        </p>
                      )}
                      {errors.images && (
                        <p className="text-sm text-red-600">
                          ✗ {errors.images}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                >
                  <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="hover:bg-gray-50 focus:bg-gray-50">
                        <div className="flex items-center space-x-2">
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
                  <p className="text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₦) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => handleInputChange('basePrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={errors.basePrice ? 'border-red-500' : ''}
                />
                {errors.basePrice && (
                  <p className="text-sm text-red-600">{errors.basePrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  placeholder="kg, liter, piece, etc."
                  className={errors.unit ? 'border-red-500' : ''}
                />
                {errors.unit && (
                  <p className="text-sm text-red-600">{errors.unit}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.stock ? 'border-red-500' : ''}
                />
                {errors.stock && (
                  <p className="text-sm text-red-600">{errors.stock}</p>
                )}
              </div>

              <div className="flex items-center space-x-3 pt-6 sm:pt-8">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => handleInputChange('inStock', e.target.checked)}
                  className="w-5 h-5 sm:w-4 sm:h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <Label htmlFor="inStock" className="text-sm sm:text-base font-medium cursor-pointer">
                  Product is in stock
                </Label>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
                className="min-h-[80px] sm:min-h-[100px] resize-none"
              />
            </div>

            {/* Variations */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <Label className="text-base font-semibold">Product Variations</Label>
                <Button
                  type="button"
                  onClick={addVariation}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variation
                </Button>
              </div>

              {formData.variations.length > 0 && (
                <div className="space-y-3">
                  {formData.variations.map((variation, index) => (
                    <div key={index} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <div className="sm:col-span-5">
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Name</Label>
                          <Input
                            value={variation.name}
                            onChange={(e) => updateVariation(index, 'name', e.target.value)}
                            placeholder="e.g., Small, Large, Red"
                            className="w-full"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Price (₦)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variation.price}
                            onChange={(e) => updateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <Label className="text-sm font-medium text-gray-700 mb-1 block">Stock</Label>
                          <Input
                            type="number"
                            min="0"
                            value={variation.stock}
                            onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full"
                          />
                        </div>
                        <div className="sm:col-span-1 flex justify-end">
                          <Button
                            type="button"
                            onClick={() => removeVariation(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50 w-full sm:w-auto"
                          >
                            <Minus className="h-4 w-4 sm:mr-0" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.variations.length === 0 && (
                <p className="text-sm text-gray-500 italic text-center sm:text-left">
                  No variations added. You can add variations for different sizes, colors, or packaging options.
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto order-1 sm:order-2"
              >
                {isLoading ? 'Saving...' : initialData?.id ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}