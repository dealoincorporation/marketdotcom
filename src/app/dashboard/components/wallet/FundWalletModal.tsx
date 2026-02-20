"use client"

import { Wallet, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FundWalletModalProps {
  walletBalance: number
  fundingAmount: string
  isFunding: boolean
  onFundingAmountChange: (amount: string) => void
  onFund: () => void
  onClose: () => void
  formatPrice: (price: number) => string
}

export function FundWalletModal({
  walletBalance,
  fundingAmount,
  isFunding,
  onFundingAmountChange,
  onFund,
  onClose,
  formatPrice,
}: FundWalletModalProps) {
  return (
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
                onChange={(e) => onFundingAmountChange(e.target.value)}
                placeholder="Enter amount"
                min="100"
                step="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500">Minimum amount: ₦100</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Wallet Balance</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Current: {formatPrice(walletBalance)}
              </p>
              {fundingAmount && (
                <p className="text-blue-700 text-sm">
                  After funding: {formatPrice(walletBalance + parseFloat(fundingAmount || "0"))}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isFunding}
              >
                Cancel
              </Button>
              <Button
                onClick={onFund}
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
  )
}
