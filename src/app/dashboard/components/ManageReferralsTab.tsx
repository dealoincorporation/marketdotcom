"use client"

import { useState, useEffect } from "react"
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
          refereeReward: settings.refereeReward || 50,
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Referrals</h2>
          <p className="text-gray-600 mt-1">View all users who signed up through referral codes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Referral Settings Card */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Settings className="h-5 w-5" />
            <span>Referral Program Settings</span>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">Configure reward amounts for the referral program</p>
        </CardHeader>
        <CardContent>
          {settingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading settings...</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Referrer Reward
                  </label>
                  <Input
                    type="text"
                    value={referralSettings.referrerReward}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      referrerReward: e.target.value
                    })}
                    placeholder="100 or 'Refer a friend and earn rewards!'"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Amount or description the referrer earns when someone signs up using their code. Can be a number (e.g., "₦100") or a sentence (e.g., "Refer a friend and earn rewards!")
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Referee Reward
                  </label>
                  <Input
                    type="text"
                    value={referralSettings.refereeReward}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      refereeReward: e.target.value
                    })}
                    placeholder="50 or 'Get a bonus on your first purchase!'"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Bonus amount or description the new user receives on their first purchase. Can be a number (e.g., "₦50") or a sentence (e.g., "Get a bonus on your first purchase!")
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Points referrer gets when someone signs up
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={referralSettings.referrerPointsOnSignup}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      referrerPointsOnSignup: Math.max(0, parseInt(e.target.value, 10) || 0)
                    })}
                    placeholder="0"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Reward points the referrer earns when a new user signs up with their code. Points can be converted to wallet cash in Dashboard → Wallet.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Points referrer gets per referred customer purchase
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={referralSettings.referrerPointsPerPurchase}
                    onChange={(e) => setReferralSettings({
                      ...referralSettings,
                      referrerPointsPerPurchase: Math.max(0, parseInt(e.target.value, 10) || 0)
                    })}
                    placeholder="0"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Points the referrer earns each time someone they referred completes a purchase. Users can convert points to cash in Wallet.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <Input
                  type="text"
                  value={referralSettings.description}
                  onChange={(e) => setReferralSettings({
                    ...referralSettings,
                    description: e.target.value
                  })}
                  placeholder="Refer a friend and earn rewards!"
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Optional description that will be shown to users
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={referralSettings.isActive}
                  onChange={(e) => setReferralSettings({
                    ...referralSettings,
                    isActive: e.target.checked
                  })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Enable referral program
                </label>
              </div>
              <div className="pt-4 border-t">
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Changes will reflect immediately in the user dashboard
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Referred Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{referredUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {referredUsers.filter(u => u.emailVerified).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rewards Paid</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    referredUsers.reduce((sum, u) => 
                      sum + (u.referralRecord?.rewardAmount || 0), 0
                    )
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {referredUsers.filter(u => {
                    const date = new Date(u.createdAt)
                    const now = new Date()
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                            <p className="text-sm text-gray-500">{user.referrer.email}</p>
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
