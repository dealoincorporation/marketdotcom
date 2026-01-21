'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Plus, Minus, FileText } from 'lucide-react'
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
    unit?: string
    quantity?: number
    image?: string
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
  unit?: string
  quantity?: number
  image?: string
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
  const [uploadingVariationImages, setUploadingVariationImages] = useState<Record<number, boolean>>({})
  const [variationImagePreviews, setVariationImagePreviews] = useState<Record<number, string>>(() => {
    // Initialize previews with existing variation images
    const previews: Record<number, string> = {}
    if (initialData?.variations) {
      initialData.variations.forEach((v: any, i: number) => {
        if (v.image) {
          previews[i] = v.image
        }
      })
    }
    return previews
  })

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(variationImagePreviews).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [])

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
    // If updating image field, also update preview
    if (field === 'image' && value) {
      setVariationImagePreviews(prev => {
        const newPreviews = { ...prev }
        // Cleanup old blob URL if exists
        if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
          URL.revokeObjectURL(newPreviews[index])
        }
        newPreviews[index] = value
        return newPreviews
      })
    }
  }

  const removeVariation = (index: number) => {
    // Cleanup preview URL if exists
    if (variationImagePreviews[index]) {
      URL.revokeObjectURL(variationImagePreviews[index])
    }
    setVariationImagePreviews(prev => {
      const newPreviews = { ...prev }
      delete newPreviews[index]
      return newPreviews
    })
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }))
  }

  const handleVariationImageUpload = async (index: number, file: File | undefined) => {
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please choose an image smaller than 5MB.')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      return
    }

    // Create local preview immediately
    const localPreviewUrl = URL.createObjectURL(file)
    setVariationImagePreviews(prev => ({ ...prev, [index]: localPreviewUrl }))
    setUploadingVariationImages(prev => ({ ...prev, [index]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {}

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      console.log(`Uploading image for variation ${index + 1}: ${file.name}`)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      const imageUrl = data.url

      // Update preview with final URL first (before cleanup)
      setVariationImagePreviews(prev => {
        const newPreviews = { ...prev }
        // Cleanup local preview if it exists
        if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
          URL.revokeObjectURL(newPreviews[index])
        }
        // Set final URL
        newPreviews[index] = imageUrl
        return newPreviews
      })

      // Update variation with uploaded URL
      updateVariation(index, 'image', imageUrl)

      console.log(`Image uploaded successfully for variation ${index + 1}`)

    } catch (error) {
      console.error('Error uploading variation image:', error)
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
      // Remove preview on error
      setVariationImagePreviews(prev => {
        const newPreviews = { ...prev }
        if (newPreviews[index]) {
          URL.revokeObjectURL(newPreviews[index])
        }
        delete newPreviews[index]
        return newPreviews
      })
    } finally {
      setUploadingVariationImages(prev => {
        const newState = { ...prev }
        delete newState[index]
        return newState
      })
    }
  }

  const handleBulkVariationImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const csv = e.target?.result as string
        const lines = csv.split('\n').filter(line => line.trim())

        if (lines.length < 2) {
          alert('CSV file must have at least a header row and one data row')
          return
        }

        // Parse header to understand column order
        const header = lines[0].toLowerCase().split(',').map(h => h.trim())

        const variationsToAdd: any[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))

          if (values.length < 5) continue // Skip incomplete rows

          const variation: any = {
            name: values[0] || '',
            price: parseFloat(values[3]) || 0,
            stock: parseInt(values[4]) || 0,
          }

          // Handle quantity and unit
          if (values[1] && !isNaN(parseFloat(values[1]))) {
            variation.quantity = parseFloat(values[1])
          }
          if (values[2]) {
            variation.unit = values[2]
          }

          // Handle image URL if provided
          if (values[5] && values[5].startsWith('http')) {
            variation.image = values[5]
          }

          if (variation.name) {
            variationsToAdd.push(variation)
          }
        }

        if (variationsToAdd.length === 0) {
          alert('No valid variations found in CSV')
          return
        }

        // Confirm import
        const confirmImport = confirm(`Import ${variationsToAdd.length} variations from CSV?`)
        if (!confirmImport) return

        // Add all variations
        const newVariations = [...formData.variations, ...variationsToAdd]
        setFormData(prev => ({
          ...prev,
          variations: newVariations
        }))

        alert(`Successfully imported ${variationsToAdd.length} variations!`)
      }

      reader.readAsText(file)
    } catch (error) {
      console.error('Error importing variations:', error)
      alert('Failed to import variations. Please check your CSV format.')
    }

    // Reset file input
    event.target.value = ''
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
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleBulkVariationImport}
                    className="hidden"
                    id="variation-csv-import"
                  />
                  <Button
                    type="button"
                    onClick={() => document.getElementById('variation-csv-import')?.click()}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 w-full sm:w-auto"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Import CSV</span>
                    <span className="sm:hidden">Import</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={addVariation}
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50 w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Add Variation</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </div>
              </div>

              {/* CSV Format Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📄</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base text-blue-800 mb-2 font-semibold">
                      CSV Bulk Import Format
                    </p>
                    <p className="text-sm text-blue-700 mb-3">
                      Columns: <code className="bg-white px-2 py-1 rounded font-mono text-xs">Name, Quantity, Unit, Price, Stock, ImageURL</code>
                    </p>
                    <p className="text-sm text-blue-600 bg-white/70 rounded-lg p-3 border border-blue-100">
                      <strong>Example:</strong><br />
                      <code className="font-mono text-xs">"Mama Gold, 2, kg, 4500, 25, https://example.com/image.jpg"</code>
                    </p>
                  </div>
                </div>
              </div>

              {formData.variations.length > 0 && (
                <div className="space-y-4">
                  {formData.variations.map((variation, index) => (
                    <div key={index} className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
                        <div className="col-span-1">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Name</Label>
                          <Input
                            value={variation.name}
                            onChange={(e) => updateVariation(index, 'name', e.target.value)}
                            placeholder="Mama Gold"
                            className="w-full h-11 text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={variation.quantity || ""}
                            onChange={(e) => updateVariation(index, 'quantity', parseFloat(e.target.value) || undefined)}
                            placeholder="1"
                            className="w-full h-11 text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Unit</Label>
                          <Select
                            value={variation.unit || ""}
                            onValueChange={(value) => updateVariation(index, 'unit', value)}
                          >
                            <SelectTrigger className="w-full h-11 bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-2 border-gray-300 shadow-xl max-h-60 overflow-y-auto z-50">
                              {/* Volume */}
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="l">L</SelectItem>
                              <SelectItem value="cup">cup</SelectItem>
                              {/* Weight */}
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lb">lb</SelectItem>
                              <SelectItem value="oz">oz</SelectItem>
                              {/* Count */}
                              <SelectItem value="pc">pc</SelectItem>
                              <SelectItem value="pcs">pcs</SelectItem>
                              <SelectItem value="pack">pack</SelectItem>
                              <SelectItem value="dozen">dozen</SelectItem>
                              {/* Packaging */}
                              <SelectItem value="bag">bag</SelectItem>
                              <SelectItem value="box">box</SelectItem>
                              <SelectItem value="bottle">bottle</SelectItem>
                              <SelectItem value="can">can</SelectItem>
                              <SelectItem value="tin">tin</SelectItem>
                              <SelectItem value="jar">jar</SelectItem>
                              {/* Other */}
                              <SelectItem value="roll">roll</SelectItem>
                              <SelectItem value="set">set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Price (₦)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variation.price}
                            onChange={(e) => updateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full h-11 text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-1 lg:col-span-1 xl:col-span-1">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Stock</Label>
                          <Input
                            type="number"
                            min="0"
                            value={variation.stock}
                            onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full h-11 text-base bg-white border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-lg"
                          />
                        </div>
                        {/* Variation Image Upload - Temporarily commented out */}
                        {/* <div className="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Variation Image</Label>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-700 mb-1">
                                Upload high-quality image for this variation
                              </p>
                              <p className="text-xs text-gray-500 mb-3">
                                Recommended size: 800x800px. Max 5MB per file. Formats: JPG, PNG, WebP
                              </p>
                            </div>

                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleVariationImageUpload(index, e.target.files?.[0])}
                              className="hidden"
                              id={`variation-image-${index}`}
                            />

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById(`variation-image-${index}`)?.click()}
                              disabled={uploadingVariationImages[index]}
                              className="flex items-center space-x-2 px-4 py-2 h-11 bg-white border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {uploadingVariationImages[index] ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                                  <span className="text-sm font-medium">Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  <span className="text-sm font-medium">Upload Image</span>
                                </>
                              )}
                            </Button>

                            {/* Image Preview - Show when image exists (uploaded or local preview) */}
                            {/* {(variation.image || variationImagePreviews[index]) && (
                              <div className="mt-3">
                                {variation.image && !uploadingVariationImages[index] && (
                                  <p className="text-sm text-green-600 mb-3">
                                    ✓ Image uploaded successfully
                                  </p>
                                )}
                                {uploadingVariationImages[index] && (
                                  <p className="text-sm text-orange-600 mb-3">
                                    ⏳ Uploading image...
                                  </p>
                                )}

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm">
                                  <div className="flex items-start space-x-3">
                                    <div className="relative group flex-shrink-0">
                                      <img
                                        src={variationImagePreviews[index] || variation.image}
                                        alt={`${variation.name || 'Variation'} image`}
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-gray-300 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => window.open(variationImagePreviews[index] || variation.image, '_blank')}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          updateVariation(index, 'image', '')
                                          setVariationImagePreviews(prev => {
                                            const newPreviews = { ...prev }
                                            if (newPreviews[index]) {
                                              URL.revokeObjectURL(newPreviews[index])
                                            }
                                            delete newPreviews[index]
                                            return newPreviews
                                          })
                                        }}
                                        className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">Click to enlarge</span>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-700 mb-1 font-medium">
                                        Variation Image Preview
                                      </p>
                                      <p className="text-xs text-gray-600 mb-2">
                                        {uploadingVariationImages[index] 
                                          ? 'Uploading your image...' 
                                          : 'Click image to view full size or use the X to remove'}
                                      </p>
                                      {!uploadingVariationImages[index] && (
                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                          <span>800x800px recommended</span>
                                          <span>•</span>
                                          <span>JPG, PNG, WebP</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div> */}
                        <div className="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2 flex justify-end items-end pt-6">
                          <Button
                            type="button"
                            onClick={() => removeVariation(index)}
                            variant="outline"
                            className="text-red-600 border-2 border-red-600 hover:bg-red-50 hover:border-red-700 w-full h-11 rounded-lg font-medium"
                          >
                            <Minus className="h-4 w-4 mr-2" />
                            Remove Variation
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