"use client"

import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useProducts } from "@/hooks/useProducts"

interface UseProductCreationOptions {
  redirectPath?: string
  successMessage?: (productName: string) => string
  errorMessage?: string
}

export function useProductCreation(options: UseProductCreationOptions = {}) {
  const router = useRouter()
  const { createProduct } = useProducts([])
  const {
    redirectPath = "/dashboard?tab=manage-products",
    successMessage = (name) => `Product "${name}" added successfully!`,
    errorMessage = "Failed to create product. Please try again.",
  } = options

  const handleSaveProduct = async (productData: any): Promise<void> => {
    try {
      const newProduct = await createProduct(productData)
      if (newProduct) {
        toast.success(successMessage(productData.name), {
          duration: 4000,
          icon: '✅',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        setTimeout(() => {
          router.push(redirectPath)
        }, 500)
      } else {
        toast.error(errorMessage, {
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
      const errorMsg = error instanceof Error ? error.message : "An error occurred while creating the product."
      toast.error(errorMsg, {
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

  return {
    handleSaveProduct,
    handleCancel,
  }
}
