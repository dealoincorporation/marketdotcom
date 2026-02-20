"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface ReferralSettings {
  referrerReward: number
  refereeReward: number
  isActive: boolean
  description: string
}

interface AdminReferralSettingsFormProps {
  settings: ReferralSettings
  loading: boolean
  onSettingsChange: (settings: ReferralSettings) => void
  onSave: () => void
}

export function AdminReferralSettingsForm({
  settings,
  loading,
  onSettingsChange,
  onSave,
}: AdminReferralSettingsFormProps) {
  const updateField = <K extends keyof ReferralSettings>(key: K, value: ReferralSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Referral Program Settings</h2>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Configure Referral Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Referrer Reward (₦)
              </label>
              <input
                type="number"
                value={settings.referrerReward}
                onChange={(e) => updateField("referrerReward", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500">Amount referrer receives when someone signs up</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Referee Reward (₦)
              </label>
              <input
                type="number"
                value={settings.refereeReward}
                onChange={(e) => updateField("refereeReward", parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500">Amount new user receives on first purchase</p>
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
              placeholder="Describe the referral program to users"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="referralActive"
              checked={settings.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="referralActive" className="text-sm font-medium text-gray-700">
              Referral program is active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline">
              Reset to Default
            </Button>
            <Button
              onClick={onSave}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
