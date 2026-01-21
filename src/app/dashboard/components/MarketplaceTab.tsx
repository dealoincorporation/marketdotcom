"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  Star,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  categoryId: string
  category: { id: string; name: string }
  stock: number
  unit: string
  inStock: boolean
  images: string[]
  variations: Array<{
    id: string
    name: string
    price: number
    stock: number
    unit?: string
    quantity?: number
    image?: string
  }>
}

interface MarketplaceTabProps {
  products: Product[]
  categories: Array<{ id: string; name: string }>
  selectedCategory: string
  selectedProduct: string
  selectedVariation: string
  filteredProducts: Product[]
  onCategoryChange: (category: string) => void
  onProductChange: (product: string) => void
  onVariationChange: (variation: string) => void
  onAddToCart: (product: Product, variation?: any, quantity?: number) => void
}

export default function MarketplaceTab({
  products,
  categories,
  selectedCategory,
  selectedProduct,
  selectedVariation,
  filteredProducts,
  onCategoryChange,
  onProductChange,
  onVariationChange,
  onAddToCart
}: MarketplaceTabProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: string }>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<string, number>>({})

  // Auto-select first available option for products
  useEffect(() => {
    const newSelections: { [key: string]: string } = {}
    products.forEach(product => {
      if (!selectedVariations[product.id]) {
        // If base product has stock, select it
        if (product.stock > 0) {
          newSelections[product.id] = "base"
        }
        // Otherwise, find first available variation
        else if (product.variations.length > 0) {
          const availableVariation = product.variations.find(v => v.stock > 0)
          if (availableVariation) {
            newSelections[product.id] = availableVariation.id
          }
        }
      }
    })
    if (Object.keys(newSelections).length > 0) {
      setSelectedVariations(prev => ({ ...prev, ...newSelections }))
    }
  }, [products, selectedVariations])

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }))
  }

  const handleVariationChange = (productId: string, variationId: string) => {
    setSelectedVariations(prev => ({
      ...prev,
      [productId]: variationId
    }))
  }

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`
  }

  // Image slider functions
  const getCurrentImageIndex = (productId: string) => {
    return currentImageIndexes[productId] || 0
  }

  const setCurrentImageIndex = (productId: string, index: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: index
    }))
  }

  const nextImage = (productId: string, images: string[]) => {
    const currentIndex = getCurrentImageIndex(productId)
    const nextIndex = (currentIndex + 1) % images.length
    setCurrentImageIndex(productId, nextIndex)
  }

  const prevImage = (productId: string, images: string[]) => {
    const currentIndex = getCurrentImageIndex(productId)
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setCurrentImageIndex(productId, prevIndex)
  }

  // Apply search filter to the already filtered products
  const searchFilteredProducts = filteredProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        {/* Search Bar */}
        <div className="mt-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Find Products</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 ${selectedCategory !== "all" ? "md:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <span>1. Select Category</span>
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => onCategoryChange("all")}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </label>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 shadow-lg z-50">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory !== "all" && (
              <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <span>2. Select Product</span>
                {selectedProduct !== "all" && (
                  <button
                    onClick={() => onProductChange("all")}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </label>
              <Select
                value={selectedProduct}
                onValueChange={onProductChange}
                disabled={selectedCategory === "all"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedCategory === "all" ? "Select category first" : "All Products"} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 shadow-lg z-50">
                  <SelectItem value="all">All Products</SelectItem>
                  {products
                    .filter(product => selectedCategory === "all" || product.categoryId === selectedCategory)
                    .map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <span>3. Select Variation (Optional)</span>
                {selectedVariation !== "all" && (
                  <button
                    onClick={() => onVariationChange("all")}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </label>
              <Select
                value={selectedVariation}
                onValueChange={onVariationChange}
                disabled={selectedProduct === "all"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedProduct === "all" ? "Select product first" : "All Variations"} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 shadow-lg z-50">
                  <SelectItem value="all">All Variations</SelectItem>
                  {(() => {
                    const selectedProd = products.find(p => p.id === selectedProduct)
                        const options = []

                        // Add base product option if it has stock
                        if (selectedProd?.stock && selectedProd.stock > 0) {
                          options.push(
                            <SelectItem key="base" value="base" className="flex items-center space-x-2 font-medium">
                              <span>Standard - {formatPrice(selectedProd.basePrice)} ({selectedProd.stock} left)</span>
                            </SelectItem>
                          )
                        }

                        // Add variation options
                        selectedProd?.variations
                          ?.filter(variation => variation.stock > 0)
                          ?.forEach(variation => {
                            const displayName = variation.quantity && variation.unit
                              ? `${variation.quantity} ${variation.unit} ${variation.name}`
                              : variation.name;
                            options.push(
                              <SelectItem key={variation.id} value={variation.id} className="flex items-center space-x-2">
                                {variation.image && (
                                  <img
                                    src={variation.image}
                                    alt={variation.name}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                )}
                                <span>{displayName} - {formatPrice(variation.price)} ({variation.stock} left)</span>
                      </SelectItem>
                            );
                          })

                        return options.length > 0 ? options : [<SelectItem key="none" value="none" disabled>No options available</SelectItem>]
                  })()}
                </SelectContent>
              </Select>
            </div>
              </>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== "all" || selectedProduct !== "all" || selectedVariation !== "all") && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {categories.find(c => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => onCategoryChange("all")}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedProduct !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Product: {products.find(p => p.id === selectedProduct)?.name}
                    <button
                      onClick={() => onProductChange("all")}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedVariation !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {(() => {
                      const selectedProd = products.find(p => p.id === selectedProduct)
                      const variation = selectedProd?.variations?.find(v => v.id === selectedVariation)
                      if (!variation) return null;
                      const displayName = variation.quantity && variation.unit
                        ? `${variation.quantity} ${variation.unit} ${variation.name}`
                        : variation.name;
                      return (
                        <>
                          {variation.image && (
                            <img
                              src={variation.image}
                              alt={variation.name}
                              className="w-4 h-4 object-cover rounded"
                            />
                          )}
                          Variation: {displayName}
                        </>
                      );
                    })()}
                    <button
                      onClick={() => onVariationChange("all")}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <button
                  onClick={() => {
                    onCategoryChange("all")
                    onProductChange("all")
                    onVariationChange("all")
                  }}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {searchFilteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
              {/* Product Image Slider */}
              <div className="relative h-32 sm:h-40 lg:h-48 bg-gray-100 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[getCurrentImageIndex(product.id)]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Image Navigation */}
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            prevImage(product.id, product.images)
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-70 hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            nextImage(product.id, product.images)
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 hover:bg-black/70 text-white rounded-full opacity-70 hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        {/* Image Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 opacity-60 hover:opacity-100 transition-opacity">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setCurrentImageIndex(product.id, index)
                              }}
                              className={`w-2 h-2 rounded-full transition-all duration-200 hover:scale-110 ${
                                index === getCurrentImageIndex(product.id)
                                  ? 'bg-white shadow-lg'
                                  : 'bg-white/60 hover:bg-white/80'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <Package className="h-12 w-12 sm:h-16 sm:w-16 text-orange-400" />
                  </div>
                )}

                {/* Image Count Indicator */}
                {product.images && product.images.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 backdrop-blur-sm">
                    <span>{product.images.length}</span>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight mb-1 sm:mb-0">
                    {product.name}
                  </h3>
                  <Badge variant={product.inStock ? "default" : "secondary"} className="self-start sm:ml-2 text-xs">
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl sm:text-2xl font-bold text-orange-600">
                    {(() => {
                      const selectedVariationId = selectedVariations[product.id]
                      const selectedVariation = selectedVariationId
                        ? product.variations.find(v => v.id === selectedVariationId)
                        : null
                      return formatPrice(selectedVariation?.price || product.basePrice)
                    })()}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    per {(() => {
                      const selectedVariationId = selectedVariations[product.id]
                      const selectedVariation = selectedVariationId
                        ? product.variations.find(v => v.id === selectedVariationId)
                        : null
                      return selectedVariation?.unit || product.unit
                    })()}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Category:</span> {product.category.name}
                </div>

                {/* Variations */}
                {product.variations.length > 0 && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Variation <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectedVariations[product.id] || ""}
                      onValueChange={(value) => handleVariationChange(product.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={product.stock > 0 ? "Standard or choose option" : "Choose an option"} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300 shadow-lg z-50">
                        {/* Base product option - if it has stock */}
                        {product.stock > 0 && (
                          <SelectItem value="base" className="flex items-center space-x-2 font-medium">
                            <span>Standard - {formatPrice(product.basePrice)} ({product.stock} left)</span>
                          </SelectItem>
                        )}
                        {/* Variation options */}
                        {product.variations
                          .filter(variation => variation.stock > 0) // Only show in-stock variations
                          .map(variation => {
                            const displayName = variation.quantity && variation.unit
                              ? `${variation.quantity} ${variation.unit} ${variation.name}`
                              : variation.name;
                            return (
                              <SelectItem key={variation.id} value={variation.id} className="flex items-center space-x-2">
                                {variation.image && (
                                  <img
                                    src={variation.image}
                                    alt={variation.name}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                )}
                                <span>{displayName} - {formatPrice(variation.price)} ({variation.stock} left)</span>
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 0) - 1)}
                      disabled={(quantities[product.id] || 0) <= 0}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 sm:w-12 text-center font-medium text-sm sm:text-base">
                      {quantities[product.id] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 0) + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">
                    Stock: {product.stock} {product.unit}
                  </span>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => {
                    const quantity = quantities[product.id] || 1
                    const selectedVariationId = selectedVariations[product.id]
                    const variation = selectedVariationId
                      ? product.variations.find(v => v.id === selectedVariationId)
                      : undefined

                    onAddToCart(product, variation, quantity)
                  }}
                  disabled={Boolean(
                    !product.inStock ||
                    (quantities[product.id] || 0) <= 0 ||
                    // Disable if variations exist but no option selected AND base product not available
                    (product.variations.length > 0 && !selectedVariations[product.id] && product.stock <= 0) ||
                    // Disable if a variation is selected but out of stock
                    (selectedVariations[product.id] && selectedVariations[product.id] !== "base" && product.variations.find(v => v.id === selectedVariations[product.id])?.stock === 0)
                  )}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {(!selectedVariations[product.id] && product.variations.length > 0 && product.stock <= 0)
                    ? "Select Option"
                    : "Add to Cart"
                  }
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {searchFilteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {filteredProducts.length === 0
              ? "Try adjusting your filters to see more products."
              : "No products match your search term. Try a different search."
            }
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}