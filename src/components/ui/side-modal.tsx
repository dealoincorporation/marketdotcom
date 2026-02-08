"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Minus, Plus, ShoppingCart, Tag, Info } from "lucide-react"
import { Button } from "./button"

export interface VariationOption {
  id: string
  label: string
  price: number
  stock: number
  kind: "base" | "variation"
  image?: string
  unit?: string
  quantity?: number
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
  const variationLabel = selectedOption?.label || productName || "Standard"
  const availableStock = selectedOption?.stock || maxQuantity
  // Use option image if available (for standard options, this will be the first product image)
  // Otherwise fallback to productImage
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

      {/* Centered Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[95vw] sm:w-[90vw] max-w-md max-h-[90vh] sm:max-h-[85vh] bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <h2 className="font-bold text-base sm:text-lg">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Product Image */}
              {displayImage && (
                <div className="mb-3 sm:mb-4">
                  <img
                    src={displayImage}
                    alt={productName}
                    className="w-full h-40 sm:h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Product Name */}
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{productName}</h3>

              {/* Variation Selection */}
              {options.length > 1 && (
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                    Select Variation
                  </label>
                  <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto">
                    {options.map((option) => {
                      // Format unit/quantity display
                      const unitDisplay = option.unit 
                        ? option.quantity 
                          ? `${option.quantity}${option.unit}`
                          : option.unit
                        : option.quantity 
                          ? String(option.quantity)
                          : null
                      
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleVariationChange(option.id)}
                          disabled={option.stock <= 0}
                          className={`w-full text-left p-2 sm:p-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-0 ${
                            currentVariationId === option.id
                              ? "bg-orange-50 border-orange-500"
                              : "bg-gray-50 border-gray-200 hover:border-orange-300"
                          }`}
                        >
                          {/* Mobile: Stack vertically */}
                          <div className="flex flex-col gap-1.5 sm:hidden">
                            <div className="flex items-center gap-1.5">
                              {currentVariationId === option.id && (
                                <Check className="h-3 w-3 flex-shrink-0 text-green-600" />
                              )}
                              <div className="min-w-0 overflow-hidden flex-1">
                                <p className="text-xs font-medium text-gray-900 truncate leading-tight">{option.label}</p>
                                {unitDisplay && (
                                  <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">{unitDisplay}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col [@media(min-width:368px)]:flex-row items-start [@media(min-width:368px)]:items-center justify-between gap-1 [@media(min-width:368px)]:gap-0">
                              <p className="text-[10px] text-gray-600 leading-tight">Stock: {option.stock}</p>
                              <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                                <Tag className="h-4 w-4 flex-shrink-0 text-orange-500" aria-hidden />
                                ₦{option.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          {/* Desktop: Horizontal layout */}
                          <div className="hidden sm:flex items-center justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                              {currentVariationId === option.id && (
                                <Check className="h-4 w-4 flex-shrink-0 text-green-600" />
                              )}
                              <div className="min-w-0 overflow-hidden flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate leading-tight">{option.label}</p>
                                {unitDisplay && (
                                  <p className="text-xs text-gray-500 truncate leading-tight mt-0.5">{unitDisplay}</p>
                                )}
                                <p className="text-xs text-gray-600 leading-tight mt-0.5">Stock: {option.stock}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 flex-shrink-0 ml-1">
                              <span className="text-sm font-semibold text-orange-600 tabular-nums whitespace-nowrap flex items-center gap-1">
                                <Tag className="h-4 w-4 flex-shrink-0 text-orange-500" aria-hidden />
                                ₦{option.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Select Quantity
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 sm:p-2.5 rounded-lg border-2 border-gray-300 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1}
                    max={availableStock}
                    value={quantity}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "")
                      if (raw === "") return
                      const val = parseInt(raw, 10)
                      if (!Number.isNaN(val)) handleQuantityChange(Math.min(Math.max(1, val), availableStock))
                    }}
                    onBlur={(e) => {
                      const raw = e.target.value.replace(/\D/g, "")
                      if (raw === "" || parseInt(raw, 10) < 1) {
                        handleQuantityChange(1)
                        return
                      }
                      const val = parseInt(raw, 10)
                      if (!Number.isNaN(val)) handleQuantityChange(Math.min(Math.max(1, val), availableStock))
                    }}
                    className="w-20 sm:w-24 min-w-[4rem] sm:min-w-[5rem] text-center text-lg sm:text-xl font-bold border-2 border-gray-300 rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= availableStock}
                    className="p-2 sm:p-2.5 rounded-lg border-2 border-gray-300 hover:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5 sm:mt-2 flex items-center justify-center gap-1.5">
                  <Info className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" aria-hidden />
                  Type a number or use ± · Up to {availableStock} {availableStock === 1 ? "item" : "items"}
                </p>
              </div>

              {/* Total Price */}
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0 flex items-center gap-1.5">
                    <Tag className="h-4 w-4 flex-shrink-0 text-orange-500" aria-hidden />
                    Total:
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-orange-600 truncate">
                    ₦{(variationPrice * quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
              <Button
                onClick={handleAddToCart}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 sm:py-3 text-base sm:text-lg font-semibold"
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                Add {quantity} {quantity === 1 ? "item" : "items"} to Cart
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
