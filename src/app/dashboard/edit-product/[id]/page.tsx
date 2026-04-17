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
    <div className="min-h-screen bg-[#F8F9FA] relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-orange-400/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-400/5 blur-[100px] rounded-full" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-effect bg-white/80 backdrop-blur-xl border-b border-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Link
                href="/dashboard?tab=manage-products"
                className="p-2.5 rounded-2xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-95 group flex-shrink-0"
                aria-label="Back to products"
              >
                <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight uppercase truncate">
                  Edit product: {product?.name || "Product"}
                </h1>
                <p className="hidden sm:block text-[11px] font-black text-gray-400 uppercase tracking-widest truncate">
                  Update details, images, variations, and pricing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard?tab=manage-products">
                <Button variant="outline" className="flex items-center gap-2 h-12 px-4 sm:px-6 border border-white/70 bg-white/85 backdrop-blur-sm rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 group">
                  <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-8">
              <div className="glass-effect rounded-[3rem] border border-white shadow-2xl overflow-hidden premium-shadow bg-white/85 backdrop-blur-3xl p-1 bg-gradient-to-br from-white/95 to-white/75">
                <div className="p-4 sm:p-6 md:p-8 bg-white/80 rounded-[2.8rem] border border-white/70">
                  <ProductForm
                    initialData={product}
                    categories={categories}
                    onSubmit={handleSaveProduct}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            </div>

            {/* Side panel */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="glass-effect rounded-[2rem] border border-white bg-white/85 backdrop-blur-3xl p-6 shadow-xl premium-shadow">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-3 bg-orange-100 rounded-2xl">
                    <AlertTriangle className="h-5 w-5 text-orange-600" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Marketplace</p>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      Changes you save here update the product on the public marketplace and in your admin dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-[2.5rem] border border-white bg-white/85 backdrop-blur-3xl p-8 shadow-xl premium-shadow space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Inventory snapshot</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Base stock</span>
                    <span className="text-sm font-black text-gray-900">{product.stock} <span className="text-[10px] opacity-40 uppercase ml-1">{product.unit}</span></span>
                  </div>

                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">In-stock variations</span>
                    <span className="text-sm font-black text-gray-900">
                      {(product.variations || []).filter((v: any) => (v.stock || 0) > 0).length}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-bold leading-relaxed uppercase tracking-tight">
                    If base stock is zero, keep at least one variation in stock so the product can stay visible in the marketplace.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </div>
  )
}