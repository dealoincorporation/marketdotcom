import * as React from "react"
import { normalizeImageUrl, normalizeImageUrls } from "@/lib/image-utils"
import { resolveSelectedOption } from "../utils"
import type { MarketplaceProduct, VariationOption } from "../types"

interface UseProductCardProps {
  product: MarketplaceProduct
  selectedVariationId?: string
}

export function useProductCard({ product, selectedVariationId }: UseProductCardProps) {
  const [imageIndex, setImageIndex] = React.useState(0)
  const [showOptions, setShowOptions] = React.useState(false)
  const [showSideModal, setShowSideModal] = React.useState(false)
  const [selectedVariation, setSelectedVariation] = React.useState<VariationOption | null>(null)

  const { options } = React.useMemo(
    () => resolveSelectedOption(product, selectedVariationId),
    [product, selectedVariationId]
  )

  const hasVariations = product.variations.length > 0
  const inStockVariations = product.variations.filter((v) => v.stock > 0)
  const hasVariationChoices = inStockVariations.length > 0
  const isActuallyInStock = product.stock > 0 || hasVariationChoices

  const normalizedImages = React.useMemo(() => {
    return normalizeImageUrls(product.images, (product as any).image)
  }, [product.images, (product as any).image])

  // Use first image if available, otherwise fallback to default
  const currentImage = normalizedImages?.[imageIndex] || "/market_image.jpeg"
  
  const selectedVariationImage = React.useMemo(() => {
    if (!selectedVariation) return null
    // For both base (standard) and variation options, use the option's image
    return normalizeImageUrl(selectedVariation.image)
  }, [selectedVariation])

  const displayImage = selectedVariationImage || currentImage

  const handleVariationSelect = (option: VariationOption) => {
    setSelectedVariation(option)
    setShowOptions(false)
    // Immediately open the side modal with the selected variation
    setTimeout(() => {
      setShowSideModal(true)
    }, 0)
  }

  const handleDirectAddToCart = () => {
    // Always show side modal - if no variation selected, show with first option or base
    if (options.length > 0) {
      const defaultOption = selectedVariation || options[0]
      setSelectedVariation(defaultOption)
      setShowSideModal(true)
    }
  }

  const handleOpenModal = () => {
    // Open the modal when card is clicked - if no variation selected, show with first option or base
    if (options.length > 0) {
      const defaultOption = selectedVariation || options[0]
      setSelectedVariation(defaultOption)
      setShowSideModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowSideModal(false)
    setSelectedVariation(null)
  }

  return {
    // State
    imageIndex,
    showOptions,
    showSideModal,
    selectedVariation,
    options,
    
    // Computed
    normalizedImages,
    currentImage,
    selectedVariationImage,
    displayImage,
    hasVariations,
    hasVariationChoices,
    isActuallyInStock,
    
    // Actions
    setImageIndex,
    setShowOptions,
    setSelectedVariation,
    handleVariationSelect,
    handleDirectAddToCart,
    handleOpenModal,
    handleCloseModal,
  }
}
