"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface PointsSettings {
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

interface AdminPointsSettingsFormProps {
  settings: PointsSettings
  loading: boolean
  onSettingsChange: (settings: PointsSettings) => void
  onSave: () => void
}

const DEFAULT_SETTINGS: PointsSettings = {
  amountThreshold: 50000,
  periodDays: 30,
  pointsPerThreshold: 1,
  pointsPerNaira: 0.01,
  nairaPerPoint: 10,
  minimumPointsToConvert: 100,
  conversionCooldownDays: 30,
  isActive: true,
  description: "Earn points on every purchase and convert to cash!",
}

export function AdminPointsSettingsForm({
  settings,
  loading,
  onSettingsChange,
  onSave,
}: AdminPointsSettingsFormProps) {
  const updateField = <K extends keyof PointsSettings>(key: K, value: PointsSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Points Program Settings</h2>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Configure Points & Rewards</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Earn points per purchase: every ₦X spent = Y points (e.g. ₦50,000 = 1 point; ₦100,000 = 2 points)</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount threshold (₦)
              </label>
              <input
                type="number"
                min={1}
                value={settings.amountThreshold}
                onChange={(e) => updateField("amountThreshold", parseInt(e.target.value, 10) || 50000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500">Every purchase up to this amount = one block (e.g. 50,000)</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Points per threshold
              </label>
              <input
                type="number"
                min={0}
                value={settings.pointsPerThreshold}
                onChange={(e) => updateField("pointsPerThreshold", parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500">Points per block (e.g. 1 or 10). ₦100K with ₦50K threshold = 2 × this</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Points per ₦1 Spent (legacy)
              </label>
              <input
                type="number"
                step="0.01"
                value={settings.pointsPerNaira}
                onChange={(e) => updateField("pointsPerNaira", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500">Optional; earning uses threshold above</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ₦ per Point (Conversion)
              </label>
              <input
                type="number"
                value={settings.nairaPerPoint}
                onChange={(e) => updateField("nairaPerPoint", parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500">Cash value per point when converting</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Minimum Points to Convert
              </label>
              <input
                type="number"
                value={settings.minimumPointsToConvert}
                onChange={(e) => updateField("minimumPointsToConvert", parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Conversion Cooldown (Days)
              </label>
              <input
                type="number"
                value={settings.conversionCooldownDays}
                onChange={(e) => updateField("conversionCooldownDays", parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Program Description
            </label>
            <textarea
              value={settings.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Describe the points program to users"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="pointsActive"
              checked={settings.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="pointsActive" className="text-sm font-medium text-gray-700">
              Points program is active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onSettingsChange(DEFAULT_SETTINGS)}
            >
              Reset to Default
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={onSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
