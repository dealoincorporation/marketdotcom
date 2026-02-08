"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, Search, Filter, ShoppingCart, Heart, Star, Plus, Minus, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCartStore } from "@/lib/cart-store"
import { useAuth } from "@/contexts/AuthContext"
import { MarketplaceProductCard, type MarketplaceProduct } from "@/components/marketplace/MarketplaceProductCard"
import { normalizeImageUrls } from "@/lib/image-utils"

// Default categories for when API is unavailable
const defaultCategories = [
  { id: 'all', name: 'All Products', displayName: 'All' },
  { id: 'fruits', name: '🍎 Fruits', displayName: 'Fruits' },
  { id: 'vegetables', name: '🥕 Vegetables', displayName: 'Vegetables' },
  { id: 'grains', name: '🌾 Grains & Cereals', displayName: 'Grains' },
  { id: 'proteins', name: '🥩 Proteins', displayName: 'Proteins' },
  { id: 'dairy', name: '🥛 Dairy', displayName: 'Dairy' },
  { id: 'beverages', name: '🥤 Beverages', displayName: 'Beverages' },
  { id: 'snacks', name: '🍿 Snacks', displayName: 'Snacks' },
  { id: 'spices', name: '🌿 Spices & Seasonings', displayName: 'Spices' },
  { id: 'bakery', name: '🍞 Bakery', displayName: 'Bakery' },
  { id: 'frozen', name: '🧊 Frozen Foods', displayName: 'Frozen' },
  { id: 'canned', name: '🥫 Canned Goods', displayName: 'Canned' },
  { id: 'organic', name: '🌱 Organic Products', displayName: 'Organic' }
]

export default function MarketplacePage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [categories, setCategories] = useState(defaultCategories)
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"recommended" | "price_asc" | "price_desc" | "name_asc">("price_asc")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading: authLoading } = useAuth()
  const { items } = useCartStore()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // Don't render content if user is authenticated
  if (user) {
    return null
  }

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch products
        const productsResponse = await fetch('/api/products')
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          
          // Deduplicate products by ID to ensure each product appears only once
          // This prevents any duplicate products from appearing in the marketplace
          const uniqueProductsMap = new Map<string, any>()
          
          productsData.forEach((product: any) => {
            // Only process actual Product records (not variations)
            // Variations have a productId field, so we filter those out
            // Products should have an id and categoryId, but not productId
            if (product.id && product.categoryId && !product.productId) {
              // If product already exists, keep the one with more complete data
              if (uniqueProductsMap.has(product.id)) {
                const existing = uniqueProductsMap.get(product.id)
                // Merge variations if the new one has more variations
                if (product.variations && product.variations.length > (existing.variations?.length || 0)) {
                  existing.variations = product.variations
                }
                // Merge other fields if missing
                if (!existing.description && product.description) {
                  existing.description = product.description
                }
                if (!existing.image && product.image) {
                  existing.image = product.image
                }
              } else {
                uniqueProductsMap.set(product.id, product)
              }
            }
          })
          
          const transformedProducts: MarketplaceProduct[] = Array.from(uniqueProductsMap.values()).map((product: any) => {
            const images = normalizeImageUrls(product.images, product.image)

            return {
              id: product.id,
              name: product.name,
              groupName: product.groupName ?? null,
              description: product.description,
              basePrice: product.basePrice,
              categoryId: product.categoryId,
              category: product.category || { id: product.categoryId, name: product.category?.name || "Uncategorized" },
              images: images,
              stock: product.stock,
              unit: product.unit,
              inStock: product.inStock,
              variations: product.variations || [],
            }
          })
          setProducts(transformedProducts)
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          const apiCategories = categoriesData.data || categoriesData

          // Merge API categories with defaults
          const mergedCategories = [...defaultCategories]
          apiCategories.forEach((cat: any) => {
            const existingIndex = mergedCategories.findIndex(c => c.id === cat.id)
            if (existingIndex >= 0) {
              mergedCategories[existingIndex] = {
                ...mergedCategories[existingIndex],
                name: cat.name,
                displayName: cat.name.replace(/^[^\s]*\s/, '') // Remove emoji for display
              }
            } else {
              mergedCategories.push({
                id: cat.id,
                name: cat.name,
                displayName: cat.name.replace(/^[^\s]*\s/, '')
              })
            }
          })
          setCategories(mergedCategories)
        }
      } catch (error) {
        console.error('Error fetching marketplace data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    const getPriceRange = (product: MarketplaceProduct) => {
      const prices: number[] = []
      if ((product.stock || 0) > 0) prices.push(product.basePrice)
      for (const v of product.variations || []) {
        if ((v.stock || 0) > 0) prices.push(v.price)
      }
      if (prices.length === 0) prices.push(product.basePrice)
      return { min: Math.min(...prices), max: Math.max(...prices) }
    }

    // Price range filter
    const min = minPrice.trim() ? Number(minPrice) : undefined
    const max = maxPrice.trim() ? Number(maxPrice) : undefined
    if ((min !== undefined && !Number.isNaN(min)) || (max !== undefined && !Number.isNaN(max))) {
      filtered = filtered.filter((p) => {
        const range = getPriceRange(p)
        if (min !== undefined && !Number.isNaN(min) && range.max < min) return false
        if (max !== undefined && !Number.isNaN(max) && range.min > max) return false
        return true
      })
    }

    // Sorting
    if (sortBy === "recommended") {
      // Recommended: Keep original order (or could be based on popularity/stock)
      // Already sorted by default order from API
    } else if (sortBy === "name_asc") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "price_asc") {
      filtered = [...filtered].sort((a, b) => getPriceRange(a).min - getPriceRange(b).min)
    } else if (sortBy === "price_desc") {
      filtered = [...filtered].sort((a, b) => getPriceRange(b).max - getPriceRange(a).max)
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchQuery, minPrice, maxPrice, sortBy])

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0)


  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-[100] bg-white shadow-sm border-b backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <img
                src="/mrktdotcom-logo.png"
                alt="Marketdotcom Logo"
                className="h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52 lg:h-56 lg:w-56 object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="outline" size="sm" className="relative">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="outline" size="sm" className="relative">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart
                      {cartItemCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: Cart icon + Hamburger menu */}
            <div className="lg:hidden flex items-center gap-1">
              <Link
                href="/cart"
                className="relative p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 py-4"
            >
              <div className="flex flex-col space-y-3">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full justify-start">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Sticky Search and Filters */}
      <div className="sticky top-16 z-[90] bg-white border-b shadow-sm backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar - Always Visible */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Filter Toggle Button - Always Visible */}
            <Button
              variant="outline"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {(selectedCategory !== "all" || minPrice || maxPrice || sortBy !== "price_asc") && (
                <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {[
                    selectedCategory !== "all" ? 1 : 0,
                    minPrice ? 1 : 0,
                    maxPrice ? 1 : 0,
                    sortBy !== "price_asc" ? 1 : 0,
                  ].reduce((a, b) => a + b, 0)}
                </Badge>
              )}
            </Button>
          </div>

          {/* Collapsible Filters Panel */}
          <AnimatePresence>
            {filtersExpanded && (
              <motion.div
                initial={{ opacity: 0, maxHeight: 0 }}
                animate={{ opacity: 1, maxHeight: 1000 }}
                exit={{ opacity: 0, maxHeight: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-gray-200 space-y-4">
              {/* Sort and Price Range Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-48">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="h-11 bg-white border-gray-300">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300 shadow-lg z-[95]">
                      <SelectItem value="recommended" className="cursor-pointer hover:bg-gray-100">Recommended</SelectItem>
                      <SelectItem value="price_asc" className="cursor-pointer hover:bg-gray-100">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc" className="cursor-pointer hover:bg-gray-100">Price: High to Low</SelectItem>
                      <SelectItem value="name_asc" className="cursor-pointer hover:bg-gray-100">Name: A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₦</span>
                      <Input
                        value={minPrice}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          setMinPrice(value)
                        }}
                        inputMode="numeric"
                        placeholder="Min"
                        className="h-11 pl-8 bg-white border-gray-300"
                      />
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₦</span>
                      <Input
                        value={maxPrice}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '')
                          setMaxPrice(value)
                        }}
                        inputMode="numeric"
                        placeholder="Max"
                        className="h-11 pl-8 bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Categories</label>
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="whitespace-nowrap"
                    >
                      {category.displayName}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {(selectedCategory !== "all" || minPrice || maxPrice || sortBy !== "price_asc") && (
                <div className="flex justify-end pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("all")
                      setMinPrice("")
                      setMaxPrice("")
                      setSortBy("price_asc")
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {(() => {
              const category = categories.find(c => c.id === selectedCategory)
              return category ? category.displayName : 'All Products'
            })()}
            <span className="text-gray-500 text-lg ml-2">
              ({filteredProducts.length} items)
            </span>
          </h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="h-full"
              >
                <MarketplaceProductCard
                  product={product}
                  redirectToAuthIfGuest
                />
              </motion.div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>
    </div>
  )
}
