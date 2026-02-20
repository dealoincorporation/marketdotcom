"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Minus, Plus, ShoppingCart, X, Trash2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"
import Link from "next/link"
import { formatPrice, cleanCartItemNameForDisplay, stripLeadingNumericCode } from "@/components/marketplace/utils"

interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCartStore()
    const totalPrice = getTotalPrice()
    const totalItems = getTotalItems()

    // Close drawer when clicking outside
    const drawerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            // Prevent body scroll when drawer is open
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-white shadow-2xl flex flex-col"
                        ref={drawerRef}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-orange-600" />
                                <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
                                <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {items.reduce((acc, item) => acc + item.quantity, 0)} items
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                                        <ShoppingCart className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                                    <p className="text-sm text-gray-500 mb-8 max-w-[200px]">
                                        Looks like you haven't added anything to your cart yet.
                                    </p>
                                    <Button
                                        onClick={onClose}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-2 rounded-full shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all"
                                    >
                                        Start Shopping
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
                                            {/* Item Image */}
                                            <div className="h-24 w-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-visible border border-gray-100 flex items-center justify-center relative">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-contain p-2 mix-blend-multiply rounded-lg"
                                                    />
                                                ) : (
                                                    <ShoppingCart className="h-8 w-8 text-gray-300" />
                                                )}
                                                {/* Quantity Badge */}
                                                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md z-10">
                                                    {item.quantity}
                                                </div>
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug">
                                                            {cleanCartItemNameForDisplay(item.name)}
                                                        </h3>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    {item.variation && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                                {stripLeadingNumericCode(item.variation.name)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Unit/Weight/Volume Details */}
                                                    {(item.unit || item.weight || item.variation?.unit) && (
                                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
                                                            {(item.variation?.unit || item.unit) && (
                                                                <span className="flex items-center">
                                                                    <span className="font-semibold mr-1">Unit:</span> {item.variation?.unit || item.unit}
                                                                </span>
                                                            )}
                                                            {item.weight && (
                                                                <span className="flex items-center border-l border-gray-300 pl-3">
                                                                    <span className="font-semibold mr-1">Weight:</span> {Math.round(item.weight * item.quantity * 100) / 100}kg
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <p className="font-bold text-orange-600 text-base">
                                                            {formatPrice(item.price)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-9">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="w-9 h-full flex items-center justify-center hover:bg-white hover:text-orange-600 rounded-l-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="h-3.5 w-3.5" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.maxQuantity}
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value)
                                                                if (!isNaN(val) && val >= 1) {
                                                                    updateQuantity(item.id, val)
                                                                }
                                                            }}
                                                            className="w-12 h-full text-center text-sm font-semibold text-gray-900 bg-transparent border-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="w-9 h-full flex items-center justify-center hover:bg-white hover:text-orange-600 rounded-r-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                                            disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-500">
                                                        Subtotal: <span className="text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-gray-100 p-4 bg-white space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium text-gray-600">
                                        <span>Delivery</span>
                                        <span className="text-gray-900 text-xs mt-0.5">Calculated at checkout</span>
                                    </div>
                                    <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between text-lg font-bold text-gray-900 items-baseline">
                                        <span>Total</span>
                                        <span className="text-orange-600 font-extrabold">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>

                                <div className="grid gap-2 pt-1">
                                    <Link href="/checkout" onClick={onClose} className="w-full">
                                        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white h-11 text-base font-bold shadow-md hover:shadow-lg transition-all rounded-lg flex items-center justify-center gap-2 group">
                                            Checkout
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={onClose}
                                            className="w-full border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-9 text-xs font-medium rounded-lg"
                                        >
                                            Continue Shopping
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                clearCart()
                                                onClose()
                                            }}
                                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 h-9 text-xs font-medium rounded-lg"
                                        >
                                            Clear Cart
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
