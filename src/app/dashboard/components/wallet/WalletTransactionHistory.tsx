import { TrendingUp, CreditCard, History, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

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
    <Card className="relative overflow-hidden glass-effect border border-white/70 rounded-[2.5rem] premium-shadow bg-white/85 backdrop-blur-3xl p-8 sm:p-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-900 rounded-[1rem] flex items-center justify-center shadow-lg">
            <History className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">Activity Log</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent activity</p>
          </div>
        </div>

        <button
          onClick={() => onTabChange?.('transactions')}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-orange-600 transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-orange-600 animate-spin" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <History className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-tight">No transactions yet</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest max-w-xs mx-auto">
              When you fund your wallet or place orders, your activity will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, idx) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group flex items-center justify-between p-5 bg-white/75 hover:bg-white/95 border border-white/70 rounded-2xl transition-all duration-300 hover:shadow-md active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${transaction.type === 'credit'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-red-500/10 text-red-600'
                    }`}>
                    {transaction.type === 'credit' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <div className="font-black text-gray-900 text-sm tracking-tight mb-0.5">
                      {transaction.description}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {transaction.reference && (
                        <span className="text-[9px] font-mono text-gray-300 uppercase truncate max-w-[120px] bg-gray-50 px-2 py-0.5 rounded-md">
                          #{transaction.reference.slice(-8)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-lg font-black tracking-tighter tabular-nums ${transaction.type === 'credit' ? 'text-green-600' : 'text-gray-900'
                    }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatPrice(transaction.amount)}
                  </div>
                  {transaction.status && (
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mt-1 ${transaction.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                        transaction.status === 'FAILED' ? 'bg-red-500/10 text-red-500' :
                          'bg-orange-500/10 text-orange-500'
                      }`}>
                      <div className={`w-1 h-1 rounded-full ${transaction.status === 'COMPLETED' ? 'bg-green-500' :
                          transaction.status === 'FAILED' ? 'bg-red-500' :
                            'bg-orange-500 animate-pulse'
                        }`} />
                      {transaction.status.toLowerCase()}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
