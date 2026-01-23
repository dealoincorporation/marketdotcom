"use client"

import { motion } from "framer-motion"
import { ShoppingBag, Star, Truck, Shield, Heart, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { ImageSlider } from "./image-slider"

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
            images={["/market_image.jpeg", "/cart_image.jpeg", "/vegetables.webp"]}
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
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg overflow-hidden">
                <img
                  src="/mrktdotcom-logo.png"
                  alt="Marketdotcom Logo"
                  className="h-24 w-24 object-contain"
                />
              </div>
              <span className="text-3xl font-bold text-orange-400">Marketdotcom</span>
            </div>

            <h1 className="text-4xl font-black mb-3 leading-tight">
              Shop Smarter, Save More
            </h1>

            <p className="text-xl mb-4 text-white font-medium">
              Join thousands of Nigerians who have transformed their shopping experience with quality foodstuff and convenient delivery.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { icon: Star, text: "Quality foodstuff, daily savings", color: "text-yellow-400" },
                { icon: Truck, text: "Convenient doorstep delivery", color: "text-blue-400" },
                { icon: Shield, text: "CAC Verified & Trusted", color: "text-green-400" },
                { icon: Heart, text: "Personalized shopping experience", color: "text-red-400" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-white font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>

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
              <p className="text-xs text-orange-200 mt-2 font-medium">— Sarah O., Student</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-600/15 to-orange-500/10 rounded-full -translate-y-48 translate-x-48 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-700/12 to-orange-600/8 rounded-full translate-y-32 -translate-x-32 blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-orange-500/5 rounded-full blur-xl" />
      </div>

      {/* Inner Scrollable Auth Form Panel Only */}
      <div className="flex-1 lg:flex-none lg:w-1/2 h-screen overflow-hidden bg-gray-50">
        <div className="h-full overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md"
            >
              {/* Back to Home Link */}
              <div className="mb-6">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-medium">Back to Home</span>
                </Link>
              </div>

              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <img
                    src="/mrktdotcom-logo.png"
                    alt="Marketdotcom Logo"
                    className="h-24 w-24 object-contain"
                  />
                  <span className="text-2xl font-bold text-gray-900">Marketdotcom</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 mb-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
                  <p className="text-gray-600">{subtitle}</p>
                </div>

                {children}
              </div>

              {/* Footer Links */}
              <div className="text-center space-y-4 pb-8">
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                  <Link href="/" className="hover:text-orange-600 transition-colors inline-flex items-center space-x-1">
                    <Home className="h-3 w-3" />
                    <span>Home</span>
                  </Link>
                  <span>•</span>
                  <Link href="/help" className="hover:text-orange-600 transition-colors">
                    Help Center
                  </Link>
                </div>
                <p className="text-xs text-gray-500">
                  © 2025 Marketdotcom. All rights reserved.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
