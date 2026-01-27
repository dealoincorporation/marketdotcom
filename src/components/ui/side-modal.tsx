"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "./button"

export interface VariationOption {
  id: string
  label: string
  price: number
  stock: number
  kind: "base" | "variation"
  image?: string
}

export interface SideModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  productName: string
  productImage?: string
  options: VariationOption[]
  selectedVariationId?: string
  onVariationSelect?: (variationId: string) => void
  maxQuantity: number
  onAddToCart: (variationId: string, quantity: number) => void
}

export function SideModal({
  isOpen,
  onClose,
  title,
  productName,
  productImage,
  options,
  selectedVariationId,
  onVariationSelect,
  maxQuantity,
  onAddToCart,
}: SideModalProps) {
  const [quantity, setQuantity] = React.useState(1)
  const [currentVariationId, setCurrentVariationId] = React.useState<string>(selectedVariationId || options[0]?.id || "")

  React.useEffect(() => {
    // Reset quantity when modal opens or variation changes
    setQuantity(1)
    if (selectedVariationId) {
      setCurrentVariationId(selectedVariationId)
    } else if (options.length > 0 && !currentVariationId) {
      setCurrentVariationId(options[0].id)
    }
  }, [selectedVariationId, options, isOpen])

  const selectedOption = options.find(opt => opt.id === currentVariationId) || options[0]
  const variationPrice = selectedOption?.price || 0
  const variationLabel = selectedOption?.label || "Standard"
  const availableStock = selectedOption?.stock || maxQuantity
  const displayImage = selectedOption?.image || productImage

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    if (newQuantity > availableStock) return
    setQuantity(newQuantity)
  }

  const handleVariationChange = (variationId: string) => {
    setCurrentVariationId(variationId)
    setQuantity(1) // Reset quantity when variation changes
    onVariationSelect?.(variationId)
  }

  const handleAddToCart = () => {
    if (!currentVariationId) return
    onAddToCart(currentVariationId, quantity)
    onClose()
  }

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

      {/* Side Modal */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <h2 className="font-bold text-lg">{title}</h2>
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
              {/* Product Image */}
              {displayImage && (
                <div className="mb-4">
                  <img
                    src={displayImage}
                    alt={productName}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Product Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">{productName}</h3>

              {/* Variation Selection */}
              {options.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Variation
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleVariationChange(option.id)}
                        disabled={option.stock <= 0}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          currentVariationId === option.id
                            ? "bg-orange-50 border-orange-500"
                            : "bg-gray-50 border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {currentVariationId === option.id && (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className="text-xs text-gray-600">Stock: {option.stock}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-orange-600">
                            ₦{option.price.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Variation Display */}
              {selectedOption && (
                <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Selected:</span>
                  </div>
                  <p className="text-lg font-semibold text-orange-600">{variationLabel}</p>
                  <p className="text-sm text-gray-600 mt-1">Price: ₦{variationPrice.toLocaleString()}</p>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 rounded-lg border-2 border-gray-300 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-5 w-5 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      handleQuantityChange(Math.min(Math.max(1, val), availableStock))
                    }}
                    className="w-20 text-center text-xl font-bold border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= availableStock}
                    className="p-2 rounded-lg border-2 border-gray-300 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Available: {availableStock} {availableStock === 1 ? "item" : "items"}
                </p>
              </div>

              {/* Total Price */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ₦{(variationPrice * quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add {quantity} {quantity === 1 ? "item" : "items"} to Cart
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
