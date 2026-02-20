"use client"

import { useState } from "react"
import type { ChangeEvent } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Package,
  Plus,
  TrendingUp,
  Search,
  Filter,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NotificationModal } from "@/components/ui/notification-modal"
import { useNotification } from "@/hooks/useNotification"
import { ProductTable } from "./products/ProductTable"
import { BulkEditProductModal } from "./products/BulkEditProductModal"

interface Product {
  id: string
  name: string
  groupName?: string | null
  description: string
  basePrice: number
  categoryId: string
  category: { id: string; name: string }
  stock: number
  unit: string
  inStock: boolean
  variations: Array<{
    id: string
    name: string
    price: number
    stock: number
    unit?: string
    quantity?: number
    image?: string
  }>
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  description?: string
}

interface ManageProductsTabProps {
  products: Product[]
  categories: Category[]
  onDeleteProduct: (productId: string) => void
  onToggleStockStatus: (product: Product) => void
}

export default function ManageProductsTab({
  products,
  categories,
  onDeleteProduct,
  onToggleStockStatus,
}: ManageProductsTabProps) {
  const { notification, showConfirm, showConfirmPromise, showError, showSuccess, closeNotification } = useNotification()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProductGroup, setSelectedProductGroup] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [bulkEditData, setBulkEditData] = useState({
    categoryId: "",
    stock: "",
    inStock: null as boolean | null
  })


  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`
  }

  // Category → Product (group) → Variants: unique product groups in selected category
  const categoryProducts = selectedCategory === "all"
    ? products
    : products.filter((p) => p.categoryId === selectedCategory)
  const productGroupOptions = Array.from(
    new Set(
      categoryProducts.map((p) => p.groupName || p.name).filter(Boolean)
    )
  ).sort((a, b) => String(a).localeCompare(String(b)))

  // Reset product group when category changes
  const effectiveProductGroup =
    selectedProductGroup === "all" || productGroupOptions.includes(selectedProductGroup)
      ? selectedProductGroup
      : "all"

  // Filter and sort products (Variants = actual product records under Category → Product)
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory
      const matchesProductGroup =
        effectiveProductGroup === "all" ||
        (product.groupName || product.name) === effectiveProductGroup
      const matchesStock = stockFilter === "all" ||
                          (stockFilter === "in-stock" && product.inStock) ||
                          (stockFilter === "out-of-stock" && !product.inStock) ||
                          (stockFilter === "low-stock" && product.stock < 10)

      return matchesSearch && matchesCategory && matchesProductGroup && matchesStock
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price-low":
          return a.basePrice - b.basePrice
        case "price-high":
          return b.basePrice - a.basePrice
        case "stock-low":
          return a.stock - b.stock
        case "stock-high":
          return b.stock - a.stock
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  const totalProducts = products.length
  const inStockProducts = products.filter(p => p.inStock).length
  const outOfStockProducts = products.filter(p => !p.inStock).length
  const lowStockProducts = products.filter(p => p.stock < 10).length
  
  // Calculate total value: For products with variations, sum all variation values
  // For products without variations, use basePrice * stock
  const totalValue = products.reduce((sum, product) => {
    // If product has variations, calculate value from all variations
    if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
      const variationsValue = product.variations.reduce(
        (variationSum, variation) => {
          const price = variation.price || 0
          const stock = variation.stock || 0
          return variationSum + (price * stock)
        },
        0
      )
      return sum + variationsValue
    }
    // If no variations, use base price and stock
    const basePrice = product.basePrice || 0
    const stock = product.stock || 0
    return sum + (basePrice * stock)
  }, 0)

  // CSV Export Function
  const exportToCSV = () => {
    const headers = ['Name', 'Description', 'Category', 'Price', 'Stock', 'Unit', 'In Stock']
    const csvData = filteredProducts.map(product => [
      product.name,
      product.description,
      product.category.name,
      product.basePrice.toString(),
      product.stock.toString(),
      product.unit,
      product.inStock ? 'Yes' : 'No'
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // CSV Import Function
  const importFromCSV = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const csv = e.target?.result as string
      const lines = csv.split('\n')
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())

      // Expected headers: Name, Description, Category, Price, Stock, Unit, In Stock
      const expectedHeaders = ['Name', 'Description', 'Category', 'Price', 'Stock', 'Unit', 'In Stock']

      if (!expectedHeaders.every(h => headers.includes(h))) {
        showError('Invalid CSV Format', 'Expected headers: ' + expectedHeaders.join(', '))
        return
      }

      const productsToImport = []
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue

        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
        const [name, description, categoryName, price, stock, unit, inStock] = values

        // Find category by name
        const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase())
        if (!category) {
          showError('Category Not Found', `Category "${categoryName}" not found. Skipping product "${name}".`)
          continue
        }

        productsToImport.push({
          name,
          description,
          basePrice: parseFloat(price),
          categoryId: category.id,
          stock: parseInt(stock),
          unit,
          inStock: inStock.toLowerCase() === 'yes'
        })
      }

      // Import the products via API
      if (productsToImport.length > 0) {
        const confirmImport = await showConfirmPromise(
          'Import Products',
          `Import ${productsToImport.length} products?`
        )
        if (confirmImport) {
          try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/products/import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(productsToImport),
            })

            const result = await response.json()

            if (response.ok) {
              showSuccess('Import Successful', `Successfully imported ${result.created} products!${result.errors > 0 ? ` (${result.errors} errors)` : ''}`)
              if (result.errors > 0) {
                console.log('Import errors:', result.errorDetails)
              }
              window.location.reload() // Refresh to show new products
            } else {
              showError('Import Failed', 'Import failed: ' + (result.error || 'Unknown error'))
            }
          } catch (error) {
            console.error('Import error:', error)
            showError('Import Failed', 'Import failed. Please try again.')
          }
        }
      }
    }
    reader.readAsText(file)
    // Reset file input
    event.target.value = ''
  }

  // Bulk Edit Functions
  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === filteredProducts.length
        ? []
        : filteredProducts.map(p => p.id)
    )
  }

  const handleBulkEdit = () => {
    if (selectedProducts.length === 0) {
      showError('No Selection', 'Please select products to edit')
      return
    }
    setShowBulkEdit(true)
  }

  const handleApplyBulkEdit = async () => {
    const updates: any = {}
    if (bulkEditData.categoryId) updates.categoryId = bulkEditData.categoryId
    if (bulkEditData.stock) updates.stock = parseInt(bulkEditData.stock)
    if (bulkEditData.inStock !== null) updates.inStock = bulkEditData.inStock

    if (Object.keys(updates).length === 0) {
      showError('No Changes', 'Please specify at least one field to update')
      return
    }

    const confirmUpdate = await showConfirmPromise(
      'Update Products',
      `Update ${selectedProducts.length} products?`
    )
    if (!confirmUpdate) return

    try {
      // Update each selected product
      for (const productId of selectedProducts) {
        await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
      }

      // Reset and refresh
      setSelectedProducts([])
      setShowBulkEdit(false)
      setBulkEditData({ categoryId: '', stock: '', inStock: null })
      window.location.reload() // TODO: Replace with proper refresh
    } catch (error) {
      console.error('Bulk edit error:', error)
      showError('Update Failed', 'Error updating products')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
        <p className="text-sm sm:text-base text-gray-600">Comprehensive product inventory and management system</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-xs sm:text-sm font-medium">Total Products</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-900">{totalProducts}</p>
                </div>
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-xs sm:text-sm font-medium">In Stock</p>
                  <p className="text-lg sm:text-xl font-bold text-green-900">{inStockProducts}</p>
                </div>
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-xs sm:text-sm font-medium">Out of Stock</p>
                  <p className="text-lg sm:text-xl font-bold text-red-900">{outOfStockProducts}</p>
                </div>
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-xs sm:text-sm font-medium">Low Stock</p>
                  <p className="text-lg sm:text-xl font-bold text-orange-900">{lowStockProducts}</p>
                </div>
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-xs sm:text-sm font-medium">Total Value</p>
                  <p className="text-base sm:text-lg font-bold text-purple-900">{formatPrice(totalValue)}</p>
                </div>
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-wrap">
            <Select
              value={selectedCategory}
              onValueChange={(v) => {
                setSelectedCategory(v)
                setSelectedProductGroup("all")
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={effectiveProductGroup}
              onValueChange={setSelectedProductGroup}
              disabled={selectedCategory === "all"}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={selectedCategory === "all" ? "Select category first" : "Product"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {productGroupOptions.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Sort by Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low</SelectItem>
                <SelectItem value="price-high">Price: High</SelectItem>
                <SelectItem value="stock-low">Stock: Low</SelectItem>
                <SelectItem value="stock-high">Stock: High</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Link href="/dashboard/add-product" className="sm:ml-auto">
            <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-medium">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Add Product</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            accept=".csv"
            onChange={importFromCSV}
            className="hidden"
            id="csv-import"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('csv-import')?.click()}
            className="flex-1 sm:flex-none"
          >
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Import CSV</span>
            <span className="xs:hidden">Import</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/sample-products.csv', '_blank')}
            className="flex-1 sm:flex-none"
          >
            📄 <span className="hidden xs:inline">Sample CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Export CSV</span>
            <span className="xs:hidden">Export</span>
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkEdit}
          disabled={selectedProducts.length === 0}
          className="flex-1 sm:flex-none"
        >
          <Filter className="h-4 w-4 mr-2" />
          Bulk Edit ({selectedProducts.length})
        </Button>
      </div>

      {/* Breadcrumb: Category → Product → Variants */}
      {(selectedCategory !== "all" || effectiveProductGroup !== "all") && (
        <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
          <span className="font-medium">Browse:</span>{" "}
          <span>
            Category: <strong>{selectedCategory === "all" ? "All" : categories.find((c) => c.id === selectedCategory)?.name ?? "—"}</strong>
          </span>
          <span className="mx-2">→</span>
          <span>
            Product: <strong>{effectiveProductGroup === "all" ? "All" : effectiveProductGroup}</strong>
          </span>
          <span className="mx-2">→</span>
          <span>
            Variants: <strong>{filteredProducts.length} item(s)</strong>
          </span>
        </div>
      )}

      {/* Products Table (Variants) */}
      <ProductTable
        filteredProducts={filteredProducts}
        totalProducts={totalProducts}
        selectedProducts={selectedProducts}
        effectiveProductGroup={effectiveProductGroup}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        stockFilter={stockFilter}
        formatPrice={formatPrice}
        onSelectProduct={handleSelectProduct}
        onSelectAll={handleSelectAll}
        onToggleStockStatus={onToggleStockStatus}
        onDeleteProduct={onDeleteProduct}
      />

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <BulkEditProductModal
          selectedCount={selectedProducts.length}
          categories={categories}
          bulkEditData={bulkEditData}
          onBulkEditDataChange={setBulkEditData}
          onApply={handleApplyBulkEdit}
          onClose={() => {
            setShowBulkEdit(false)
            setBulkEditData({ categoryId: '', stock: '', inStock: null })
          }}
        />
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
      />
    </motion.div>
  )
}