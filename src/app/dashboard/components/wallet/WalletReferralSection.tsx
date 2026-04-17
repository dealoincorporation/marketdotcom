"use client"

import { Gift, Users, Tag } from "lucide-react"
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
    <div className="relative overflow-hidden glass-effect border border-white/60 rounded-[3rem] premium-shadow bg-white/40 backdrop-blur-3xl p-10 sm:p-14">
      {/* Decorative Gradient Blob */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-blue-500/20">
            <Users className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase mb-4">Network Growth Program</h3>
          <p className="text-gray-500 font-bold max-w-2xl leading-relaxed text-lg">
            Expand the community and unlock exclusive rewards. Your network is your net worth.
          </p>
        </div>

        {/* Prominent Reward Banner */}
        {!referralSettingsLoading && referralSettings.isActive && (
          <div className="mb-12 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <div className="relative p-8 sm:p-10 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl text-white shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Gift className="h-32 w-32" />
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="text-center sm:text-left">
                  <h4 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                    Earn {formatRefereeRewardForShare(referralSettings.referrerReward)} per referral
                  </h4>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                    Friends receive {formatRefereeRewardForShare(referralSettings.refereeReward)} on their first acquisition
                  </p>
                </div>
                <div className="shrink-0">
                  <div className="bg-orange-600 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-600/30">
                    Active Offer
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {[
            { label: 'Total Referrals', value: referralData.totalReferrals, color: 'text-blue-600', icon: Users },
            { label: 'Successful', value: referralData.successfulReferrals, color: 'text-green-600', icon: Gift },
            { label: 'Total Earned', value: formatPrice(referralData.totalEarned), color: 'text-orange-600', icon: Tag },
          ].map((stat, i) => (
            <div key={i} className="bg-white/40 border border-white/60 p-6 rounded-3xl text-center premium-shadow-sm group hover:bg-white/60 transition-all duration-300">
              <div className={`text-2xl sm:text-3xl font-black ${stat.color} mb-1 tracking-tighter`}>
                {referralLoading ? "..." : stat.value}
              </div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}

          <div className="col-span-2 md:col-span-1 border-2 border-dashed border-blue-500/30 p-6 rounded-3xl text-center group hover:border-blue-500/60 transition-all duration-300">
            <div className={`text-base sm:text-lg font-black tracking-widest uppercase mb-1 ${referralSettings.isActive ? "text-gray-900" : "text-gray-400 opacity-50"}`}>
              {referralLoading ? "..." : (referralSettings.isActive ? (referralData.code || fallbackReferralCode || "...") : "PAUSED")}
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {referralSettings.isActive ? "Access Key" : "No Access"}
            </div>
          </div>
        </div>

        {/* Guidelines Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="bg-white/40 border border-white/60 p-8 sm:p-10 rounded-[2.5rem] premium-shadow-sm">
            <h4 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-8 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              Program Guidelines
            </h4>

            <div className="space-y-6">
              {referralSettingsLoading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="bg-gray-200 h-4 w-full rounded"></div>
                </div>
              ) : !referralSettings.isActive ? (
                <p className="text-gray-400 font-bold italic">The growth program is currently undergoing maintenance.</p>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <span className="font-black text-blue-600">01</span>
                    </div>
                    <div>
                      <h5 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-1">Invite Network</h5>
                      <p className="text-gray-500 text-sm font-bold">Share your unique access key with partners and friends.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <span className="font-black text-green-600">02</span>
                    </div>
                    <div>
                      <h5 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-1">Qualify Activity</h5>
                      <p className="text-gray-500 text-sm font-bold">Rewards are unlocked upon their first successful transaction.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <span className="font-black text-orange-600">03</span>
                    </div>
                    <div>
                      <h5 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-1">Capture Value</h5>
                      <p className="text-gray-500 text-sm font-bold">Referral bonuses are instantly credited to your main balance.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            {referralSettings.isActive && (
              <>
                <button
                  onClick={onShareReferralCode}
                  className="group relative w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
                  <Gift className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Broadcast Key</span>
                </button>
                <button
                  onClick={onCopyReferralCode}
                  className="w-full h-16 bg-white/60 hover:bg-white text-blue-600 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 border border-blue-600/20 active:scale-95 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                >
                  <Users className="h-5 w-5" />
                  Copy to Clipboard
                </button>
              </>
            )}
            {referralSettings.description && (
              <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mt-2">
                <p className="text-blue-800/70 font-bold italic text-sm leading-relaxed text-center">
                  "{referralSettings.description}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
