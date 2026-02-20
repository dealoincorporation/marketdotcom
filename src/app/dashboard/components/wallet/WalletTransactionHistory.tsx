"use client"

import { TrendingUp, CreditCard, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  status?: string
  reference?: string
  date: string
}

interface WalletTransactionHistoryProps {
  transactions: Transaction[]
  loading: boolean
  formatPrice: (price: number) => string
  onTabChange?: (tab: any) => void
}

export function WalletTransactionHistory({
  transactions,
  loading,
  formatPrice,
  onTabChange,
}: WalletTransactionHistoryProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Recent Transactions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Transactions</h3>
            <p className="text-gray-600 text-sm">Your transaction history will appear here once you make purchases or receive payments.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${transaction.type === 'credit'
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
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div>{new Date(transaction.date).toLocaleDateString()}</div>
                        {transaction.reference && (
                          <div className="font-mono text-gray-400 truncate max-w-[180px] sm:max-w-[260px]" title={transaction.reference}>
                            Ref: {transaction.reference}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {transaction.type === 'credit' ? '+' : ''}{formatPrice(transaction.amount)}
                    </div>
                    {transaction.status && (
                      <div className={`text-xs font-medium mt-0.5 ${transaction.status === 'COMPLETED' ? 'text-green-500' :
                          transaction.status === 'FAILED' ? 'text-red-500' :
                            'text-amber-500'
                        }`}>
                        {transaction.status === 'COMPLETED' ? '✓ Completed' :
                          transaction.status === 'FAILED' ? '✗ Failed' :
                            '⏳ Pending'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button
                onClick={() => onTabChange?.('transactions')}
                className="text-orange-600 hover:text-orange-700 font-medium text-sm cursor-pointer"
              >
                View All Transactions →
              </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
