"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Shield, Truck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageSlider } from "@/components/image-slider"
import { HERO_IMAGES } from "@/lib/constants"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-16 lg:pt-20 pb-24">
      {/* Background Elements */}
      <motion.div className="absolute inset-0">
        <motion.div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-100/30 to-yellow-100/30 rounded-full blur-3xl"></motion.div>
      </motion.div>

      <motion.div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left w-full"
          >
            {/* Mobile Image Slider */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative z-10 max-w-lg mx-auto mb-8 lg:hidden"
            >
              <motion.div className="relative">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <ImageSlider
                    images={[...HERO_IMAGES]}
                    className="h-64 sm:h-80 w-full"
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Main Headline - Hidden on mobile, visible on desktop */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden md:block text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6"
            >
              <span className="font-black">Shop Smarter, Save More</span>
            </motion.h1>

            {/* Subheadline - Desktop only (above buttons) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hidden md:block text-xl text-gray-600 mb-6 max-w-2xl italic"
            >
              your smart shopping solution. quality foodstuff, daily savings and convenient delivery all in one place
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center mb-6"
            >
              <Link href="/marketplace">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-full">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Start Shopping
                </Button>
              </Link>
              <Link href="#about">
                <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-orange-500 px-8 py-4 text-lg font-semibold hover:bg-orange-50 transition-all duration-300">
                  Learn More
                </Button>
              </Link>
            </motion.div>

            {/* Subheadline - Mobile only (below buttons) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="md:hidden text-xl text-gray-600 mb-6 max-w-2xl mx-auto text-center italic px-4"
            >
              your smart shopping solution. quality foodstuff, daily savings and convenient delivery all in one place
            </motion.p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center justify-center lg:justify-start mt-6 sm:mt-8 space-x-8"
            >
              <motion.div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Quality Assured</span>
              </motion.div>
              <motion.div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Fast Delivery</span>
              </motion.div>
              <motion.div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-orange-700" />
                <span className="text-sm font-medium text-gray-700">Fresh Products</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Visual - Image Slider (Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <motion.div className="relative">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="max-w-lg mx-auto"
              >
                <ImageSlider
                  images={[...HERO_IMAGES]}
                  className="h-96 w-full"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-gray-500">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            ></motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
