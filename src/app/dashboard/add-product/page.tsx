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

export default function AddProductPage() {
  const router = useRouter()
  const { categories } = useDashboard()
  const { createProduct } = useProducts([]) // Empty array since we don't need existing products

  const handleSaveProduct = async (productData: any) => {
    try {
      const newProduct = await createProduct(productData)
      if (newProduct) {
        // Success - redirect back to manage products
        router.push("/dashboard?tab=manage-products")
      } else {
        // Handle error
        console.error("Failed to create product")
      }
    } catch (error) {
      console.error("Error creating product:", error)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard?tab=manage-products"
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="hidden sm:block text-sm text-gray-600">Create a new product for your marketplace</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard?tab=manage-products">
                <Button variant="outline" className="flex items-center space-x-2">
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
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