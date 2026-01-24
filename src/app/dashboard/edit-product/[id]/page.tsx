"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, X, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductForm } from "@/components/forms/product-form"
import { useDashboard } from "@/hooks/useDashboard"
import { useProducts } from "@/hooks/useProducts"
import toast from "react-hot-toast"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { categories, products } = useDashboard()
  const { updateProduct } = useProducts(products)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const productId = params.id as string

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)

      // Fast path: if dashboard already has it, show immediately, then refresh from API.
      const foundProduct = products.find(p => p.id === productId)
      if (foundProduct && !cancelled) {
        setProduct(foundProduct)
      }

      try {
        const res = await fetch(`/api/products/${productId}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to load product")
        const data = await res.json()
        if (!cancelled) setProduct(data)
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load product")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [products, productId])

  const handleSaveProduct = async (productData: any) => {
    try {
      const updatedProduct = await updateProduct(productId, productData)
      if (updatedProduct) {
        // Success toast notification
        toast.success(`Product "${productData.name}" updated successfully!`, {
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
        toast.error("Failed to update product. Please try again.", {
          duration: 4000,
          icon: '❌',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        console.error("Failed to update product")
      }
    } catch (error) {
      // Error toast notification
      toast.error(error instanceof Error ? error.message : "An error occurred while updating the product.", {
        duration: 4000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      })
      console.error("Error updating product:", error)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            {loadError ? loadError : "The product you're looking for doesn't exist."}
          </p>
          <Link href="/dashboard?tab=manage-products">
            <Button className="bg-orange-600 hover:bg-orange-700">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/dashboard?tab=manage-products"
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Back to products"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Edit: {product?.name || "Product"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  Update details, images, inventory, and variations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard?tab=manage-products">
                <Button variant="outline" className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form */}
            <div className="lg:col-span-8">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <ProductForm
                    initialData={product}
                    categories={categories}
                    onSubmit={handleSaveProduct}
                    onCancel={handleCancel}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Side panel */}
            <aside className="lg:col-span-4 space-y-4">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-md">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-orange-600">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">This affects Marketplace cards</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Changes here update the same product shown on <span className="font-medium">/marketplace</span> and the dashboard marketplace.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-md">
                <CardContent className="p-4 sm:p-5 space-y-2">
                  <p className="font-semibold text-gray-900">Current Inventory Snapshot</p>
                  <div className="text-sm text-gray-700 flex items-center justify-between">
                    <span>Base stock</span>
                    <span className="font-medium">{product.stock} {product.unit}</span>
                  </div>
                  <div className="text-sm text-gray-700 flex items-center justify-between">
                    <span>In-stock variations</span>
                    <span className="font-medium">
                      {(product.variations || []).filter((v: any) => (v.stock || 0) > 0).length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 pt-2">
                    Tip: if base stock is 0, at least one variation must have stock for the item to be purchasable.
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  )
}