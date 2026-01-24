"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductForm } from "@/components/forms/product-form"
import { useDashboard } from "@/hooks/useDashboard"
import { useProducts } from "@/hooks/useProducts"
import { Product } from "@prisma/client"
import toast from "react-hot-toast"

export default function AddProductPage() {
  const router = useRouter()
  const { categories } = useDashboard()
  const { createProduct } = useProducts([]) // Empty array since we don't need existing products

  const handleSaveProduct = async (productData: any) => {
    try {
      const newProduct = await createProduct(productData)
      if (newProduct) {
        // Success toast notification
        toast.success(`Product "${productData.name}" added successfully!`, {
          duration: 4000,
          icon: '✅',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        // Redirect back to manage products after a short delay
        setTimeout(() => {
          router.push("/dashboard?tab=manage-products")
        }, 500)
      } else {
        // Error toast notification
        toast.error("Failed to create product. Please try again.", {
          duration: 4000,
          icon: '❌',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        console.error("Failed to create product")
      }
    } catch (error) {
      // Error toast notification
      toast.error(error instanceof Error ? error.message : "An error occurred while creating the product.", {
        duration: 4000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
      console.error("Error creating product:", error)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 sm:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Link
                href="/dashboard?tab=manage-products"
                className="p-1.5 sm:p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex-shrink-0 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Add New Product</h1>
                <p className="hidden sm:block text-xs sm:text-sm text-gray-600 truncate">Create a new product for your marketplace</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Link href="/dashboard?tab=manage-products">
                <Button variant="outline" size="sm" className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 touch-manipulation" style={{ WebkitTapHighlightColor: 'transparent' }}>
                  <X className="h-4 w-4" />
                  <span className="hidden xs:inline text-xs sm:text-sm">Cancel</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
              <ProductForm
                categories={categories}
                onSubmit={handleSaveProduct}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}