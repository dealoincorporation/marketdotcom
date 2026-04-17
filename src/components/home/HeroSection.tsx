"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Shield, Truck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageSlider } from "@/components/image-slider"
import { HERO_IMAGES } from "@/lib/constants"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden mesh-gradient-bg pt-16 lg:pt-20 pb-24">
      {/* Background Animated Elements */}
      <motion.div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-green-400/10 rounded-full blur-[140px]"
        />
      </motion.div>

      <motion.div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left w-full"
          >
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 glass-effect rounded-full text-sm font-bold text-orange-600 mb-8 border border-orange-200/50"
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse" />
              THE FUTURE OF SHOPPING IS HERE
            </motion.div>

            {/* Mobile Image Slider - Integrated with glass effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative z-10 max-w-lg mx-auto mb-10 lg:hidden p-2 glass-effect rounded-[2.5rem] premium-shadow"
            >
              <ImageSlider
                images={[...HERO_IMAGES]}
                className="h-64 sm:h-80 w-full rounded-[2rem] overflow-hidden"
              />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-8 tracking-tighter"
            >
              Shop <span className="text-gradient">Smarter</span>,<br />
              Save <span className="text-orange-600 underline decoration-orange-200/60 decoration-4 underline-offset-8">More</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl lg:text-2xl text-gray-600 mb-10 max-w-2xl leading-relaxed font-medium"
            >
              Your personal smart shopping companion. Premium foodstuff, daily savings, and effortless delivery at your fingertips.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-6 lg:justify-start justify-center mb-12"
            >
              <Link href="/marketplace">
                <Button size="xl" className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-7 text-xl font-black shadow-2xl hover:shadow-orange-200 transition-all duration-300 rounded-2xl group overflow-hidden relative">
                  <span className="relative z-10 flex items-center">
                    <ShoppingBag className="mr-3 h-6 w-6" />
                    Start Shopping
                  </span>
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>
              <Link href="#about">
                <Button size="xl" variant="outline" className="glass-effect border-2 border-orange-100 px-10 py-7 text-xl font-bold hover:bg-white transition-all duration-300 rounded-2xl">
                  Learn More
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-8 opacity-70"
            >
              <div className="flex items-center space-x-3 group">
                <div className="p-2 glass-effect rounded-lg group-hover:bg-orange-50 transition-colors">
                  <Shield className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-gray-600">Quality</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 glass-effect rounded-lg group-hover:bg-orange-50 transition-colors">
                  <Truck className="h-5 w-5 text-orange-500" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-gray-600">Fast</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 glass-effect rounded-lg group-hover:bg-orange-50 transition-colors">
                  <Heart className="h-5 w-5 text-orange-700" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-gray-600">Fresh</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual - Image Slider (Desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "circOut", delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <motion.div className="relative animate-floating p-4 glass-effect rounded-[3rem] premium-shadow">
              <ImageSlider
                images={[...HERO_IMAGES]}
                className="h-[500px] w-full rounded-[2.5rem] overflow-hidden"
              />

              {/* Floating Stat Card 1 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute -top-6 -right-6 glass-effect p-6 rounded-3xl premium-shadow border border-white/50"
              >
                <div className="text-3xl font-black text-orange-600">4.9★</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Top Rated</div>
              </motion.div>

              {/* Floating Stat Card 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.7 }}
                className="absolute -bottom-8 -left-10 glass-effect p-6 rounded-3xl premium-shadow border border-white/50"
              >
                <div className="text-2xl font-black text-gray-900">10k+</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Happy Shoppers</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div className="flex flex-col items-center space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-7 h-12 border-2 border-gray-200 rounded-full flex justify-center p-1"
          >
            <motion.div
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 bg-orange-600 rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>

  )
}
