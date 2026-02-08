"use client"

import { Package, Users, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminTabNavigationProps {
  showProducts: boolean
  showReferralSettings: boolean
  showPointsSettings: boolean
  productsCount: number
  ordersCount: number
  onShowProducts: () => void
  onShowOrders: () => void
  onShowReferralSettings: () => void
  onShowPointsSettings: () => void
}

export function AdminTabNavigation({
  showProducts,
  showReferralSettings,
  showPointsSettings,
  productsCount,
  ordersCount,
  onShowProducts,
  onShowOrders,
  onShowReferralSettings,
  onShowPointsSettings,
}: AdminTabNavigationProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <Button
        variant={showProducts ? "default" : "outline"}
        onClick={onShowProducts}
        className="flex items-center space-x-2"
      >
        <Package className="h-4 w-4" />
        <span>Products ({productsCount})</span>
      </Button>
      <Button
        variant={!showProducts && !showReferralSettings && !showPointsSettings ? "default" : "outline"}
        onClick={onShowOrders}
        className="flex items-center space-x-2"
      >
        <Users className="h-4 w-4" />
        <span>Orders ({ordersCount})</span>
      </Button>
      <Button
        variant={showReferralSettings ? "default" : "outline"}
        onClick={onShowReferralSettings}
        className="flex items-center space-x-2"
      >
        <Users className="h-4 w-4" />
        <span>Referral Settings</span>
      </Button>
      <Button
        variant={showPointsSettings ? "default" : "outline"}
        onClick={onShowPointsSettings}
        className="flex items-center space-x-2"
      >
        <Trophy className="h-4 w-4" />
        <span>Points Settings</span>
      </Button>
    </div>
  )
}
