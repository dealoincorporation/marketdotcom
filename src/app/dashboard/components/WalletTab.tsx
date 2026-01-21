"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Wallet,
  DollarSign,
  Gift,
  Trophy,
  TrendingUp,
  CreditCard,
  History,
  Star,
  Users,
  Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface WalletInfo {
  walletBalance: number
  points: number
  referralCode: string
  referralCount: number
}

interface WalletTabProps {
  walletInfo: WalletInfo
}

export default function WalletTab({ walletInfo }: WalletTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`
  }

  const [showFundModal, setShowFundModal] = useState(false)
  const [fundingAmount, setFundingAmount] = useState("")
  const [fundingMethod, setFundingMethod] = useState("card")
  const [isFunding, setIsFunding] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [pointsToConvert, setPointsToConvert] = useState("")

  // Referral settings state
  const [referralSettings, setReferralSettings] = useState({
    referrerReward: 0,
    refereeReward: 0,
    isActive: true,
    description: ""
  })
  const [referralSettingsLoading, setReferralSettingsLoading] = useState(true)

  // Rewards state
  const [rewardsData, setRewardsData] = useState({
    totalPoints: 0,
    tier: 1,
    tierName: 'Bronze',
    pointsToNextTier: 1000,
    rewards: [],
    pointsSettings: {
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
    const reference = searchParams.get('reference')
    if (reference && reference.startsWith('txn_')) {
      // This is a wallet funding payment reference
      verifyWalletFunding(reference)
    }
  }, [searchParams])

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
          setReferralSettings(settings)
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

      if (response.ok && data.success) {
        if (data.status === 'COMPLETED') {
          alert(`Wallet funded successfully! ₦${data.amount.toLocaleString()} has been added to your balance.`)
        } else {
          alert("Payment verification failed. Please contact support if you were charged.")
        }
        // Clean up URL
        router.replace('/dashboard?tab=wallet', { scroll: false })
        // Refresh the page to update wallet balance
        window.location.reload()
      } else {
        alert("Failed to verify payment. Please contact support.")
      }
    } catch (error) {
      console.error('Error verifying wallet funding:', error)
      alert("Failed to verify payment. Please contact support.")
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
          method: fundingMethod
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet & Points</h1>
        <p className="text-gray-600">Manage your balance, earn points, and track your rewards</p>
      </div>

      {/* Wallet Balance & Points Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="h-full">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Wallet className="h-6 w-6" />
                <span>Wallet Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="text-3xl font-bold text-green-900 mb-2">
                {formatPrice(walletInfo.walletBalance)}
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  Active Wallet
                </Badge>
                <span className="text-green-700 text-sm">
                  Available for purchases
                </span>
              </div>

              {/* Usage visualization - similar to rewards progress bar */}
              <div className="w-full bg-green-200 rounded-full h-2 mb-6">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((walletInfo.walletBalance / 50000) * 100, 100)}%` }}
                ></div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setShowFundModal(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Money</span>
                </button>
                <p className="text-xs text-green-600 text-center">
                  Secure • Fast • Reliable
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="h-full">
          <Card className="bg-gradient-to-br from-orange-50 to-red-100 border-orange-200 shadow-lg h-full">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Star className="h-6 w-6" />
                <span>Reward Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="text-3xl font-bold text-orange-900 mb-2">
                {rewardsLoading ? "..." : rewardsData.totalPoints.toLocaleString() + " pts"}
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                  {tierName} Tier
                </Badge>
                <span className="text-orange-700 text-sm">
                  {pointsToNextTier} pts to next tier
                </span>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2 mb-6">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((rewardsData.totalPoints % 1000) / 1000) * 100}%` }}
                ></div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setShowConvertModal(true)}
                  disabled={rewardsData.totalPoints < pointsSettings.minimumPointsToConvert}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Convert to Cash
                </button>
                <p className="text-xs text-orange-600 text-center">
                  Min: {pointsSettings.minimumPointsToConvert} pts • Rate: {pointsSettings.nairaPerPoint} pts = ₦1
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Referral Program */}
      <div>
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Referral Program</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                  <div className="text-sm md:text-lg font-mono bg-gray-100 px-2 md:px-3 py-2 rounded-md mb-2 break-all">
                    {referralLoading ? "..." : (referralData.code || walletInfo.referralCode || "...")}
                  </div>
                  <div className="text-gray-600 text-xs md:text-sm">Your Code</div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Gift className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">How Referral Program Works</h4>
                      <div className="text-blue-800 text-sm space-y-2">
                        {referralSettingsLoading ? (
                          <p>Loading referral details...</p>
                        ) : (
                          <>
                            <p><strong>You earn rewards</strong> when someone signs up using your referral code</p>
                            <p><strong>They receive a bonus</strong> on their first purchase</p>
                            <p>Share your unique code to start earning rewards!</p>
                            {referralSettings.description && (
                              <p className="text-blue-700 italic mt-2">{referralSettings.description}</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer">
                    Share Code
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(referralData.code || walletInfo.referralCode || '')}
                    className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium cursor-pointer"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Recent Transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Transactions</h3>
                <p className="text-gray-600 text-sm">Your transaction history will appear here once you make purchases or receive payments.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'credit'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : ''}{formatPrice(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <button className="text-orange-600 hover:text-orange-700 font-medium text-sm cursor-pointer">
                    View All Transactions →
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Wallet className="h-6 w-6 text-green-600" />
                  <span>Fund Your Wallet</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount (₦)
                  </label>
                  <input
                    type="number"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="100"
                    step="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500">Minimum amount: ₦100</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="card"
                        checked={fundingMethod === "card"}
                        onChange={(e) => setFundingMethod(e.target.value)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Credit/Debit Card</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="bank"
                        checked={fundingMethod === "bank"}
                        onChange={(e) => setFundingMethod(e.target.value)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Bank Transfer</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="mobile"
                        checked={fundingMethod === "mobile"}
                        onChange={(e) => setFundingMethod(e.target.value)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Mobile Money</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">Wallet Balance</span>
                  </div>
                  <p className="text-blue-700 text-sm mt-1">
                    Current: {formatPrice(walletInfo.walletBalance)}
                  </p>
                  {fundingAmount && (
                    <p className="text-blue-700 text-sm">
                      After funding: {formatPrice(walletInfo.walletBalance + parseFloat(fundingAmount || "0"))}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFundModal(false)
                      setFundingAmount("")
                    }}
                    disabled={isFunding}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleFundWallet}
                    disabled={!fundingAmount || parseFloat(fundingAmount) < 100 || isFunding}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isFunding ? "Processing..." : `Fund Wallet ${fundingAmount ? formatPrice(parseFloat(fundingAmount)) : ""}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Points Conversion Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl bg-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center space-x-2">
                  <Star className="h-6 w-6 text-orange-600" />
                  <span>Convert Points to Cash</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-orange-800 font-medium">Your Points</span>
                    <span className="text-orange-900 font-bold">{rewardsData.totalPoints.toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-800 font-medium">Conversion Rate</span>
                    <span className="text-orange-900">{pointsSettings.nairaPerPoint} pts = ₦1</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Points to Convert
                  </label>
                  <input
                    type="number"
                    value={pointsToConvert}
                    onChange={(e) => setPointsToConvert(e.target.value)}
                    placeholder="Enter points amount"
                    min={pointsSettings.minimumPointsToConvert}
                    max={convertiblePoints}
                    step={pointsSettings.nairaPerPoint}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-xs text-gray-500">
                    Minimum: {pointsSettings.minimumPointsToConvert} pts • Maximum: {convertiblePoints} pts • Available: {rewardsData.totalPoints} pts
                  </p>
                </div>

                {pointsToConvert && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800 font-medium">You will receive</span>
                      <span className="text-green-900 font-bold text-lg">
                        ₦{Math.floor(parseInt(pointsToConvert || "0") / pointsSettings.nairaPerPoint)}
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Points will be credited to your wallet after 24-48 hours
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConvertModal(false)
                      setPointsToConvert("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Handle conversion
                      alert("Points conversion request submitted! Funds will be credited within 24-48 hours.")
                      setShowConvertModal(false)
                      setPointsToConvert("")
                    }}
                    disabled={!pointsToConvert || parseInt(pointsToConvert) < pointsSettings.minimumPointsToConvert}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Convert Points
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}