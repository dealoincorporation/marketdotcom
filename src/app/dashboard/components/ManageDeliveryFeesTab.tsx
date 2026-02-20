"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Save, Search, Truck, ShoppingCart, Info, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNotification } from "@/hooks/useNotification"
import { NotificationModal } from "@/components/ui/notification-modal"

interface Product {
  id: string
  name: string
  groupName?: string | null
  description?: string | null
  basePrice?: number | null
  categoryId?: string | null
  category?: { id?: string; name: string }
  stock?: number | null
  unit?: string | null
  inStock?: boolean | null
  image?: string | null
  weightKg: number | null
  deliveryFee: number | null
}

interface DeliverySettingsData {
  baseFee: number
  feePerKg: number
  feeTier1: number
  feeTier2: number
  feeTier3: number
  minimumOrderQuantity: number
  minimumOrderAmount: number
  deliveryInfoPoints: string[]
}

interface ManageDeliveryFeesTabProps {
  isAdmin: boolean
}

export default function ManageDeliveryFeesTab({ isAdmin }: ManageDeliveryFeesTabProps) {
  const { notification, showSuccess, showError, closeNotification } = useNotification()
  const [settings, setSettings] = useState<DeliverySettingsData>({
    baseFee: 500,
    feePerKg: 50,
    feeTier1: 2000,
    feeTier2: 3500,
    feeTier3: 5000,
    minimumOrderQuantity: 1,
    minimumOrderAmount: 0,
    deliveryInfoPoints: [],
  })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [deliveryInfoSaving, setDeliveryInfoSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editedWeights, setEditedWeights] = useState<Record<string, string>>({})
  const [editedFees, setEditedFees] = useState<Record<string, string>>({})

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/delivery-settings", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setSettings({
          baseFee: data.baseFee ?? 500,
          feePerKg: data.feePerKg ?? 50,
          feeTier1: data.feeTier1 ?? 2000,
          feeTier2: data.feeTier2 ?? 3500,
          feeTier3: data.feeTier3 ?? 5000,
          minimumOrderQuantity: data.minimumOrderQuantity ?? 1,
          minimumOrderAmount: data.minimumOrderAmount ?? 0,
          deliveryInfoPoints: Array.isArray(data.deliveryInfoPoints) ? data.deliveryInfoPoints : [],
        })
      }
    } catch {
      // keep defaults
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch("/api/products", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setProducts(data)
      const weights: Record<string, string> = {}
      const fees: Record<string, string> = {}
      data.forEach((p: Product) => {
        weights[p.id] = p.weightKg != null ? String(p.weightKg) : ""
        fees[p.id] =
          p.deliveryFee === null || p.deliveryFee === undefined
            ? ""
            : p.deliveryFee === 0
              ? "0"
              : String(p.deliveryFee)
      })
      setEditedWeights(weights)
      setEditedFees(fees)
    } catch (err) {
      showError("Failed to load products", err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSaveSettings = async () => {
    try {
      setSettingsSaving(true)
      const token = localStorage.getItem("token")
      const res = await fetch("/api/delivery-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          baseFee: Number(settings.baseFee),
          feePerKg: Number(settings.feePerKg),
          feeTier1: Number(settings.feeTier1),
          feeTier2: Number(settings.feeTier2),
          feeTier3: Number(settings.feeTier3),
          minimumOrderQuantity: Math.max(1, Math.floor(Number(settings.minimumOrderQuantity)) || 1),
          minimumOrderAmount: Math.max(0, Number(settings.minimumOrderAmount) || 0),
          deliveryInfoPoints: settings.deliveryInfoPoints,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to save settings")
      }
      showSuccess("Settings saved", "Delivery & MOQ settings updated successfully.")
      await fetchSettings()
    } catch (err) {
      showError("Failed to save settings", err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleSaveDeliveryInfo = async () => {
    try {
      setDeliveryInfoSaving(true)
      const token = localStorage.getItem("token")
      const res = await fetch("/api/delivery-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          baseFee: Number(settings.baseFee),
          feePerKg: Number(settings.feePerKg),
          minimumOrderQuantity: Math.max(1, Math.floor(Number(settings.minimumOrderQuantity)) || 1),
          minimumOrderAmount: Math.max(0, Number(settings.minimumOrderAmount) || 0),
          deliveryInfoPoints: settings.deliveryInfoPoints.filter((s) => s.trim().length > 0),
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to save delivery information")
      }
      showSuccess("Delivery information saved", "Checkout delivery info updated. It will appear in the Schedule Your Delivery section.")
      await fetchSettings()
    } catch (err) {
      showError("Failed to save delivery information", err instanceof Error ? err.message : "An error occurred")
    } finally {
      setDeliveryInfoSaving(false)
    }
  }

  const handleDeliveryInfoPointChange = (index: number, value: string) => {
    setSettings((s) => ({
      ...s,
      deliveryInfoPoints: s.deliveryInfoPoints.map((p, i) => (i === index ? value : p)),
    }))
  }

  const addDeliveryInfoPoint = () => {
    setSettings((s) => ({
      ...s,
      deliveryInfoPoints: [...s.deliveryInfoPoints, ""],
    }))
  }

  const removeDeliveryInfoPoint = (index: number) => {
    setSettings((s) => ({
      ...s,
      deliveryInfoPoints: s.deliveryInfoPoints.filter((_, i) => i !== index),
    }))
  }

  const handleWeightChange = (productId: string, value: string) => {
    setEditedWeights((prev) => ({ ...prev, [productId]: value }))
  }

  const handleFeeChange = (productId: string, value: string) => {
    setEditedFees((prev) => ({ ...prev, [productId]: value }))
  }

  const handleSaveProducts = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      const updates = products.map((p) => ({
        id: p.id,
        weightKg: (() => {
          const v = editedWeights[p.id]?.trim()
          if (v === "") return null
          const n = parseFloat(v)
          return Number.isNaN(n) || n < 0 ? null : n
        })(),
        deliveryFee: (() => {
          const v = editedFees[p.id]?.trim()
          if (v === "") return null
          if (v === "0") return 0
          const n = parseFloat(v)
          return Number.isNaN(n) || n < 0 ? null : n
        })(),
      }))

      await Promise.all(
        updates.map((u) => {
          const product = products.find((x) => x.id === u.id)
          if (!product) return Promise.resolve()
          return fetch(`/api/products/${u.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              name: product.name,
              groupName: product.groupName ?? "",
              description: product.description ?? "",
              basePrice: product.basePrice ?? 0,
              categoryId: product.categoryId ?? product.category?.id,
              stock: product.stock ?? 0,
              unit: product.unit ?? "piece",
              inStock: product.inStock ?? true,
              image: product.image,
              weightKg: u.weightKg,
              deliveryFee: u.deliveryFee,
            }),
          })
        })
      )
      await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: "Product weights & delivery overrides updated",
          message: "Weights and delivery overrides have been saved successfully.",
          type: "DELIVERY",
        }),
      }).catch(() => {})
      showSuccess("Products updated", "Weights and delivery overrides saved.")
      await fetchProducts()
    } catch (err) {
      showError("Failed to save products", err instanceof Error ? err.message : "An error occurred")
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const hasProductChanges = products.some((p) => {
    const w = editedWeights[p.id] ?? ""
    const f = editedFees[p.id] ?? ""
    const currentW = p.weightKg != null ? String(p.weightKg) : ""
    const currentF =
      p.deliveryFee === null || p.deliveryFee === undefined ? "" : p.deliveryFee === 0 ? "0" : String(p.deliveryFee)
    return w !== currentW || f !== currentF
  })

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don&apos;t have permission to manage delivery settings.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Delivery & MOQ Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Set global delivery rules (weight-based), minimum order quantity, and per-product weight and overrides.
        </p>
      </div>

      {/* Global settings */}
      <Card className="mb-6 shadow-md border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Truck className="h-5 w-5" />
            Global Delivery & MOQ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Weight-tier delivery fees */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">Delivery Fee Tiers (by total order weight)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <Label className="text-sm font-medium text-green-800">1 – 50 kg (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={settings.feeTier1}
                  onChange={(e) => setSettings((s) => ({ ...s, feeTier1: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 h-11"
                />
                <p className="text-xs text-green-700 mt-1">Standard delivery range</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <Label className="text-sm font-medium text-amber-800">51 – 100 kg (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={settings.feeTier2}
                  onChange={(e) => setSettings((s) => ({ ...s, feeTier2: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 h-11"
                />
                <p className="text-xs text-amber-700 mt-1">Mid-range delivery</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Label className="text-sm font-medium text-red-800">100+ kg (₦)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={settings.feeTier3}
                  onChange={(e) => setSettings((s) => ({ ...s, feeTier3: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 h-11"
                />
                <p className="text-xs text-red-700 mt-1">Heavy-load delivery</p>
              </div>
            </div>
          </div>

          {/* MOQ settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Min. order quantity (MOQ)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={settings.minimumOrderQuantity}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    minimumOrderQuantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                  }))
                }
                className="mt-1 h-11"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum items to checkout</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Min. order amount (₦)</Label>
              <Input
                type="number"
                min="0"
                step="100"
                value={settings.minimumOrderAmount}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    minimumOrderAmount: Math.max(0, parseFloat(e.target.value) || 0),
                  }))
                }
                className="mt-1 h-11"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum subtotal (0 = no minimum)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={handleSaveSettings}
              disabled={settingsSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {settingsSaving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block mr-2" />
              Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
              Save global settings
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Delivery fee is based on the total order weight tier: 1–50 kg, 51–100 kg, or 100+ kg.
            Each tier has a flat fee. Products with weight (kg) set below contribute to total weight.
          </p>
        </CardContent>
      </Card>

      {/* Checkout Delivery Information */}
      <Card className="mb-6 shadow-md border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Info className="h-5 w-5" />
            Delivery Information (Checkout)
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Bullet points shown in the checkout under &quot;Schedule Your Delivery&quot;. Customers see this in the 🚚 Delivery Information box.
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            {settings.deliveryInfoPoints.map((point, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={point}
                  onChange={(e) => handleDeliveryInfoPointChange(index, e.target.value)}
                  placeholder={`Bullet ${index + 1}`}
                  className="flex-1 h-11"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-11 w-11 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeDeliveryInfoPoint(index)}
                  title="Remove line"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addDeliveryInfoPoint}
              className="border-dashed border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add bullet point
            </Button>
            <Button
              onClick={handleSaveDeliveryInfo}
              disabled={deliveryInfoSaving}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {deliveryInfoSaving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save delivery information
                </>
              )}
            </Button>
          </div>
          {settings.deliveryInfoPoints.length === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              No bullet points yet. Add at least one and save to show delivery information in checkout. Empty lines are ignored when saving.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Product weights & overrides */}
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product weights & delivery overrides
            </CardTitle>
            <Button
              onClick={handleSaveProducts}
              disabled={saving || !hasProductChanges}
              title={!hasProductChanges ? "Edit weight or delivery override above, then save" : undefined}
              className="bg-orange-600 hover:bg-orange-700 text-white shrink-0 disabled:opacity-60 disabled:pointer-events-none"
            >
              {saving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save all changes
                </>
              )}
            </Button>
          </div>
          {!hasProductChanges && (
            <p className="text-xs text-gray-500 mt-1">Edit weight (kg) or delivery override (₦) in the table below, then click Save all changes.</p>
          )}
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="px-4 sm:px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-600">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Weight (kg)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Delivery override (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                      <td className="py-3 px-4 text-gray-600">{product.category?.name ?? "—"}</td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="0"
                          value={editedWeights[product.id] ?? ""}
                          onChange={(e) => handleWeightChange(product.id, e.target.value)}
                          className="w-24 h-10"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Default"
                          value={editedFees[product.id] ?? ""}
                          onChange={(e) => handleFeeChange(product.id, e.target.value)}
                          className="w-28 h-10"
                        />
                        <p className="text-xs text-gray-500 mt-1">Empty = weight-based | 0 = free | Number = custom</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredProducts.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end">
              <Button
                onClick={handleSaveProducts}
                disabled={saving || !hasProductChanges}
                title={!hasProductChanges ? "Edit weight or delivery override above, then save" : undefined}
                className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-60 disabled:pointer-events-none"
              >
                {saving ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent inline-block mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save all changes
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
      />
    </motion.div>
  )
}
