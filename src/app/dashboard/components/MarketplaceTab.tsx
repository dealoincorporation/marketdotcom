"use client"

import { useState } from "react"
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Browse and shop from our wide selection of fresh products</p>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <SelectContent className="bg-white border-gray-300 shadow-lg">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                <SelectContent className="bg-white border-gray-300 shadow-lg">
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
                <SelectContent className="bg-white border-gray-300 shadow-lg">
                  <SelectItem value="all">All Variations</SelectItem>
                  {(() => {
                    const selectedProd = products.find(p => p.id === selectedProduct)
                    return selectedProd?.variations?.map(variation => (
                      <SelectItem key={variation.id} value={variation.id}>
                        {variation.name} - {formatPrice(variation.price)}
                      </SelectItem>
                    )) || []
                  })()}
                </SelectContent>
              </Select>
            </div>
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
                    Variation: {(() => {
                      const selectedProd = products.find(p => p.id === selectedProduct)
                      const variation = selectedProd?.variations?.find(v => v.id === selectedVariation)
                      return variation?.name
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
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            nextImage(product.id, product.images)
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        {/* Image Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setCurrentImageIndex(product.id, index)
                              }}
                              className={`w-2 h-2 rounded-full ${
                                index === getCurrentImageIndex(product.id)
                                  ? 'bg-white'
                                  : 'bg-white/50'
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
                    {formatPrice(product.basePrice)}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    per {product.unit}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Category:</span> {product.category.name}
                </div>

                {/* Variations */}
                {product.variations.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variations
                    </label>
                    <Select
                      value={selectedVariations[product.id] || ""}
                      onValueChange={(value) => handleVariationChange(product.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select variation" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300 shadow-lg">
                        {product.variations.map(variation => (
                          <SelectItem key={variation.id} value={variation.id}>
                            {variation.name} - {formatPrice(variation.price)}
                          </SelectItem>
                        ))}
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
                  disabled={!product.inStock || (quantities[product.id] || 0) <= 0}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
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