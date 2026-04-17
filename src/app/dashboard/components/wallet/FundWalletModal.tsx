import { Wallet, X, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
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
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg min-h-screen sm:min-h-0 bg-white sm:bg-transparent"
        >
          <Card className="h-full min-h-screen sm:min-h-0 sm:h-auto overflow-hidden sm:glass-effect sm:border-white/70 rounded-none sm:rounded-[3rem] premium-shadow border-none shadow-none sm:shadow-2xl sm:bg-white/85 sm:backdrop-blur-3xl flex flex-col pt-[max(env(safe-area-inset-top),1rem)]">
            <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center sm:block">
              <div className="flex items-center justify-between mb-12 sm:mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                    <Wallet className="h-7 w-7 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none mb-1">Add money to wallet</h3>
                    <p className="text-[10px] font-bold text-gray-500 normal-case tracking-tight">Enter an amount in naira. You will complete payment on Paystack.</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-12 h-12 rounded-full bg-gray-100/50 hover:bg-gray-100 flex items-center justify-center transition-colors group"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-gray-900" />
                </button>
              </div>

              <div className="space-y-10 sm:space-y-8 flex-1 sm:flex-none">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      Amount to add (₦)
                    </label>
                    <span className="text-[10px] font-black text-white bg-orange-600 px-3 py-1 rounded-full shadow-lg shadow-orange-600/20 normal-case">
                      Minimum ₦100
                    </span>
                  </div>
                  <div className="relative group/input">
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 font-black text-3xl group-focus-within/input:text-orange-600 transition-colors">₦</div>
                    <input
                      type="number"
                      value={fundingAmount}
                      onChange={(e) => onFundingAmountChange(e.target.value)}
                      placeholder="0"
                      aria-label="Amount to add in naira"
                      className="w-full pl-16 pr-8 py-10 bg-gray-50/50 sm:bg-white/50 border border-gray-100 sm:border-white/60 rounded-[2.5rem] text-4xl sm:text-5xl font-black text-gray-900 placeholder:text-gray-100 focus:outline-none focus:ring-[12px] focus:ring-orange-500/5 focus:border-orange-500/20 transition-all tabular-nums text-center sm:text-left"
                    />
                  </div>
                </div>

                <div className="bg-gray-900 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group/module">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover/module:scale-150" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Wallet balance now</span>
                      <span className="text-xl font-black text-white tabular-nums">{formatPrice(walletBalance)}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 hidden sm:block" />
                    <div className="space-y-1 text-right sm:text-left">
                      <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest block">Balance after payment</span>
                      <motion.span 
                        layout
                        className="text-xl font-black text-orange-500 tabular-nums block"
                      >
                        {formatPrice(walletBalance + (parseFloat(fundingAmount) || 0))}
                      </motion.span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5 pt-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:pb-0">
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={onFund}
                      disabled={!fundingAmount || parseFloat(fundingAmount) < 100 || isFunding}
                      className="w-full h-20 bg-orange-600 hover:bg-orange-700 text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] transition-all duration-500 shadow-[0_24px_48px_-12px_rgba(234,88,12,0.4)] hover:shadow-[0_32px_64px_-16px_rgba(234,88,12,0.6)] active:scale-95 disabled:opacity-30 group flex items-center justify-center gap-4"
                    >
                      {isFunding ? (
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-6 w-6 group-hover:scale-110 transition-transform duration-500" />
                      )}
                      <span>{isFunding ? "Opening Paystack..." : "Continue to Paystack"}</span>
                    </Button>
                    
                    {!isFunding && (
                      <button
                        onClick={onClose}
                        className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-colors"
                      >
                        Cancel & Go Back
                      </button>
                    )}
                  </div>
                  <p className="text-center text-[10px] font-medium text-gray-500 normal-case tracking-tight px-6 opacity-60">
                    Secure payment gateway • Your wallet updates instantly
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
