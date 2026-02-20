"use client"

import { ProductForm } from "@/components/forms/product-form"
import { useDashboard } from "@/hooks/useDashboard"
import { ProductFormHeader, ProductFormLayout } from "./components"
import { useProductCreation } from "./hooks"

export default function AddProductPage() {
  const { categories } = useDashboard()
  const { handleSaveProduct, handleCancel } = useProductCreation()

  return (
    <>
      <ProductFormHeader
        title="Add New Product"
        subtitle="Create a new product for your marketplace"
        onCancel={handleCancel}
      />
      <ProductFormLayout>
        <ProductForm
          categories={categories}
          onSubmit={handleSaveProduct}
          onCancel={handleCancel}
        />
      </ProductFormLayout>
    </>
  )
}