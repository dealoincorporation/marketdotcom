"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus, ShoppingCart, Tag, Package } from "lucide-react"
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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[min(94vw,36rem)] sm:w-[min(90vw,38rem)] xxs:w-[calc(100vw-10px)] max-w-none max-h-[min(88dvh,720px)] sm:max-h-[min(84dvh,720px)] xxs:max-h-[min(90dvh,760px)] glass-effect border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[2rem] sm:rounded-[2.5rem] xxs:rounded-xl overflow-hidden flex flex-col premium-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6 xxs:px-3 xxs:py-3.5 border-b border-white/40 bg-gradient-to-r from-orange-500/90 to-red-600/90 backdrop-blur-xl text-white gap-2">
              <div className="min-w-0 pr-1">
                <h2 className="font-black text-xl xxs:text-base tracking-tight uppercase truncate">{title}</h2>
                <p className="text-[10px] xxs:text-[9px] font-bold text-white/70 uppercase tracking-widest mt-0.5 xxs:line-clamp-2 xxs:leading-tight">Customize your selection</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 xxs:w-9 xxs:h-9 shrink-0 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-all active:scale-90"
                aria-label="Close"
              >
                <X className="h-5 w-5 xxs:h-4 xxs:w-4" />
              </button>
            </div>

            {/* Content — outer scroll fallback; option list has its own scroll region */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 xxs:p-3 xxs:space-y-3 space-y-5 sm:space-y-6 [scrollbar-gutter:stable]">
              {/* Product Image */}
              {displayImage && (
                <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={displayImage}
                    alt={productName}
                    className="w-full h-28 sm:h-44 xxs:h-24 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              )}

              {/* Product Name */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-[8px] sm:text-[9px] font-black text-orange-600 uppercase tracking-widest">Product</span>
                </div>
                <h3 className="text-base sm:text-xl xxs:text-[15px] font-black text-gray-900 leading-snug tracking-tight break-words">{productName}</h3>
              </div>

              {/* Variation selection — inner scroll (scrollbar on the right) keeps footer visible */}
              {options.length > 1 && (
                <div className="space-y-2 sm:space-y-2.5 xxs:space-y-1.5">
                  <label className="block text-[11px] xxs:text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] ml-0.5 xxs:ml-0">
                    Choose an option
                  </label>
                  <div className="max-h-[min(34dvh,240px)] sm:max-h-[min(36dvh,280px)] overflow-y-auto overflow-x-hidden overscroll-contain rounded-xl border border-gray-100/80 bg-white/40 pr-1 pl-0.5 py-1.5 xxs:max-h-[min(30dvh,220px)] [scrollbar-width:thin]">
                    <div className="flex flex-col gap-2 xxs:gap-1.5 pr-0.5" role="listbox" aria-label="Product options">
                    {options.map((option) => {
                      const isSelected = currentVariationId === option.id
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
                          role="option"
                          aria-selected={isSelected}
                          title={option.label}
                          onClick={() => handleVariationChange(option.id)}
                          disabled={option.stock <= 0}
                          className={`group w-full text-left rounded-2xl xxs:rounded-xl border-2 transition-all duration-300 disabled:opacity-45 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 xxs:focus-visible:ring-offset-0 ${isSelected
                            ? "bg-gradient-to-br from-orange-50 to-white border-orange-500 shadow-lg shadow-orange-500/10"
                            : "bg-white/70 border-gray-100 hover:border-orange-200 hover:bg-white"
                            }`}
                        >
                          <div className="flex flex-col gap-2.5 xxs:gap-2 p-3 sm:p-3.5 xxs:p-2.5">
                            {option.image ? (
                              <div className="mx-auto shrink-0 w-full max-w-[4.5rem] sm:max-w-[5rem] aspect-square rounded-lg xxs:rounded-md overflow-hidden border border-white shadow-sm ring-1 ring-black/5">
                                <img src={option.image} alt="" className="h-full w-full object-cover object-center" />
                              </div>
                            ) : (
                              <div className="mx-auto shrink-0 w-full max-w-[4.5rem] sm:max-w-[5rem] aspect-square rounded-lg xxs:rounded-md border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                                <Package className="h-6 w-6 xxs:h-5 xxs:w-5 text-gray-300" aria-hidden />
                              </div>
                            )}

                            <div className="flex w-full min-w-0 flex-col gap-2">
                              <div className="min-w-0 flex flex-col gap-1.5 xxs:gap-1 text-left">
                                <p className={`text-[13px] sm:text-sm xxs:text-[12px] font-bold tracking-tight leading-snug break-words ${isSelected ? "text-gray-900" : "text-gray-700"}`}>
                                  {option.label}
                                </p>
                                <div className="flex flex-wrap items-center justify-start gap-1.5 xxs:gap-1">
                                  {unitDisplay && (
                                    <span className="inline-flex items-center rounded-md bg-gray-100/90 px-2 py-0.5 xxs:px-1.5 text-[9px] font-bold text-gray-600 uppercase tracking-wide">
                                      {unitDisplay}
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 xxs:px-1.5 text-[9px] font-bold uppercase tracking-wide ${option.stock > 0 ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                                    {option.stock > 0 ? `${option.stock} in stock` : "Out of stock"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-col items-start justify-center gap-0 border-t border-gray-100/90 pt-2 w-full">
                                <span className={`text-base sm:text-lg xxs:text-[15px] font-black tabular-nums tracking-tight ${isSelected ? "text-orange-600" : "text-gray-900"}`}>
                                  ₦{option.price.toLocaleString()}
                                </span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">each</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-3 xxs:space-y-2">
                <label className="block text-[11px] xxs:text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] ml-0.5 xxs:ml-0">
                  Adjust Quantity
                </label>
                <div className="flex items-center gap-4 sm:gap-6 xxs:flex-col xxs:items-stretch xxs:gap-3">
                  <div className="flex items-center bg-gray-100/50 backdrop-blur-md p-1 sm:p-1.5 xxs:p-1 xxs:justify-center rounded-xl sm:rounded-2xl border border-white/60 xxs:w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 sm:w-12 sm:h-12 xxs:w-9 xxs:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-white text-gray-900 hover:bg-orange-600 hover:text-white disabled:opacity-30 transition-all shadow-sm active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.replace(/\D/g, ""), 10)
                        if (!isNaN(val)) handleQuantityChange(Math.min(Math.max(1, val), availableStock))
                      }}
                      className="w-14 sm:w-20 xxs:w-12 text-center text-lg sm:text-xl xxs:text-base font-black bg-transparent border-none focus:ring-0 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= availableStock}
                      className="w-10 h-10 sm:w-12 sm:h-12 xxs:w-9 xxs:h-9 flex items-center justify-center rounded-lg sm:rounded-xl bg-white text-gray-900 hover:bg-orange-600 hover:text-white disabled:opacity-30 transition-all shadow-sm active:scale-90"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  <div className="flex-1 xxs:text-center sm:text-left">
                    <p className="text-[10px] xxs:text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                      Available Stock: <span className="text-gray-900">{availableStock} items</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 xxs:p-3 rounded-2xl xxs:rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white premium-shadow">
                <div className="flex items-center justify-between mb-3 xxs:mb-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50">Estimated Total</span>
                  <Tag className="h-3.5 w-3.5 xxs:h-3 xxs:w-3 text-orange-500" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-[1.65rem] xxs:text-xl font-black text-orange-500 tracking-tighter break-all">
                    ₦{(variationPrice * quantity).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">NGN</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 xxs:p-3 border-t border-white/40 bg-white/40 backdrop-blur-xl">
              <Button
                onClick={handleAddToCart}
                disabled={!currentVariationId || availableStock <= 0}
                className="group w-full bg-orange-600 hover:bg-orange-700 text-white h-12 sm:h-14 xxs:h-11 rounded-lg sm:rounded-xl xxs:rounded-md text-[11px] sm:text-xs xxs:text-[10px] font-black uppercase tracking-widest xxs:tracking-wide shadow-xl shadow-orange-600/25 transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-orange-600"
              >
                <span>Add to Cart</span>
                <div className="ml-3 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ShoppingCart className="h-4 w-4" />
                </div>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
