"use client"

import { Gift, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ReferralSettings {
  referrerReward: number | string
  refereeReward: number | string
  isActive: boolean
  description: string
}

interface ReferralData {
  code: string
  totalReferrals: number
  successfulReferrals: number
  totalEarned: number
}

interface WalletReferralSectionProps {
  referralSettings: ReferralSettings
  referralSettingsLoading: boolean
  referralData: ReferralData
  referralLoading: boolean
  fallbackReferralCode: string
  formatPrice: (price: number) => string
  formatRefereeRewardForShare: (value: string | number | undefined) => string
  onShareReferralCode: () => void
  onCopyReferralCode: () => void
}

export function WalletReferralSection({
  referralSettings,
  referralSettingsLoading,
  referralData,
  referralLoading,
  fallbackReferralCode,
  formatPrice,
  formatRefereeRewardForShare,
  onShareReferralCode,
  onCopyReferralCode,
}: WalletReferralSectionProps) {
  return (
    <Card className="mb-8 shadow-md border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <Users className="h-5 w-5 text-blue-600" />
          <span>Referral Program</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Prominent Reward Banner */}
        {!referralSettingsLoading && referralSettings.isActive && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="h-6 w-6" />
              <h3 className="text-xl md:text-2xl font-bold">
                Refer a friend and earn {formatRefereeRewardForShare(referralSettings.referrerReward)}!
              </h3>
            </div>
            <p className="text-center text-sm md:text-base text-orange-100">
              Your friends get {formatRefereeRewardForShare(referralSettings.refereeReward)} bonus on their first purchase
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {referralLoading ? "..." : referralData.totalReferrals}
            </div>
            <div className="text-gray-600 text-xs md:text-sm">Total Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {referralLoading ? "..." : referralData.successfulReferrals}
            </div>
            <div className="text-gray-600 text-xs md:text-sm">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {referralLoading ? "..." : formatPrice(referralData.totalEarned)}
            </div>
            <div className="text-gray-600 text-xs md:text-sm">Total Earned</div>
          </div>
          <div className="text-center col-span-2 md:col-span-1">
            <div className={`text-sm md:text-lg font-mono px-2 md:px-3 py-2 rounded-md mb-2 break-all border-2 ${referralSettings.isActive
                ? "bg-white border-blue-300"
                : "bg-gray-100 border-gray-300 text-gray-400 select-none"
              }`}>
              {referralLoading ? "..." : (referralSettings.isActive ? (referralData.code || fallbackReferralCode || "...") : "••••••")}
            </div>
            <div className="text-gray-600 text-xs md:text-sm">
              {referralSettings.isActive ? "Your Code" : "Program Paused"}
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Gift className={`h-5 w-5 mt-0.5 flex-shrink-0 ${referralSettings.isActive ? "text-blue-600" : "text-gray-400"}`} />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-3 text-lg">How Referral Program Works</h4>
                <div className="text-gray-700 text-sm space-y-2">
                  {referralSettingsLoading ? (
                    <p className="text-gray-500">Loading referral details...</p>
                  ) : !referralSettings.isActive ? (
                    <p className="text-gray-500 italic">The referral program is currently disabled by the administrator. Check back later!</p>
                  ) : (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <p>
                          <strong className="text-gray-900">You earn rewards</strong> when someone signs up using your referral code
                          {referralSettings.referrerReward && (
                            <span className="text-blue-600 font-semibold"> ({formatRefereeRewardForShare(referralSettings.referrerReward)})</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <p>
                          <strong className="text-gray-900">They receive a bonus</strong> on their first purchase
                          {referralSettings.refereeReward && (
                            <span className="text-green-600 font-semibold"> ({formatRefereeRewardForShare(referralSettings.refereeReward)})</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <p>
                          <strong className="text-gray-900">Share your unique code</strong> to start earning rewards!
                        </p>
                      </div>
                      {referralSettings.description && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-blue-700 italic text-sm">{referralSettings.description}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {referralSettings.isActive && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onShareReferralCode}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Gift className="h-4 w-4" />
                Share Code
              </button>
              <button
                onClick={onCopyReferralCode}
                className="flex-1 border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium cursor-pointer flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" />
                Copy Code
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
