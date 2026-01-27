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
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 sm:pb-0 ${className}`}>
      <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
              {children}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
