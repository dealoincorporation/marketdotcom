"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface ProductFormLayoutProps {
  children: ReactNode
  className?: string
}

export function ProductFormLayout({ children, className = "" }: ProductFormLayoutProps) {
  return (
    <div className={`min-h-screen bg-[#F8F9FA] relative pb-20 sm:pb-0 ${className}`}>
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-orange-400/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-400/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto py-6 sm:py-10 md:py-14 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="glass-effect rounded-[3rem] border border-white shadow-2xl overflow-hidden premium-shadow bg-white/85 backdrop-blur-3xl p-1 bg-gradient-to-br from-white/95 to-white/70">
            <div className="p-1 sm:p-2 md:p-3 lg:p-4 bg-white/80 rounded-[2.8rem] border border-white/70">
              {children}
            </div>
          </div>
        </motion.div>

        {/* System Identifier */}
        <div className="mt-12 flex items-center justify-center gap-6 opacity-30">
          <div className="h-[1px] w-12 bg-gray-400" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Inventory Form</span>
          <div className="h-[1px] w-12 bg-gray-400" />
        </div>
      </div>
    </div>
  )
}
