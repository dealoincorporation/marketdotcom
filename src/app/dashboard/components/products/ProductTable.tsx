"use client"

import Link from "next/link"
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
  id: string
  name: string
  groupName?: string | null
  description: string
  basePrice: number
  categoryId: string
  category: { id: string; name: string }
  stock: number
  unit: string
  inStock: boolean
  createdAt: string
  updatedAt: string
  variations: Array<{
    id: string
    name: string
    price: number
    stock: number
    unit?: string
    quantity?: number
    image?: string
  }>
}

interface ProductTableProps {
  filteredProducts: Product[]
  totalProducts: number
  selectedProducts: string[]
  effectiveProductGroup: string
  searchTerm: string
  selectedCategory: string
  stockFilter: string
  formatPrice: (price: number) => string
  onSelectProduct: (id: string) => void
  onSelectAll: () => void
  onToggleStockStatus: (product: Product) => void
  onDeleteProduct: (productId: string) => void
}

export function ProductTable({
  filteredProducts,
  totalProducts,
  selectedProducts,
  effectiveProductGroup,
  searchTerm,
  selectedCategory,
  stockFilter,
  formatPrice,
  onSelectProduct,
  onSelectAll,
  onToggleStockStatus,
  onDeleteProduct,
}: ProductTableProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span>
            {effectiveProductGroup !== "all" ? "Variants" : "Products"} ({filteredProducts.length})
          </span>
          <Badge variant="outline" className="text-xs">
            {filteredProducts.length} of {totalProducts} shown
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* Mobile: Card Layout */}
        <div className="block sm:hidden">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({filteredProducts.length})
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {filteredProducts.length} shown
              </Badge>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => onSelectProduct(product.id)}
                      className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <span className="ml-1 text-gray-900">{product.category.name}</span>
                  </div>
                  {(product.groupName || product.name) && (
                    <div>
                      <span className="text-gray-500">Product:</span>
                      <span className="ml-1 text-gray-900">{product.groupName || product.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-1 font-medium text-gray-900">{formatPrice(product.basePrice)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stock:</span>
                    <span className={`ml-1 font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={product.inStock ? "default" : "secondary"} className="ml-1 text-xs">
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Created: {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Link href={`/dashboard/edit-product/${product.id}`}>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleStockStatus(product)}
                      className={`h-8 w-8 p-0 ${product.inStock ? "text-yellow-600 hover:text-yellow-700 hover:border-yellow-300" : "text-green-600 hover:text-green-700 hover:border-green-300"}`}
                    >
                      {product.inStock ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteProduct(product.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Table Layout */}
        <div className="hidden sm:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 font-medium text-gray-700 w-12">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={onSelectAll}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => onSelectProduct(product.id)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-600 line-clamp-1 max-w-xs">{product.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{product.category.name}</td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{product.groupName || "—"}</td>
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
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
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
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== "all" || stockFilter !== "all"
                ? "Try adjusting your filters or search terms."
                : "Get started by adding your first product."}
            </p>
            <Link href="/dashboard/add-product">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
