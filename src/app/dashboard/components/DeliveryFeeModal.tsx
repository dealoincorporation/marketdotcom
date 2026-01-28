"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, DollarSign, Search, Check, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  deliveryFee: number | null
  category?: { name: string }
}

interface DeliveryFeeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedProductIds: string[], fee: number | null) => void
  products: Product[]
  loading?: boolean
}

export function DeliveryFeeModal({
  isOpen,
  onClose,
  onConfirm,
  products,
  loading = false,
}: DeliveryFeeModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [fee, setFee] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSelectedProducts(new Set())
      setFee("")
      setSearchQuery("")
      setSelectAll(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (selectAll) {
      const filtered = getFilteredProducts()
      setSelectedProducts(new Set(filtered.map(p => p.id)))
    } else {
      setSelectedProducts(new Set())
    }
  }, [selectAll, searchQuery])

  const getFilteredProducts = () => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
    setSelectAll(false)
  }

  const handleConfirm = () => {
    const feeValue = fee.trim() === "" ? null : fee === "0" ? 0 : parseFloat(fee)
    if (isNaN(feeValue as number) && feeValue !== null && feeValue !== 0) {
      return
    }
    onConfirm(Array.from(selectedProducts), feeValue)
  }

  const filteredProducts = getFilteredProducts()
  const hasSelection = selectedProducts.size > 0
  const isValidFee = fee === "" || fee === "0" || (!isNaN(parseFloat(fee)) && parseFloat(fee) >= 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6" />
                  <h2 className="text-xl font-bold">Set Delivery Fee</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Fee Input */}
                <div className="mb-6">
                  <Label htmlFor="deliveryFee" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Delivery Fee (₦)
                  </Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="Enter fee (leave empty for default, 0 for free)"
                    className="h-12 text-base border-2 border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty for default calculation | 0 for free delivery | Enter number for custom fee
                  </p>
                </div>

                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                {/* Select All */}
                <div className="mb-4 flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => setSelectAll(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({filteredProducts.length} products)
                    </span>
                  </label>
                  <Badge variant="outline" className="text-sm">
                    {selectedProducts.size} selected
                  </Badge>
                </div>

                {/* Products List */}
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No products found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredProducts.map((product) => {
                        const isSelected = selectedProducts.has(product.id)
                        const currentFee = product.deliveryFee === null ? 'Default' : product.deliveryFee === 0 ? 'Free' : `₦${product.deliveryFee}`
                        
                        return (
                          <div
                            key={product.id}
                            onClick={() => toggleProduct(product.id)}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              isSelected ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-orange-600 border-orange-600' 
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check className="h-3 w-3 text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {product.category && (
                                      <Badge variant="outline" className="text-xs">
                                        {product.category.name}
                                      </Badge>
                                    )}
                                    <Badge variant={product.deliveryFee === 0 ? "default" : "outline"} className="text-xs">
                                      Current: {currentFee}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {hasSelection && (
                      <span>
                        {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={!hasSelection || !isValidFee || loading}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Applying...
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 mr-2" />
                          Apply Fee
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
