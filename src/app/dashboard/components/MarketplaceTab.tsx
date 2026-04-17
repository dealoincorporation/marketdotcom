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
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1 max-w-xl">
          <label className="block text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-3 ml-1">Search Catalog</label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              inputMode="search"
              placeholder="What are you looking for today?"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault() }}
              autoComplete="off"
              spellCheck={false}
              className="w-full h-14 pl-12 pr-12 rounded-[1.25rem] border border-white/60 bg-white/70 backdrop-blur-xl text-base text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition-all duration-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 premium-shadow"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(""); searchInputRef.current?.focus() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-90"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {selectedCategory !== "all" && (
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/50 premium-shadow">
            <Package className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-black text-gray-900 uppercase tracking-tight">
              {categories.find(c => c.id === selectedCategory)?.name}
            </span>
          </div>
        )}
      </div>

      {/* Filters Container */}
      <div className="glass-effect rounded-[2rem] border border-white/60 overflow-hidden premium-shadow">
        <div className="p-8 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Smart Filters</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Find exactly what you need</p>
              </div>
            </div>

            {(selectedCategory !== "all" || selectedGroup !== "all" || selectedBrand !== "all") && (
              <button
                onClick={() => {
                  onCategoryChange("all")
                  onGroupChange("all")
                  onBrandChange("all")
                }}
                className="text-xs font-black text-orange-600 hover:text-orange-700 uppercase tracking-wider bg-orange-50 px-4 py-2 rounded-xl transition-all active:scale-95"
              >
                Reset All
              </button>
            )}
          </div>

          <div className={`grid grid-cols-1 ${selectedCategory !== "all" ? "md:grid-cols-3" : "md:grid-cols-1"} gap-8`}>
            {/* Category Select */}
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">1. Choose Category</label>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="h-14 bg-white/50 border-white/80 rounded-2xl text-base font-bold text-gray-900 focus:ring-orange-100 transition-all hover:bg-white/80">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50 rounded-2xl shadow-2xl">
                  <SelectItem value="all" className="font-bold py-3">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id} className="font-bold py-3">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory !== "all" && (
              <>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">2. Select Product</label>
                  <Select
                    value={selectedGroup}
                    onValueChange={(v) => {
                      onGroupChange(v)
                      onBrandChange("all")
                    }}
                  >
                    <SelectTrigger className="h-14 bg-white/50 border-white/80 rounded-2xl text-base font-bold text-gray-900 focus:ring-orange-100 transition-all hover:bg-white/80">
                      <SelectValue placeholder="Displaying All" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50 rounded-2xl shadow-2xl">
                      <SelectItem value="all" className="font-bold py-3">All Varieties</SelectItem>
                      {groupOptions.map((g) => (
                        <SelectItem key={g} value={g} className="font-bold py-3">
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">3. Select Brand</label>
                  <Select
                    value={selectedBrand}
                    onValueChange={onBrandChange}
                    disabled={selectedGroup === "all"}
                  >
                    <SelectTrigger className="h-14 bg-white/50 border-white/80 rounded-2xl text-base font-bold text-gray-900 focus:ring-orange-100 transition-all hover:bg-white/80 disabled:opacity-50">
                      <SelectValue placeholder={selectedGroup === "all" ? "Pick a product first" : "All Brands"} />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/50 rounded-2xl shadow-2xl">
                      <SelectItem value="all" className="font-bold py-3">Every Brand</SelectItem>
                      {productsInGroup.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="font-bold py-3">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
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
              onAddToCart(product, variation, 1)
            }}
          />
        ))}
      </div>

      {searchFilteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 glass-effect rounded-[3rem] border border-white/60 premium-shadow"
        >
          <div className="relative inline-block mb-6">
            <Package className="h-20 w-20 text-gray-300 mx-auto" strokeWidth={1} />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-gray-200 blur-2xl rounded-full -z-10"
            />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight uppercase tracking-wider">Empty Shelves</h3>
          <p className="text-gray-500 font-bold max-w-sm mx-auto">
            {filteredProducts.length === 0
              ? "We couldn't find any items matching those filters. Try broading your search."
              : "No matches for that search. Try something else!"
            }
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}