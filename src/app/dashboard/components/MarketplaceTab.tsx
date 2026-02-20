"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Package, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MarketplaceProductCard, type MarketplaceProduct } from "@/components/marketplace/MarketplaceProductCard"

type Product = MarketplaceProduct

interface MarketplaceTabProps {
  products: Product[]
  categories: Array<{ id: string; name: string }>
  selectedCategory: string
  selectedGroup: string
  selectedBrand: string
  filteredProducts: Product[]
  onCategoryChange: (category: string) => void
  onGroupChange: (group: string) => void
  onBrandChange: (brandProductId: string) => void
  onAddToCart: (product: Product, variation?: any, quantity?: number) => void
}

export default function MarketplaceTab({
  products,
  categories,
  selectedCategory,
  selectedGroup,
  selectedBrand,
  filteredProducts,
  onCategoryChange,
  onGroupChange,
  onBrandChange,
  onAddToCart
}: MarketplaceTabProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [selectedVariations, setSelectedVariations] = useState<{ [key: string]: string }>({})
  const [searchTerm, setSearchTerm] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)
  const productIdsKeyRef = useRef<string>("")

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])
  // (moved image carousel logic into MarketplaceProductCard)

  // Auto-select first available option for products (only when product list actually changes, to avoid re-renders on focus/click)
  useEffect(() => {
    const productIdsKey = products.map(p => p.id).sort().join(",")
    if (productIdsKey === productIdsKeyRef.current) return
    productIdsKeyRef.current = productIdsKey

    const newSelections: { [key: string]: string } = {}
    products.forEach(product => {
      // If base product has stock, select it
      if (product.stock > 0) {
        newSelections[product.id] = "base"
      }
      // Otherwise, find first available variation
      else if (product.variations?.length > 0) {
        const availableVariation = product.variations.find((v: { stock: number }) => v.stock > 0)
        if (availableVariation) {
          newSelections[product.id] = availableVariation.id
        }
      }
    })
    if (Object.keys(newSelections).length > 0) {
      setSelectedVariations(prev => ({ ...prev, ...newSelections }))
    }
  }, [products])

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

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`

  const categoryProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.categoryId === selectedCategory)

  const groupOptions = Array.from(
    new Set(
      categoryProducts.map((p) => (p as any).groupName || p.name).filter(Boolean)
    )
  ).sort((a, b) => String(a).localeCompare(String(b)))

  const productsInGroup =
    selectedGroup === "all"
      ? categoryProducts
      : categoryProducts.filter((p) => ((p as any).groupName || p.name) === selectedGroup)

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
      <div className="mb-4">
        {/* Search Bar — plain input to avoid form/component remounting issues */}
        <div className="mt-0 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              inputMode="search"
              placeholder="Search products, categories..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault() }}
              autoComplete="off"
              spellCheck={false}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); searchInputRef.current?.focus() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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
          <div className={`grid grid-cols-1 ${selectedCategory !== "all" ? "md:grid-cols-4" : "md:grid-cols-2"} gap-6`}>
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
                <SelectContent position="popper" sideOffset={6} collisionPadding={12} className="bg-white border-gray-300 shadow-lg">
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
                {selectedGroup !== "all" && (
                  <button
                    onClick={() => {
                      onGroupChange("all")
                      onBrandChange("all")
                    }}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </label>
              <Select
                value={selectedGroup}
                onValueChange={(v) => {
                  onGroupChange(v)
                  onBrandChange("all")
                }}
                disabled={selectedCategory === "all"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={6} collisionPadding={12} className="bg-white border-gray-300 shadow-lg">
                  <SelectItem value="all">All Products</SelectItem>
                  {groupOptions.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g} {groupOptions.length > 0 ? "" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGroup !== "all" && (
                <p className="text-xs text-gray-500">
                  Showing {(productsInGroup || []).length} brand(s) under <span className="font-medium">{selectedGroup}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <span>3. Select Variation (Brand)</span>
                {selectedBrand !== "all" && (
                  <button
                    onClick={() => onBrandChange("all")}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                )}
              </label>
              <Select
                value={selectedBrand}
                onValueChange={onBrandChange}
                disabled={selectedGroup === "all"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedGroup === "all" ? "Select product first" : "All brands"} />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={6} collisionPadding={12} className="bg-white border-gray-300 shadow-lg">
                  <SelectItem value="all">All brands</SelectItem>
                  {productsInGroup.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
              </>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== "all" || selectedGroup !== "all" || selectedBrand !== "all") && (
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
                {selectedGroup !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Product: {selectedGroup}
                    <button
                      onClick={() => onGroupChange("all")}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedBrand !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Brand: {products.find(p => p.id === selectedBrand)?.name}
                    <button
                      onClick={() => onBrandChange("all")}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <button
                  onClick={() => {
                    onCategoryChange("all")
                    onGroupChange("all")
                    onBrandChange("all")
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

      {/* Products Grid — same layout as /marketplace (2 cols on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {searchFilteredProducts.map((product) => (
          <MarketplaceProductCard
            key={product.id}
            product={product}
            selectedVariationId={selectedVariations[product.id]}
            onVariationChange={(value) => handleVariationChange(product.id, value)}
            onAddToCart={(variationId) => {
              const variation =
                variationId && variationId !== "base"
                  ? product.variations.find((v) => v.id === variationId)
                  : undefined
              // Quantity is now selected via dropdown in the component, default to 1
              onAddToCart(product, variation, 1)
            }}
          />
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