import { useState } from 'react'
import { ProductFormType, Variation } from '../types'
import { validateProductForm } from "@/lib/helpers/index"
import { normalizeImageUrls } from '@/lib/image-utils'

interface UseProductFormProps {
  initialData?: any
  onSubmit: (data: ProductFormType) => Promise<void>
}

export function useProductForm({ initialData, onSubmit }: UseProductFormProps) {
  const [formData, setFormData] = useState<ProductFormType>({
    groupName: initialData?.groupName || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    basePrice: initialData?.basePrice || 0,
    categoryId: initialData?.categoryId || '',
    stock: initialData?.stock || 0,
    unit: initialData?.unit || '',
    inStock: initialData?.inStock ?? true,
    weightKg: initialData?.weightKg !== undefined ? initialData.weightKg : null,
    deliveryFee: initialData?.deliveryFee !== undefined ? initialData.deliveryFee : null,
    images: normalizeImageUrls(initialData?.images, initialData?.image),
    variations: initialData?.variations?.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      stock: v.stock,
      quantity: v.quantity,
      image: v.image,
    })) || [],
  })

  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>(formData.images)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadingVariationImages, setUploadingVariationImages] = useState<Record<number, boolean>>({})
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

    const validFiles: File[] = []
    const validationErrors: string[] = []

    files.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        validationErrors.push(`File ${index + 1}: Only image files are allowed`)
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        validationErrors.push(`File ${index + 1}: File size must be less than 5MB`)
        return
      }

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
        { price: 0, stock: 0, quantity: '' }
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

  const handleVariationImageUpload = async (variationIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        [`variation_${variationIndex}_image`]: 'Only image files are allowed'
      }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [`variation_${variationIndex}_image`]: 'File size must be less than 5MB'
      }))
      return
    }

    setUploadingVariationImages(prev => ({ ...prev, [variationIndex]: true }))
    setErrors(prev => ({ ...prev, [`variation_${variationIndex}_image`]: '' }))

    try {
      const formDataObj = new FormData()
      formDataObj.append('files', file)
      formDataObj.append('folder', 'marketdotcom/products')

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
        const imageUrl = data.results[0]?.url
        if (imageUrl) {
          updateVariation(variationIndex, 'image', imageUrl)
        }
      } else {
        setErrors(prev => ({
          ...prev,
          [`variation_${variationIndex}_image`]: data.errors?.[0]?.error || 'Failed to upload image'
        }))
      }
    } catch (error) {
      console.error('Variation image upload error:', error)
      setErrors(prev => ({
        ...prev,
        [`variation_${variationIndex}_image`]: 'Network error. Please try again.'
      }))
    } finally {
      setUploadingVariationImages(prev => {
        const newState = { ...prev }
        delete newState[variationIndex]
        return newState
      })
    }

    e.target.value = ''
  }

  const removeVariationImage = (variationIndex: number) => {
    updateVariation(variationIndex, 'image', undefined)
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

        const variationsToAdd: any[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))

          // Updated format: Name, Quantity, Price, Stock, ImageURL
          if (values.length < 4) continue

          const variation: any = {
            name: values[0] || '',
            price: parseFloat(values[2]) || 0,
            stock: parseInt(values[3]) || 0,
          }

          // Quantity can be text like "2 kg" or just a number
          if (values[1]) {
            variation.quantity = values[1]
          }
          
          // Image URL (optional, 4th column)
          if (values[3] && values[3].startsWith('http')) {
            variation.image = values[3]
          }

          // Require quantity for a valid variation
          if (variation.quantity) {
            variationsToAdd.push(variation)
          }
        }

        if (variationsToAdd.length === 0) {
          alert('No valid variations found in CSV')
          return
        }

        const confirmImport = confirm(`Import ${variationsToAdd.length} variations from CSV?`)
        if (!confirmImport) return

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

  return {
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
  }
}
