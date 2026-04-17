"use client"

import { motion } from "framer-motion"
import { Star, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { ImageSlider } from "./image-slider"
import { HERO_IMAGES } from "@/lib/constants"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Completely Fixed Promotional Panel - No Scrolling */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white relative">
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          <ImageSlider
            images={[...HERO_IMAGES]}
            className="h-full w-full"
          />
        </div>
        {/* Overlay for better text visibility while keeping images visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-gray-900/35 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 via-transparent to-orange-900/15" />
        <div className="relative z-10 p-12 flex flex-col justify-center max-w-lg h-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center h-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="bg-gradient-to-r from-orange-600/10 to-orange-500/5 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-orange-400 fill-current" />
                ))}
              </div>
              <p className="text-sm text-white italic font-medium">
                "Marketdotcom has transformed how I shop for groceries. The thrift plan is a game-changer!"
              </p>
              <p className="text-xs text-orange-200 mt-2 font-medium">— Amaka O., Student</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-600/15 to-orange-500/10 rounded-full -translate-y-48 translate-x-48 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-700/12 to-orange-600/8 rounded-full translate-y-32 -translate-x-32 blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-orange-500/5 rounded-full blur-xl" />
      </div>

      {/* Inner Scrollable Auth Form Panel Only */}
      <div className="flex-1 lg:flex-none lg:w-1/2 h-screen overflow-hidden bg-[#F8F9FA] relative">
        {/* Dynamic Mesh Gradients for the form side */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-orange-400/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400/5 blur-[120px] rounded-full" />
        </div>

        <div className="h-full overflow-y-auto custom-scrollbar">
          <div className="min-h-screen flex items-center justify-center p-6 sm:p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-lg"
            >
              {/* Back to Home Link */}
              <div className="mb-10 flex justify-between items-center">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 text-gray-500 hover:text-orange-600 transition-all duration-300 group px-4 py-2 bg-white/85 backdrop-blur-md rounded-xl border border-white/70 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Home</span>
                </Link>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure connection</span>
                </div>
              </div>

              <div className="glass-effect rounded-[2.5rem] border border-white/80 p-8 sm:p-12 premium-shadow relative overflow-hidden">
                {/* Subtle highlight */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

                <div className="relative z-10">
                  <div className="flex justify-center mb-10">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <img
                        src="/mrktdotcom-logo.png"
                        alt="Marketdotcom Logo"
                        className="h-32 w-32 sm:h-40 sm:w-40 object-contain drop-shadow-xl"
                      />
                    </motion.div>
                  </div>

                  <div className="text-center mb-10">
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tighter uppercase">{title}</h2>
                    <p className="text-sm font-bold text-gray-500 tracking-tight">{subtitle}</p>
                  </div>

                  {children}
                </div>
              </div>

              {/* Footer Links */}
              <div className="mt-12 text-center space-y-6">
                <div className="flex justify-center items-center gap-6">
                  <Link href="/help" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">Support</Link>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <Link href="/privacy" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">Privacy</Link>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <Link href="/terms" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors">Terms</Link>
                </div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                  © 2026 Marketdotcom
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
