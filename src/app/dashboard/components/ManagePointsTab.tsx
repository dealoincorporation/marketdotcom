"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  RefreshCw,
  Save,
  Info,
  Zap,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"

interface PointsSettingsState {
  amountThreshold: number
  periodDays: number
  pointsPerThreshold: number
  pointsPerNaira: number
  nairaPerPoint: number
  minimumPointsToConvert: number
  conversionCooldownDays: number
  isActive: boolean
  description: string
}

const DEFAULT_SETTINGS: PointsSettingsState = {
  amountThreshold: 50000,
  periodDays: 30,
  pointsPerThreshold: 1,
  pointsPerNaira: 0.01,
  nairaPerPoint: 10,
  minimumPointsToConvert: 100,
  conversionCooldownDays: 30,
  isActive: true,
  description: "",
}

export default function ManagePointsTab() {
  const [settings, setSettings] = useState<PointsSettingsState>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch("/api/points-settings", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          setSettings({
            amountThreshold: data.amountThreshold ?? DEFAULT_SETTINGS.amountThreshold,
            periodDays: data.periodDays ?? DEFAULT_SETTINGS.periodDays,
            pointsPerThreshold: data.pointsPerThreshold ?? DEFAULT_SETTINGS.pointsPerThreshold,
            pointsPerNaira: data.pointsPerNaira ?? DEFAULT_SETTINGS.pointsPerNaira,
            nairaPerPoint: data.nairaPerPoint ?? DEFAULT_SETTINGS.nairaPerPoint,
            minimumPointsToConvert: data.minimumPointsToConvert ?? DEFAULT_SETTINGS.minimumPointsToConvert,
            conversionCooldownDays: data.conversionCooldownDays ?? DEFAULT_SETTINGS.conversionCooldownDays,
            isActive: data.isActive !== false,
            description: data.description ?? "",
          })
        }
      } catch (e) {
        console.error("Failed to fetch points settings", e)
        toast.error("Failed to load settings")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem("token")
      const res = await fetch("/api/points-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amountThreshold: settings.amountThreshold,
          periodDays: settings.periodDays,
          pointsPerThreshold: settings.pointsPerThreshold,
          pointsPerNaira: settings.pointsPerNaira,
          nairaPerPoint: settings.nairaPerPoint,
          minimumPointsToConvert: settings.minimumPointsToConvert,
          conversionCooldownDays: settings.conversionCooldownDays,
          isActive: settings.isActive,
          description: settings.description || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || "Failed to save")
        return
      }
      toast.success("Points & conversion settings saved")
      setSettings((prev) => ({
        ...prev,
        amountThreshold: data.amountThreshold ?? prev.amountThreshold,
        periodDays: data.periodDays ?? prev.periodDays,
        pointsPerThreshold: data.pointsPerThreshold ?? prev.pointsPerThreshold,
        pointsPerNaira: data.pointsPerNaira ?? prev.pointsPerNaira,
        nairaPerPoint: data.nairaPerPoint ?? prev.nairaPerPoint,
        minimumPointsToConvert: data.minimumPointsToConvert ?? prev.minimumPointsToConvert,
        conversionCooldownDays: data.conversionCooldownDays ?? prev.conversionCooldownDays,
        isActive: data.isActive !== false,
        description: data.description ?? prev.description,
      }))
    } catch (e) {
      console.error("Failed to save", e)
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const setNum = (key: keyof PointsSettingsState, value: number) =>
    setSettings((s) => ({ ...s, [key]: value }))
  const setBool = (key: keyof PointsSettingsState, value: boolean) =>
    setSettings((s) => ({ ...s, [key]: value }))
  const setStr = (key: keyof PointsSettingsState, value: string) =>
    setSettings((s) => ({ ...s, [key]: value }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <p className="text-gray-500">Loading points settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Points & Conversion</h1>
        <p className="text-gray-600 mt-1">
          Control how customers earn points on purchases and how they convert points into wallet balance.
        </p>
      </div>

      {/* Earning rules */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <TrendingUp className="h-5 w-5" />
            Earning rules
          </CardTitle>
          <p className="text-sm text-gray-600">
            These settings define how many points customers earn when they make purchases (patronage). Points are awarded based on how much they spend within a time window.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount threshold (₦)
              </label>
              <Input
                type="number"
                min={1}
                value={settings.amountThreshold}
                onChange={(e) =>
                  setNum("amountThreshold", Math.max(1, parseInt(e.target.value, 10) || 0))
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                One &quot;block&quot; of spending equals this amount. Example: if you set 50,000, then every ₦50,000 a customer spends in the period counts as one block. ₦100,000 = 2 blocks, ₦75,000 = 1 block (no partial blocks).
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Period (days)
              </label>
              <Input
                type="number"
                min={1}
                value={settings.periodDays}
                onChange={(e) =>
                  setNum("periodDays", Math.max(1, parseInt(e.target.value, 10) || 0))
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                The number of days to look back when calculating how much a customer has spent. Example: 30 means we use the total they spent in the last 30 days to decide how many blocks they get (and thus how many points).
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Points per block
              </label>
              <Input
                type="number"
                min={0}
                value={settings.pointsPerThreshold}
                onChange={(e) =>
                  setNum("pointsPerThreshold", Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                How many points the customer gets for each block of spending. Example: with threshold ₦50,000 and this set to 1, a customer who spent ₦100,000 in the period gets 2 points. Set to 10 and they get 20 points.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Points per ₦1 (optional / legacy)
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={settings.pointsPerNaira}
                onChange={(e) =>
                  setNum("pointsPerNaira", Math.max(0, parseFloat(e.target.value) || 0))
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                An alternative way to award points (e.g. 0.01 = 1 point per ₦100). The main system uses the &quot;threshold + blocks&quot; above; use this only if you need a secondary rule or are migrating from an old setup.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion rules */}
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-900">
            <RefreshCw className="h-5 w-5" />
            Conversion to cash
          </CardTitle>
          <p className="text-sm text-gray-600">
            When a customer clicks &quot;Convert to Cash&quot; in their Wallet, their points are turned into naira and added to their wallet balance. These settings control the conversion rate and limits.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Points needed for ₦1 (conversion rate)
              </label>
              <Input
                type="number"
                min={0.1}
                step="0.1"
                value={settings.nairaPerPoint}
                onChange={(e) =>
                  setNum("nairaPerPoint", Math.max(0.1, parseFloat(e.target.value) || 1))
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                How many points equal ₦1. Example: 10 means 10 points = ₦1, so 100 points = ₦10 and 1,000 points = ₦100. The customer must have at least this many points per naira they want to receive.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Minimum points to convert
              </label>
              <Input
                type="number"
                min={1}
                value={settings.minimumPointsToConvert}
                onChange={(e) =>
                  setNum("minimumPointsToConvert", Math.max(1, parseInt(e.target.value, 10) || 0))
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Customers cannot convert if their total points are below this number. Example: 100 means they need at least 100 points before they can use &quot;Convert to Cash&quot;.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cooldown between conversions (days)
              </label>
              <Input
                type="number"
                min={0}
                value={settings.conversionCooldownDays}
                onChange={(e) =>
                  setNum("conversionCooldownDays", Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Minimum number of days that must pass before the same customer can convert again. Set to 0 to allow conversions as often as they like; set to 30 to limit to once per month per customer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General */}
      <Card className="border-2 border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Zap className="h-5 w-5" />
            General
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Optional text and a master switch for the whole points program.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Program description (shown to customers)
            </label>
            <textarea
              value={settings.description}
              onChange={(e) => setStr("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g. Earn points on every purchase and convert them to cash in your wallet."
            />
            <p className="text-xs text-gray-500">
              Short explanation of the points program that customers see (e.g. on the Wallet page). Leave blank if you do not need custom text.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pointsActive"
              checked={settings.isActive}
              onChange={(e) => setBool("isActive", e.target.checked)}
              className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="pointsActive" className="text-sm font-medium text-gray-700">
              Points program is on — customers can earn points on purchases and convert points to wallet balance
            </label>
          </div>
          <p className="text-xs text-gray-500">
            If you turn this off, customers will not earn new points and will not be able to convert points to cash until you turn it back on.
          </p>
        </CardContent>
      </Card>

      {/* Summary & actions */}
      <Card className="border border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Info className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">
                Summary: Customers earn {settings.pointsPerThreshold} point{settings.pointsPerThreshold !== 1 ? "s" : ""} per ₦{(settings.amountThreshold || 0).toLocaleString()} spent in the last {settings.periodDays} days. When converting, {settings.nairaPerPoint} points = ₦1, and they need at least {settings.minimumPointsToConvert} points to convert.
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setSettings(DEFAULT_SETTINGS)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to defaults
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save settings"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
