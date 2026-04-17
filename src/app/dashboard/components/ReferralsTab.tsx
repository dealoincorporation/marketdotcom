"use client"

import { useEffect, useState } from "react"
import { WalletReferralSection } from "./wallet/WalletReferralSection"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import toast from "react-hot-toast"

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

interface ReferralsTabProps {
  fallbackReferralCode: string
  onGoToWallet: () => void
}

export default function ReferralsTab({ fallbackReferralCode, onGoToWallet }: ReferralsTabProps) {
  const [referralSettings, setReferralSettings] = useState<ReferralSettings>({
    referrerReward: 0,
    refereeReward: 0,
    isActive: true,
    description: "",
  })
  const [referralSettingsLoading, setReferralSettingsLoading] = useState(true)

  const [referralData, setReferralData] = useState<ReferralData>({
    code: fallbackReferralCode || "",
    totalReferrals: 0,
    successfulReferrals: 0,
    totalEarned: 0,
  })
  const [referralLoading, setReferralLoading] = useState(true)

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`

  const formatRefereeRewardForShare = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return "a bonus"
    const s = String(value).trim()
    if (!s) return "a bonus"
    const num = parseFloat(s.replace(/,/g, ""))
    if (!Number.isNaN(num) && /^[\d,.]+$/.test(s)) {
      return `₦${num.toLocaleString()}`
    }
    return s
  }

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/referrals", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (response.ok) {
          const data = await response.json()
          setReferralData(data)
        }
      } catch (error) {
        console.error("Error fetching referral data:", error)
      } finally {
        setReferralLoading(false)
      }
    }

    const fetchReferralSettings = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/referrals/settings", {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })

        if (response.ok) {
          const settings = await response.json()
          setReferralSettings({
            referrerReward: settings.referrerReward?.toString() || "100",
            refereeReward: settings.refereeReward?.toString() || "500",
            isActive: settings.isActive !== undefined ? settings.isActive : true,
            description: settings.description || "",
          })
        }
      } catch (error) {
        console.error("Error fetching referral settings:", error)
      } finally {
        setReferralSettingsLoading(false)
      }
    }

    fetchReferralData()
    fetchReferralSettings()
  }, [])

  const handleCopyReferralCode = async () => {
    const code = referralData.code || fallbackReferralCode || ""
    if (!code) {
      toast.error("Referral code not available")
      return
    }
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Referral code copied!", { icon: "📋" })
    } catch {
      toast.error("Failed to copy referral code")
    }
  }

  const handleShareReferralCode = async () => {
    const code = referralData.code || fallbackReferralCode || ""
    if (!code) {
      toast.error("Referral code not available")
      return
    }
    const refereeRewardText = formatRefereeRewardForShare(referralSettings.refereeReward)
    const shareText = `Join me on Marketdotcom! Use my referral code ${code} to get ${refereeRewardText} on your first purchase.`
    const shareUrl = typeof window !== "undefined" ? window.location.origin : ""
    const fullMessage = `${shareText}\n\nSign up at: ${shareUrl}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join Marketdotcom with my referral code!",
          text: shareText,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(fullMessage)
        toast.success("Referral message copied!", { icon: "📋" })
      }
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        toast.error("Failed to share referral code")
      }
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Referrals</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Share your code and grow your network</p>
        </div>
        <Button
          onClick={onGoToWallet}
          className="h-11 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 w-full sm:w-auto lg:min-w-[170px] lg:justify-center"
        >
          <Wallet className="h-4 w-4" />
          Open Wallet
        </Button>
      </div>

      <WalletReferralSection
        referralSettings={referralSettings}
        referralSettingsLoading={referralSettingsLoading}
        referralData={referralData}
        referralLoading={referralLoading}
        fallbackReferralCode={fallbackReferralCode}
        formatPrice={formatPrice}
        formatRefereeRewardForShare={formatRefereeRewardForShare}
        onShareReferralCode={handleShareReferralCode}
        onCopyReferralCode={handleCopyReferralCode}
      />
    </div>
  )
}
