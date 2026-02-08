"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Plus, Edit, Trash2, Eye, EyeOff, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "../types"

interface ProductsSectionProps {
  products: Product[]
  lowStockItems: Product[]
  onDeleteProduct: (productId: string) => void
  onToggleStockStatus: (product: Product) => void
  onPriceManagement: (product: Product) => void
}

export function ProductsSection({
  products,
  lowStockItems,
  onDeleteProduct,
  onToggleStockStatus,
  onPriceManagement,
}: ProductsSectionProps) {
  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '₦0'
    }
    return `₦${price.toLocaleString()}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <Link href="/dashboard/add-product">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <TrendingUp className="h-5 w-5" />
              <span>Low Stock Alert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-md border border-orange-200">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.stock} {product.unit} remaining</div>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-600 line-clamp-1">{product.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{product.category.name}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {formatPrice(product.basePrice)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={product.inStock ? "default" : "secondary"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/dashboard/edit-product/${product.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleStockStatus(product)}
                          title={product.inStock ? "Put Out of Stock" : "Put In Stock"}
                          className={product.inStock ? "text-yellow-600 hover:text-yellow-700 hover:border-yellow-300" : "text-green-600 hover:text-green-700 hover:border-green-300"}
                        >
                          {product.inStock ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPriceManagement(product)}
                          title="Manage Price"
                          className="text-blue-600 hover:text-blue-700 hover:border-blue-300"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
