"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      <div className="mb-0">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase tracking-[0.1em]">Loyalty Credits</h1>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Reward your most dedicated customers and drive repeat patronage</p>
      </div>

      {/* Earning rules */}
      <Card className="glass-effect border-white/70 rounded-[2rem] premium-shadow overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-b border-white/50 p-8">
          <CardTitle className="flex items-center gap-3 text-gray-900 text-xl font-black uppercase tracking-widest">
            <TrendingUp className="h-6 w-6 text-amber-600" />
            <span>Patronage Rewards</span>
          </CardTitle>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Define how customers accumulate points through their spending</p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Spending Milestone (₦)
              </label>
              <Input
                type="number"
                min={1}
                value={settings.amountThreshold}
                onChange={(e) =>
                  setNum("amountThreshold", Math.max(1, parseInt(e.target.value, 10) || 0))
                }
                className="h-14 text-lg font-black bg-white/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20"
              />
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                For every ₦{(settings.amountThreshold || 0).toLocaleString()} spent, points are unlocked.
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Window of Activity (Days)
              </label>
              <Input
                type="number"
                min={1}
                value={settings.periodDays}
                onChange={(e) =>
                  setNum("periodDays", Math.max(1, parseInt(e.target.value, 10) || 0))
                }
                className="h-14 text-lg font-black bg-white/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20"
              />
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                Number of days purchase history stays active for points.
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Points per Milestone
              </label>
              <Input
                type="number"
                min={0}
                value={settings.pointsPerThreshold}
                onChange={(e) =>
                  setNum("pointsPerThreshold", Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                className="h-14 text-lg font-black bg-white/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20"
              />
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                Tokens awarded for each completed spending block.
              </p>
            </div>
            <div className="space-y-3 opacity-60">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Direct Rate (Points/₦)
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={settings.pointsPerNaira}
                onChange={(e) =>
                  setNum("pointsPerNaira", Math.max(0, parseFloat(e.target.value) || 0))
                }
                className="h-14 bg-white/10 border-gray-200 rounded-2xl"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion rules */}
      <Card className="glass-effect border-white/70 rounded-[2rem] premium-shadow overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-b border-white/50 p-8">
          <CardTitle className="flex items-center gap-3 text-gray-900 text-xl font-black uppercase tracking-widest">
            <RefreshCw className="h-6 w-6 text-emerald-600" />
            <span>Redemption Portal</span>
          </CardTitle>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Set the exchange rate for points-to-wallet conversion</p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Unit Value (Points = ₦1)
              </label>
              <Input
                type="number"
                min={0.1}
                step="0.1"
                value={settings.nairaPerPoint}
                onChange={(e) =>
                  setNum("nairaPerPoint", Math.max(0.1, parseFloat(e.target.value) || 1))
                }
                className="h-14 text-lg font-black bg-white/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                Cost of one Naira in loyalty points.
              </p>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Redemption Floor
              </label>
              <Input
                type="number"
                min={1}
                value={settings.minimumPointsToConvert}
                onChange={(e) =>
                  setNum("minimumPointsToConvert", Math.max(1, parseInt(e.target.value, 10) || 0))
                }
                className="h-14 text-lg font-black bg-white/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                Minimum tokens required to trigger a payout.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General */}
      <Card className="glass-effect border-white/70 rounded-[2rem] premium-shadow p-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-gray-900 p-6 rounded-[1.5rem] border border-white/10">
            <input
              type="checkbox"
              id="pointsActive"
              checked={settings.isActive}
              onChange={(e) => setBool("isActive", e.target.checked)}
              className="h-5 w-5 text-orange-600 rounded-lg border-white/20 bg-white/10"
            />
            <div>
              <label htmlFor="pointsActive" className="block text-xs font-black text-white uppercase tracking-widest cursor-pointer">
                Program Live Status
              </label>
              <p className="text-[10px] text-gray-400 font-medium mt-1">
                When active, customers earn and redeem rewards in real-time.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <Info className="h-5 w-5 text-orange-600" />
              <span>
                {settings.pointsPerThreshold} PT per ₦{(settings.amountThreshold || 0).toLocaleString()} • {settings.nairaPerPoint} PT = ₦1
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setSettings(DEFAULT_SETTINGS)}
                className="h-14 px-6 rounded-2xl border-gray-200 text-[11px] font-black uppercase tracking-widest"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-[12px] uppercase tracking-[0.2em] px-10 py-7 rounded-[1.5rem] shadow-xl hover:shadow-orange-500/20 transition-all flex items-center gap-3"
              >
                <Save className="h-5 w-5" />
                {saving ? "Deploying..." : "Push Settings"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
