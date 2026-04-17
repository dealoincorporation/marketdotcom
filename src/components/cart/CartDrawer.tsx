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
                        className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-white/60 backdrop-blur-3xl border-l border-white/40 shadow-2xl flex flex-col"
                        ref={drawerRef}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-100 rounded-2xl shadow-sm">
                                    <ShoppingCart className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Your Cart</h2>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                        {items.reduce((acc, item) => acc + item.quantity, 0)} items
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white rounded-2xl transition-all active:scale-95 text-gray-400 hover:text-orange-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-gray-100/50">
                                        <ShoppingCart className="h-10 w-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-2 text-center w-full">Your cart is empty</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-[200px] leading-relaxed">
                                        Add some items to get started.
                                    </p>
                                    <Button
                                        onClick={onClose}
                                        className="mt-8 bg-gray-900 hover:bg-gray-800 text-white font-black text-[10px] uppercase tracking-[0.3em] px-10 h-14 rounded-2xl shadow-xl transition-all active:scale-95"
                                    >
                                        Start Shopping
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="group relative"
                                        >
                                            <div className="glass-effect rounded-[2rem] border border-white bg-white/40 backdrop-blur-sm p-4 shadow-sm transition-all duration-300 hover:shadow-xl hover:bg-white/60">
                                                <div className="flex gap-5">
                                                    {/* Item Image */}
                                                    <div className="h-24 w-24 flex-shrink-0 bg-white rounded-[1.25rem] border border-gray-100 flex items-center justify-center relative shadow-inner overflow-hidden">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <ShoppingCart className="h-6 w-6 text-gray-200" />
                                                        )}
                                                        <div className="absolute top-2 right-2 flex items-center justify-center">
                                                            <span className="bg-gray-900 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-lg shadow-lg">
                                                                {item.quantity}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Item Details */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-relaxed line-clamp-2">
                                                                    {cleanCartItemNameForDisplay(item.name)}
                                                                </h3>
                                                                <button
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                            {item.variation && (
                                                                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                                                                    {stripLeadingNumericCode(item.variation.name)}
                                                                </p>
                                                            )}
                                                            <p className="text-xs font-black text-gray-900 mt-1">
                                                                {formatPrice(item.price)}
                                                            </p>
                                                        </div>

                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center justify-between mt-4">
                                                            <div className="flex items-center bg-white/60 border border-gray-100 rounded-xl h-8">
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    className="w-8 h-full flex items-center justify-center hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-l-xl transition-all disabled:opacity-30"
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </button>
                                                                <span className="w-8 text-center text-[10px] font-black text-gray-900 tabular-nums">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    className="w-8 h-full flex items-center justify-center hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-r-xl transition-all disabled:opacity-30"
                                                                    disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                                Line: {formatPrice(item.price * item.quantity)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ingenious Compact Footer */}
                        {items.length > 0 && (
                            <div className="mt-auto border-t border-white/40 bg-white/60 backdrop-blur-3xl px-6 py-4 pb-8 space-y-4">
                                {/* Compact Subtotal & Shipping */}
                                <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-white/20 pb-4">
                                    <div className="flex items-center gap-2">
                                        <span>Subtotal:</span>
                                        <span className="text-gray-900">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>Ship:</span>
                                        <span className="text-gray-900 lowercase italic">Calculated at checkout</span>
                                    </div>
                                </div>

                                {/* Total & Main Action */}
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Due</span>
                                        <span className="text-2xl font-black text-orange-600 leading-none">{formatPrice(totalPrice)}</span>
                                    </div>
                                    <Link href="/checkout" onClick={onClose} className="flex-1">
                                        <Button className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all active:scale-[0.98] group flex items-center justify-center gap-3">
                                            Checkout
                                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </div>

                                {/* Secondary Actions */}
                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-orange-600 transition-colors py-2"
                                    >
                                        Back to Shop
                                    </button>
                                    <div className="w-px h-3 bg-gray-200 self-center" />
                                    <button
                                        onClick={() => {
                                            clearCart()
                                            onClose()
                                        }}
                                        className="flex-1 text-[9px] font-black uppercase tracking-[0.2em] text-red-400 hover:text-red-500 transition-colors py-2"
                                    >
                                        Empty Cart
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
