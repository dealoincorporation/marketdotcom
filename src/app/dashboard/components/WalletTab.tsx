"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Wallet,
  Star,
  Plus,
  Tag
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"
import { FundWalletModal } from "./wallet/FundWalletModal"
import { PointsConversionModal } from "./wallet/PointsConversionModal"
import { WalletTransactionHistory } from "./wallet/WalletTransactionHistory"
import { WalletReferralSection } from "./wallet/WalletReferralSection"

interface WalletInfo {
  walletBalance: number
  points: number
  referralCode: string
  referralCount: number
}

interface WalletTabProps {
  walletInfo: WalletInfo
  onTabChange?: (tab: any) => void
}

export default function WalletTab({ walletInfo, onTabChange }: WalletTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`
  }

  /** Format referee reward for share message: numeric values show as ₦500, not "500" */
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

  const [showFundModal, setShowFundModal] = useState(false)
  const [fundingAmount, setFundingAmount] = useState("")
  const [isFunding, setIsFunding] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [pointsToConvert, setPointsToConvert] = useState("")
  const [isConverting, setIsConverting] = useState(false)

  // Referral settings state
  const [referralSettings, setReferralSettings] = useState({
    referrerReward: 0,
    refereeReward: 0,
    isActive: true,
    description: ""
  })
  const [referralSettingsLoading, setReferralSettingsLoading] = useState(true)

  // Rewards state (patronage rule from admin; user sees live settings)
  const [rewardsData, setRewardsData] = useState({
    totalPoints: 0,
    tier: 1,
    tierName: 'Bronze',
    pointsToNextTier: 1000,
    rewards: [],
    pointsSettings: {
      amountThreshold: 50000,
      periodDays: 30,
      pointsPerThreshold: 1,
      pointsPerNaira: 0.1,
      nairaPerPoint: 10,
      minimumPointsToConvert: 100
    }
  })
  const [rewardsLoading, setRewardsLoading] = useState(true)

  // Referral data state
  const [referralData, setReferralData] = useState({
    code: walletInfo.referralCode || "",
    totalReferrals: 0,
    successfulReferrals: 0,
    totalEarned: 0
  })
  const [referralLoading, setReferralLoading] = useState(true)

  // Transactions state
  const [recentTransactions, setRecentTransactions] = useState<{
    id: string;
    type: string;
    amount: number;
    description: string;
    status?: string;
    reference?: string;
    date: string;
  }[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)

  // Use real points settings from API
  const pointsSettings = rewardsData.pointsSettings

  const maxConvertibleAmount = Math.floor(rewardsData.totalPoints / pointsSettings.nairaPerPoint) * pointsSettings.nairaPerPoint
  const convertiblePoints = Math.min(rewardsData.totalPoints, maxConvertibleAmount)
  const cashValue = Math.floor(convertiblePoints / pointsSettings.nairaPerPoint) * pointsSettings.nairaPerPoint

  // Check for payment verification on component mount
  useEffect(() => {
    const tab = searchParams.get('tab')
    const referenceFromUrl = searchParams.get('reference')
    const referenceFromStorage = typeof window !== 'undefined'
      ? window.localStorage.getItem('last_wallet_funding_reference')
      : null
    const reference = referenceFromUrl || referenceFromStorage

    // Only verify if we have a reference and haven't already processed it
    if (tab === 'wallet' && reference) {
      // Check if we've already processed this reference (prevent infinite loop)
      const processedKey = `wallet_funding_processed_${reference}`
      const alreadyProcessed = typeof window !== 'undefined'
        ? sessionStorage.getItem(processedKey)
        : null

      if (!alreadyProcessed) {
        // Mark as processing immediately to prevent duplicate calls
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(processedKey, 'true')
        }
        // Clean up URL reference immediately to prevent re-triggering
        if (referenceFromUrl) {
          router.replace('/dashboard?tab=wallet', { scroll: false })
        }
        // Wallet funding callback from Paystack (card/bank transfer/mobile)
        verifyWalletFunding(reference)
      } else {
        // Already processed, clean up URL and storage to prevent future triggers
        if (referenceFromUrl) {
          router.replace('/dashboard?tab=wallet', { scroll: false })
        }
        if (referenceFromStorage) {
          try {
            window.localStorage.removeItem('last_wallet_funding_reference')
          } catch { }
        }
      }
    } else if (tab === 'wallet' && !reference) {
      // No reference, but we're on wallet tab - clean up any stale references
      try {
        window.localStorage.removeItem('last_wallet_funding_reference')
      } catch { }
    }
  }, [searchParams, router])

  // Fetch referral data
  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/referrals', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })

        if (response.ok) {
          const data = await response.json()
          setReferralData(data)
        } else {
          // If API fails, use walletInfo referral code as fallback
          if (walletInfo.referralCode) {
            setReferralData({
              code: walletInfo.referralCode,
              totalReferrals: 0,
              successfulReferrals: 0,
              totalEarned: 0
            })
          }
        }
      } catch (error) {
        console.error('Error fetching referral data:', error)
        // Use walletInfo referral code as fallback on error
        if (walletInfo.referralCode) {
          setReferralData({
            code: walletInfo.referralCode,
            totalReferrals: 0,
            successfulReferrals: 0,
            totalEarned: 0
          })
        }
      } finally {
        setReferralLoading(false)
      }
    }

    fetchReferralData()
  }, [walletInfo.referralCode])

  // Fetch referral settings
  useEffect(() => {
    const fetchReferralSettingsData = async () => {
      try {
        setReferralSettingsLoading(true)
        const token = localStorage.getItem('token')
        const response = await fetch('/api/referrals/settings', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })

        if (response.ok) {
          const settings = await response.json()
          setReferralSettings({
            referrerReward: settings.referrerReward?.toString() || "100",
            refereeReward: settings.refereeReward?.toString() || "500",
            isActive: settings.isActive !== undefined ? settings.isActive : true,
            description: settings.description || ""
          })
        }
      } catch (error) {
        console.error('Error fetching referral settings:', error)
        // Keep default values if fetch fails
      } finally {
        setReferralSettingsLoading(false)
      }
    }

    fetchReferralSettingsData()
  }, [])

  // Fetch rewards data
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/rewards', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })

        if (response.ok) {
          const data = await response.json()
          setRewardsData(data)
        }
      } catch (error) {
        console.error('Error fetching rewards:', error)
        // Keep default values on error
      } finally {
        setRewardsLoading(false)
      }
    }

    fetchRewards()
  }, [])

  const refetchRewards = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/rewards', {
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      })
      if (response.ok) {
        const data = await response.json()
        setRewardsData(data)
      }
    } catch (e) {
      console.error('Error refetching rewards:', e)
    }
  }

  const handleConvertPoints = async () => {
    const pts = parseInt(pointsToConvert, 10)
    if (!Number.isFinite(pts) || pts < pointsSettings.minimumPointsToConvert) return
    setIsConverting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ points: pts })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error || 'Conversion failed')
        return
      }
      toast.success(`₦${(data.amountCredited ?? 0).toLocaleString()} added to your wallet!`)
      setShowConvertModal(false)
      setPointsToConvert('')
      await refetchRewards()
      window.dispatchEvent(new CustomEvent('refreshNotifications'))
      window.location.reload()
    } catch (e) {
      console.error('Convert points error:', e)
      toast.error('Failed to convert points')
    } finally {
      setIsConverting(false)
    }
  }

  // Fetch recent transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/wallet/transactions', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        })

        if (response.ok) {
          const data = await response.json()
          setRecentTransactions(data.transactions || [])
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
        setRecentTransactions([])
      } finally {
        setTransactionsLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  // Copy referral code handler
  const handleCopyReferralCode = async () => {
    const code = referralData.code || walletInfo.referralCode || ''

    if (!code) {
      toast.error('Referral code not available')
      return
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code)
        toast.success('Referral code copied to clipboard!', {
          icon: '📋',
          duration: 3000,
        })
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = code
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        toast.success('Referral code copied to clipboard!', {
          icon: '📋',
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Failed to copy referral code:', error)
      toast.error('Failed to copy referral code. Please try again.', {
        icon: '❌',
        duration: 3000,
      })
    }
  }

  // Share referral code handler
  const handleShareReferralCode = async () => {
    const code = referralData.code || walletInfo.referralCode || ''

    if (!code) {
      toast.error('Referral code not available')
      return
    }

    const refereeRewardText = formatRefereeRewardForShare(referralSettings.refereeReward)
    const shareText = `Join me on Marketdotcom! Use my referral code ${code} to get ${refereeRewardText} on your first purchase. Sign up now and start shopping!`
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''

    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: 'Join Marketdotcom with my referral code!',
          text: shareText,
          url: shareUrl,
        })
        toast.success('Referral code shared!', {
          icon: '📤',
          duration: 3000,
        })
      } else {
        // Fallback to copying the referral code with message
        const fullMessage = `${shareText}\n\nSign up at: ${shareUrl}`

        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(fullMessage)
          toast.success('Referral message copied to clipboard!', {
            icon: '📋',
            duration: 3000,
          })
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea')
          textArea.value = fullMessage
          textArea.style.position = 'fixed'
          textArea.style.opacity = '0'
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          toast.success('Referral message copied to clipboard!', {
            icon: '📋',
            duration: 3000,
          })
        }
      }
    } catch (error: any) {
      // User cancelled share or error occurred
      if (error.name !== 'AbortError') {
        console.error('Failed to share referral code:', error)
        // Fallback to copy on error
        try {
          const fullMessage = `${shareText}\n\nSign up at: ${shareUrl}`
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(fullMessage)
            toast.success('Referral message copied to clipboard!', {
              icon: '📋',
              duration: 3000,
            })
          }
        } catch (copyError) {
          toast.error('Failed to share referral code. Please try copying instead.', {
            icon: '❌',
            duration: 3000,
          })
        }
      }
    }
  }

  const verifyWalletFunding = async (reference: string) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token')

      const response = await fetch('/api/wallet/fund/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reference }),
      })

      const data = await response.json()

      if (!response.ok || !data?.success) {
        toast.error(data?.error || "Failed to verify payment. Please contact support.")
        // Clean up on error to prevent retry loops
        try {
          window.localStorage.removeItem('last_wallet_funding_reference')
          sessionStorage.setItem(`wallet_funding_processed_${reference}`, 'true')
          router.replace('/dashboard?tab=wallet', { scroll: false })
        } catch { }
        return
      }

      if (data.status === 'COMPLETED') {
        // Check if this was already processed (idempotency check from API)
        if (data.message === 'Transaction already processed') {
          // Already processed, just clean up and refresh
          try {
            window.localStorage.removeItem('last_wallet_funding_reference')
            sessionStorage.setItem(`wallet_funding_processed_${reference}`, 'true')
            router.replace('/dashboard?tab=wallet', { scroll: false })
          } catch { }
          // Don't reload if already processed - just trigger notification refresh
          window.dispatchEvent(new CustomEvent('refreshNotifications'))
          return
        }

        toast.success(`Wallet funded successfully! ₦${Number(data.amount).toLocaleString()} added.`, { duration: 5000 })

        // Clean up ALL references immediately to prevent re-processing
        try {
          window.localStorage.removeItem('last_wallet_funding_reference')
          // Mark as processed in sessionStorage to prevent re-verification on reload
          sessionStorage.setItem(`wallet_funding_processed_${reference}`, 'true')
          // Also clean up URL immediately - wait for it to complete
          router.replace('/dashboard?tab=wallet', { scroll: false })
        } catch { }

        // Trigger notification refresh so the new wallet funding notification appears immediately
        window.dispatchEvent(new CustomEvent('refreshNotifications'))

        // Reload only once after ensuring URL is cleaned up
        // The sessionStorage check will prevent re-verification after reload
        setTimeout(() => {
          // Double-check URL is clean before reloading
          const currentUrl = new URL(window.location.href)
          if (!currentUrl.searchParams.get('reference')) {
            window.location.reload()
          } else {
            // URL still has reference, clean it up first
            router.replace('/dashboard?tab=wallet', { scroll: false })
            setTimeout(() => window.location.reload(), 200)
          }
        }, 800)
        return
      }

      if (data.status === 'PENDING') {
        // Common for bank transfers: Paystack may take time to confirm.
        toast(`Transfer pending confirmation. If you were debited, it will reflect shortly.`, {
          duration: 6000,
        })
        // Clean up URL but keep reference in storage for later verification
        try {
          router.replace('/dashboard?tab=wallet', { scroll: false })
        } catch { }
        return
      }

      toast.error("Payment failed or was cancelled. If you were debited, please contact support.", { duration: 7000 })
      // Clean up on failure
      try {
        window.localStorage.removeItem('last_wallet_funding_reference')
        sessionStorage.setItem(`wallet_funding_processed_${reference}`, 'true')
        router.replace('/dashboard?tab=wallet', { scroll: false })
      } catch { }
    } catch (error) {
      console.error('Error verifying wallet funding:', error)
      toast.error("Failed to verify payment. Please contact support.")
      // Clean up on error
      try {
        window.localStorage.removeItem('last_wallet_funding_reference')
        sessionStorage.setItem(`wallet_funding_processed_${reference}`, 'true')
        router.replace('/dashboard?tab=wallet', { scroll: false })
      } catch { }
    }
  }

  const handleFundWallet = async () => {
    if (!fundingAmount || parseFloat(fundingAmount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    setIsFunding(true)
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token')

      const response = await fetch('/api/wallet/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: parseFloat(fundingAmount),
          method: 'paystack'
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store reference as a fallback in case Paystack doesn't redirect back with query params
        try {
          window.localStorage.setItem('last_wallet_funding_reference', data.reference)
        } catch { }
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url
      } else {
        alert(data.error || "Failed to initialize payment")
      }
    } catch (error) {
      console.error('Error funding wallet:', error)
      alert("Failed to initialize payment. Please try again.")
    } finally {
      setIsFunding(false)
    }
  }

  // Use real tier data from API
  const { tier, tierName, pointsToNextTier } = rewardsData

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-12 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Wallet & Rewards</h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your wallet and reward points</p>
        </div>
        <div className="flex items-center gap-3 bg-white/85 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/70 premium-shadow">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-black text-gray-900 uppercase tracking-tight">Live updates</span>
        </div>
      </div>

      {/* Wallet Balance & Points Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative group perspective h-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
          <Card className="relative glass-effect border border-white/70 rounded-[2.5rem] premium-shadow h-full overflow-hidden bg-white/75 backdrop-blur-3xl p-8 sm:p-10 flex flex-col min-h-[300px]">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-green-600/20">
                  <Wallet className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Main Balance</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Balance</p>
                </div>
              </div>
              <div className="bg-green-100/50 px-4 py-2 rounded-xl border border-green-200">
                <span className="text-xs font-black text-green-700 uppercase tracking-wider">NGN</span>
              </div>
            </div>

            <div className="mb-8 relative z-10">
              <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">
                {formatPrice(walletInfo.walletBalance)}
              </span>
              <div className="flex items-center gap-2 mt-4">
                <Badge className="bg-green-500/10 text-green-600 border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  Verified Wallet
                </Badge>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-l border-gray-200 pl-3">
                  Instant Access
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8 relative z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((walletInfo.walletBalance / 50000) * 100, 100)}%` }}
                className="bg-green-500 h-1.5 rounded-full"
              />
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4 relative z-10">
              <button
                onClick={() => setShowFundModal(true)}
                className="flex-1 h-14 bg-gray-900 hover:bg-green-600 text-white rounded-[1.25rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-green-600/30 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Funds</span>
              </button>
            </div>
          </Card>
        </div>

        <div className="relative group perspective h-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
          <Card className="relative glass-effect border border-white/70 rounded-[2.5rem] premium-shadow h-full overflow-hidden bg-white/75 backdrop-blur-3xl p-8 sm:p-10 flex flex-col min-h-[300px]">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-orange-600/20">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Rewards Points</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Rewards Status</p>
                </div>
              </div>
              <div className="bg-orange-100/50 px-4 py-2 rounded-xl border border-orange-200">
                <span className="text-xs font-black text-orange-700 uppercase tracking-wider">PTS</span>
              </div>
            </div>

            <div className="mb-8 relative z-10">
              <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">
                {rewardsLoading ? "..." : rewardsData.totalPoints.toLocaleString()}
              </span>
              <div className="flex items-center gap-2 mt-4">
                <Badge className="bg-orange-500/10 text-orange-600 border-none px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {tierName} Tier
                </Badge>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-l border-gray-200 pl-3">
                  {pointsToNextTier} PTS to {tier === 3 ? 'Max' : 'Higher'} Tier
                </span>
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-8 relative z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((rewardsData.totalPoints % 1000) / 1000) * 100}%` }}
                className="bg-orange-500 h-1.5 rounded-full"
              />
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-4 relative z-10">
              <button
                onClick={() => setShowConvertModal(true)}
                disabled={rewardsLoading || rewardsData.totalPoints < pointsSettings.minimumPointsToConvert}
                className="flex-1 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-[1.25rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all duration-300 shadow-xl shadow-orange-600/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Tag className="h-4 w-4" />
                <span>Convert Points</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Referral Program */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-900 to-gray-800 rounded-[3rem] blur opacity-5" />
        <WalletReferralSection
          referralSettings={referralSettings}
          referralSettingsLoading={referralSettingsLoading}
          referralData={referralData}
          referralLoading={referralLoading}
          fallbackReferralCode={walletInfo.referralCode}
          formatPrice={formatPrice}
          formatRefereeRewardForShare={formatRefereeRewardForShare}
          onShareReferralCode={handleShareReferralCode}
          onCopyReferralCode={handleCopyReferralCode}
        />
      </div>

      {/* Recent Transactions */}
      <div className="relative">
        <WalletTransactionHistory
          transactions={recentTransactions}
          loading={transactionsLoading}
          formatPrice={formatPrice}
          onTabChange={onTabChange}
        />
      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <FundWalletModal
          walletBalance={walletInfo.walletBalance}
          fundingAmount={fundingAmount}
          isFunding={isFunding}
          onFundingAmountChange={setFundingAmount}
          onFund={handleFundWallet}
          onClose={() => { setShowFundModal(false); setFundingAmount("") }}
          formatPrice={formatPrice}
        />
      )}

      {/* Points Conversion Modal */}
      {showConvertModal && (
        <PointsConversionModal
          totalPoints={rewardsData.totalPoints}
          convertiblePoints={convertiblePoints}
          pointsToConvert={pointsToConvert}
          isConverting={isConverting}
          pointsSettings={pointsSettings}
          onPointsToConvertChange={setPointsToConvert}
          onConvert={handleConvertPoints}
          onClose={() => { setShowConvertModal(false); setPointsToConvert("") }}
        />
      )}
    </motion.div>
  )
}