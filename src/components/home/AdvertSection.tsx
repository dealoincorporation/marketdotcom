"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star, ShoppingBag, Shield, Truck, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageSlider } from "@/components/image-slider"

export function AdvertSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="glass-effect rounded-[4rem] p-1 shadow-2xl overflow-hidden bg-white/40 premium-shadow"
        >
          <div className="grid lg:grid-cols-2 gap-y-12 lg:gap-x-0 overflow-hidden rounded-[3.9rem]">
            {/* Left Content */}
            <div className="p-12 lg:p-20 flex flex-col justify-center relative bg-white/60">
              <motion.div className="inline-flex items-center px-4 py-2 glass-effect border border-orange-200/50 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-10 w-fit">
                <Star className="h-4 w-4 mr-2" />
                Premium Quality
              </motion.div>

              <h2 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">
                Sourced with <br />
                <span className="text-gradient">Integrity</span>
              </h2>

              <p className="text-xl text-gray-600 mb-12 font-medium leading-relaxed">
                Enjoy elite personal shopping and fresh marketplace finds delivered directly to you.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                <Link href="/auth/register">
                  <Button size="xl" className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-7 text-lg font-black rounded-2xl shadow-2xl transition-all">
                    Start Your Membership
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button size="xl" variant="outline" className="glass-effect border-2 border-orange-100 text-orange-700 hover:bg-white px-10 py-7 text-lg font-black rounded-2xl transition-all">
                    Explore Marketplace
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-8 pt-10 border-t border-black/5 opacity-60">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-gray-900" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-gray-900" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Swift</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-gray-900" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Excellence</span>
                </div>
              </div>
            </div>

            {/* Right Visual - Image Slider */}
            <div className="relative aspect-square sm:aspect-video lg:aspect-auto lg:h-auto overflow-hidden">
              <ImageSlider
                images={[
                  "/market-guy with girl.png",
                  "/Whisk_4e949716576ebe0a3b24c9c7ce062b42dr.png",
                  "/Whisk_34cbee6023de4bd9f724eedd0213ceeedr.png",
                  "/Whisk_028e78c5d80daa68aef4fbe5670db5f4dr.png"
                ]}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>

  )
}
