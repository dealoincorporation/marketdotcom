"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Gift,
  DollarSign,
  Search,
  Download,
  UserCheck,
  Settings,
  Save
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { formatCurrency } from "@/lib/helpers/index"
import toast from "react-hot-toast"

interface ReferredUser {
  id: string
  name: string | null
  email: string
  phone: string | null
  referralCode: string
  createdAt: string
  emailVerified: string | null
  walletBalance: number
  referrer: {
    id: string
    name: string | null
    email: string
    referralCode: string
  } | null
  referralRecord: {
    id: string
    code: string
    isUsed: boolean
    usedAt: string | null
    rewardAmount: number | null
    referredEmail: string
  } | null
}

export default function ManageReferralsTab() {
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ReferredUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()

  // Referral settings state
  const [referralSettings, setReferralSettings] = useState({
    referrerReward: "100",
    refereeReward: "50",
    isActive: true,
    description: "",
    referrerPointsOnSignup: 0,
    referrerPointsPerPurchase: 0
  })
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    fetchReferredUsers()
    fetchReferralSettings()
  }, [])

  const fetchReferralSettings = async () => {
    try {
      setSettingsLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/referrals/settings', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      if (response.ok) {
        const settings = await response.json()
        setReferralSettings({
          referrerReward: settings.referrerReward || 100,
          refereeReward: settings.refereeReward || 500,
          isActive: settings.isActive !== undefined ? settings.isActive : true,
          description: settings.description || "",
          referrerPointsOnSignup: settings.referrerPointsOnSignup ?? 0,
          referrerPointsPerPurchase: settings.referrerPointsPerPurchase ?? 0
        })
      }
    } catch (error) {
      console.error('Error fetching referral settings:', error)
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/referrals/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(referralSettings)
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setReferralSettings(updatedSettings)
        toast.success('Referral settings updated successfully!')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update referral settings')
      }
    } catch (error) {
      console.error('Error saving referral settings:', error)
      toast.error('Error updating referral settings')
    } finally {
      setSavingSettings(false)
    }
  }

  useEffect(() => {
    // Filter users based on search query
    if (!searchQuery.trim()) {
      setFilteredUsers(referredUsers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = referredUsers.filter(user =>
        user.name?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.referrer?.name?.toLowerCase().includes(query) ||
        user.referrer?.email.toLowerCase().includes(query) ||
        user.referralCode.toLowerCase().includes(query)
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, referredUsers])

  const referralAnalytics = useMemo(() => {
    const total = referredUsers.length
    const verified = referredUsers.filter((u) => Boolean(u.emailVerified)).length
    const rewarded = referredUsers.filter((u) => (u.referralRecord?.rewardAmount || 0) > 0).length
    const totalRewards = referredUsers.reduce((sum, u) => sum + (u.referralRecord?.rewardAmount || 0), 0)
    const conversionRate = total > 0 ? Math.round((verified / total) * 100) : 0
    const rewardRate = total > 0 ? Math.round((rewarded / total) * 100) : 0
    return {
      total,
      verified,
      rewarded,
      totalRewards,
      conversionRate,
      rewardRate,
    }
  }, [referredUsers])

  const topReferrers = useMemo(() => {
    const byReferrer = new Map<
      string,
      {
        id: string
        name: string
        email: string
        referralCode: string
        total: number
        verified: number
        rewardAmount: number
      }
    >()

    referredUsers.forEach((user) => {
      if (!user.referrer) return
      const key = user.referrer.id
      const current = byReferrer.get(key) || {
        id: user.referrer.id,
        name: user.referrer.name || "No name",
        email: user.referrer.email,
        referralCode: user.referrer.referralCode,
        total: 0,
        verified: 0,
        rewardAmount: 0,
      }
      current.total += 1
      if (user.emailVerified) current.verified += 1
      current.rewardAmount += user.referralRecord?.rewardAmount || 0
      byReferrer.set(key, current)
    })

    return Array.from(byReferrer.values())
      .sort((a, b) => b.total - a.total || b.rewardAmount - a.rewardAmount)
      .slice(0, 6)
  }, [referredUsers])

  const recentReferralSignups = useMemo(() => {
    return [...referredUsers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
  }, [referredUsers])

  const fetchReferredUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch('/api/admin/referrals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch referred users")
      }

      const data = await response.json()
      setReferredUsers(data.data || [])
      setFilteredUsers(data.data || [])
    } catch (error) {
      console.error("Error fetching referred users:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Referral Code', 'Signup Date', 'Email Verified', 'Wallet Balance', 'Referrer Name', 'Referrer Email', 'Referrer Code', 'Reward Amount']
    const rows = filteredUsers.map(user => [
      user.name || 'N/A',
      user.email,
      user.phone || 'N/A',
      user.referralCode,
      formatDate(user.createdAt),
      user.emailVerified ? 'Yes' : 'No',
      formatCurrency(user.walletBalance),
      user.referrer?.name || 'N/A',
      user.referrer?.email || 'N/A',
      user.referrer?.referralCode || 'N/A',
      user.referralRecord?.rewardAmount ? formatCurrency(user.referralRecord.rewardAmount) : 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `referred-users-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading referred users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-2">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase tracking-[0.1em]">Invite & Earn</h2>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Grow your community and reward your most active members</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={exportToCSV}
            className="bg-gray-900 border border-white/20 text-white font-black text-[12px] uppercase tracking-[0.2em] px-6 py-6 rounded-2xl shadow-2xl hover:bg-black hover:scale-[1.05] active:scale-[0.95] transition-all group"
          >
            <Download className="h-4 w-4 mr-2 group-hover:-translate-y-1 transition-transform" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Referral Settings Card */}
      <Card className="glass-effect border-white/70 rounded-[2rem] premium-shadow overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500/5 to-red-500/5 border-b border-white/50 p-8">
          <CardTitle className="flex items-center gap-3 text-gray-900 text-xl font-black uppercase tracking-widest">
            <Settings className="h-6 w-6 text-orange-600" />
            <span>Community Incentives</span>
          </CardTitle>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Fine-tune the rewards for your growing network</p>
        </CardHeader>
        <CardContent className="p-8">
          {settingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Inviter Credit
                  </label>
                  <Input
                    type="text"
                    value={referralSettings.referrerReward}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      referrerReward: e.target.value
                    })}
                    placeholder="e.g. 100"
                    className="h-14 text-lg font-black bg-white/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20"
                  />
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                    What the inviter earns when a friend signs up.
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    New Member Bonus
                  </label>
                  <Input
                    type="text"
                    value={referralSettings.refereeReward}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      refereeReward: e.target.value
                    })}
                    placeholder="e.g. 50"
                    className="h-14 text-lg font-black bg-white/50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500/20"
                  />
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                    Welcome gift for the newly joined member.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Signup Points
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={referralSettings.referrerPointsOnSignup}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      referrerPointsOnSignup: Math.max(0, parseInt(e.target.value, 10) || 0)
                    })}
                    className="h-12 bg-white/50 border-gray-100 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Purchase Points
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={referralSettings.referrerPointsPerPurchase}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      referrerPointsPerPurchase: Math.max(0, parseInt(e.target.value, 10) || 0)
                    })}
                    className="h-12 bg-white/50 border-gray-100 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={referralSettings.isActive}
                  onChange={(e) => setReferralSettings({
                    ...referralSettings,
                    isActive: e.target.checked
                  })}
                  className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded-lg cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-black text-gray-700 uppercase tracking-widest cursor-pointer">
                  Activate Community Program
                </label>
              </div>

              <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-black text-[12px] uppercase tracking-[0.2em] px-10 py-7 rounded-[1.5rem] shadow-xl hover:shadow-orange-500/20 transition-all flex items-center gap-3"
                >
                  <Save className="h-5 w-5" />
                  {savingSettings ? 'Securing Changes...' : 'Push Settings Live'}
                </Button>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">
                  * Changes are deployed to all dashboards instantly
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="glass-effect border-white/70 rounded-[1.5rem] premium-shadow h-28 flex flex-col justify-center">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Network Size</p>
                  <p className="text-2xl font-black text-gray-900 tabular-nums">{referredUsers.length}</p>
                </div>
                <Users className="h-6 w-6 text-gray-900 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="glass-effect border-white/70 rounded-[1.5rem] premium-shadow h-28 flex flex-col justify-center">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">Verified Growth</p>
                  <p className="text-2xl font-black text-green-600 tabular-nums">
                    {referredUsers.filter(u => u.emailVerified).length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="glass-effect border-white/70 rounded-[1.5rem] premium-shadow h-28 flex flex-col justify-center">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Rewards</p>
                  <p className="text-xl font-black text-blue-900 tabular-nums">
                    {formatCurrency(
                      referredUsers.reduce((sum, u) =>
                        sum + (u.referralRecord?.rewardAmount || 0), 0
                      )
                    )}
                  </p>
                </div>
                <DollarSign className="h-6 w-6 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="glass-effect border-white/70 rounded-[1.5rem] premium-shadow h-28 flex flex-col justify-center bg-gray-900">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Fresh Faces</p>
                  <p className="text-2xl font-black text-white tabular-nums">
                    {referredUsers.filter(u => {
                      const date = new Date(u.createdAt)
                      const now = new Date()
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                    }).length}
                  </p>
                </div>
                <Calendar className="h-6 w-6 text-white opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referral Operations Hub */}
      <Card className="glass-effect border-white/70 rounded-[2rem] premium-shadow overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-b border-white/50 p-8">
          <CardTitle className="flex items-center gap-3 text-gray-900 text-xl font-black uppercase tracking-widest">
            <UserCheck className="h-6 w-6 text-purple-600" />
            <span>Referral Operations Hub</span>
          </CardTitle>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">
            All referral performance and activity in one place
          </p>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white/70 p-6 space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Program Health</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wide">Verification Rate</span>
                  <span className="text-sm font-black text-emerald-600 tabular-nums">{referralAnalytics.conversionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wide">Reward Activation</span>
                  <span className="text-sm font-black text-blue-600 tabular-nums">{referralAnalytics.rewardRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-wide">Total Payout</span>
                  <span className="text-sm font-black text-orange-600 tabular-nums">{formatCurrency(referralAnalytics.totalRewards)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/70 p-6 space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Referrers</p>
              {topReferrers.length === 0 ? (
                <p className="text-xs font-bold text-gray-400">No referral referrers recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {topReferrers.slice(0, 4).map((referrer) => (
                    <div key={referrer.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/80 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 truncate">{referrer.name}</p>
                        <p className="text-[10px] font-bold text-gray-500 truncate">{referrer.email}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black tabular-nums">
                        {referrer.total}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/70 p-6 space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Referral Signups</p>
              {recentReferralSignups.length === 0 ? (
                <p className="text-xs font-bold text-gray-400">No referral signups yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentReferralSignups.slice(0, 4).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50/80 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 truncate">{entry.name || "No name"}</p>
                        <p className="text-[10px] font-bold text-gray-500 truncate">{entry.referrer?.name || "No referrer"}</p>
                      </div>
                      <Badge className={entry.emailVerified ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}>
                        {entry.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, phone, or referral code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Referred Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No referred users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Referrer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reward</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Signup Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                            <p className="text-sm text-gray-500">Code: {user.referralCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.referrer ? (
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">{user.referrer.name || 'No name'}</p>
                            <p className="text-xs text-gray-500">Invited by: {user.referrer.email}</p>
                            <Badge variant="outline" className="text-xs">
                              {user.referrer.referralCode}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1">
                          {user.emailVerified ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs mt-1">
                            Wallet: {formatCurrency(user.walletBalance)}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {user.referralRecord?.rewardAmount ? (
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(user.referralRecord.rewardAmount)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
