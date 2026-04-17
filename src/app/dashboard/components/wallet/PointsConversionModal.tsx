import { Star, X, RefreshCw, ArrowDownCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PointsConversionModalProps {
  totalPoints: number
  convertiblePoints: number
  pointsToConvert: string
  isConverting: boolean
  pointsSettings: {
    nairaPerPoint: number
    minimumPointsToConvert: number
  }
  onPointsToConvertChange: (value: string) => void
  onConvert: () => void
  onClose: () => void
}

export function PointsConversionModal({
  totalPoints,
  convertiblePoints,
  pointsToConvert,
  isConverting,
  pointsSettings,
  onPointsToConvertChange,
  onConvert,
  onClose,
}: PointsConversionModalProps) {
  const nairaValue = Math.floor(parseInt(pointsToConvert || "0") / pointsSettings.nairaPerPoint)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg"
        >
          <Card className="overflow-hidden glass-effect border border-white/70 rounded-[3rem] premium-shadow bg-white/85 backdrop-blur-3xl">
            <div className="p-8 sm:p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
                    <Star className="h-7 w-7 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none mb-1">Convert Points</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rewards to Wallet Balance</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100/50 hover:bg-gray-100 flex items-center justify-center transition-colors group"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-gray-900" />
                </button>
              </div>

              <div className="space-y-8">
                <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-[2rem] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Accumulated Points</span>
                    <span className="text-2xl font-black text-orange-600 tracking-tighter tabular-nums">{totalPoints.toLocaleString()} PTS</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Conversion Rate</span>
                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">{pointsSettings.nairaPerPoint} PTS = ₦1</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Points to Convert
                    </label>
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-md">
                      Min: {pointsSettings.minimumPointsToConvert} PTS
                    </span>
                  </div>
                  <div className="relative group">
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-lg group-focus-within:text-orange-600 transition-colors uppercase tracking-widest">PTS</div>
                    <input
                      type="number"
                      value={pointsToConvert}
                      onChange={(e) => onPointsToConvertChange(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-20 py-6 bg-white/50 border border-white/60 rounded-[1.5rem] text-2xl font-black text-gray-900 placeholder:text-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 transition-all tabular-nums"
                    />
                  </div>
                </div>

                {pointsToConvert && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/5 border border-green-500/10 p-8 rounded-[2rem] flex items-center justify-between relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                      <ArrowDownCircle className="h-24 w-24 text-green-600" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Estimated Credit</span>
                      <span className="text-3xl font-black text-green-600 tracking-tighter tabular-nums">₦{nairaValue.toLocaleString()}</span>
                    </div>
                    <div className="bg-green-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10">
                      Market Value
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col gap-4 pt-4">
                  <Button
                    onClick={onConvert}
                    disabled={!pointsToConvert || parseInt(pointsToConvert) < pointsSettings.minimumPointsToConvert || isConverting}
                    className="w-full h-16 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-orange-600/30 active:scale-95 disabled:opacity-50 group flex items-center justify-center gap-3"
                  >
                    {isConverting ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
                    )}
                    <span>{isConverting ? "Processing..." : "Convert Points"}</span>
                  </Button>
                  <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Funds will be instantly available in your main balance
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
