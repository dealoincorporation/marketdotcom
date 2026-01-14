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
  image?: string
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
    image: initialData?.image || '',
    variations: initialData?.variations?.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      stock: v.stock,
    })) || [],
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(formData.image || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ProductFormType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }))
      return
    }

    setUploadingImage(true)
    setErrors(prev => ({ ...prev, image: '' }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'marketdotcom/products')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setImagePreview(data.url)
        setFormData(prev => ({ ...prev, image: data.url }))
        setSelectedImage(file) // Keep file reference for display
      } else {
        setErrors(prev => ({ ...prev, image: data.error || 'Failed to upload image' }))
      }
    } catch (error) {
      console.error('Image upload error:', error)
      setErrors(prev => ({ ...prev, image: 'Network error. Please try again.' }))
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image: '' }))
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
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {initialData?.id ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Upload */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Product Image</Label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:text-gray-600" />
                        <span className="text-sm text-gray-500">Upload</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a high-quality image of your product
                  </p>
                  <p className="text-xs text-gray-500">
                    Recommended size: 800x800px. Max: 5MB. Formats: JPG, PNG, WebP
                  </p>
                  {uploadingImage && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      <p className="text-sm text-orange-600">Uploading to Cloudinary...</p>
                    </div>
                  )}
                  {selectedImage && !uploadingImage && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Image uploaded successfully
                    </p>
                  )}
                  {errors.image && (
                    <p className="text-sm text-red-600 mt-2">
                      ✗ {errors.image}
                    </p>
                  )}
                </div>
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

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => handleInputChange('inStock', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <Label htmlFor="inStock" className="text-sm font-medium">
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
                rows={4}
              />
            </div>

            {/* Variations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Product Variations</Label>
                <Button
                  type="button"
                  onClick={addVariation}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-600 hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variation
                </Button>
              </div>

              {formData.variations.length > 0 && (
                <div className="space-y-3">
                  {formData.variations.map((variation, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <Input
                          value={variation.name}
                          onChange={(e) => updateVariation(index, 'name', e.target.value)}
                          placeholder="Variation name (e.g., Small, Large, Red)"
                        />
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variation.price}
                          onChange={(e) => updateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="Price"
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="0"
                          value={variation.stock}
                          onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                          placeholder="Stock"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeVariation(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {formData.variations.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No variations added. You can add variations for different sizes, colors, or packaging options.
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700"
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