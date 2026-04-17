"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Award, Shield, Truck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-gray-900">
      {/* Background Animated Elements */}
      <motion.div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-orange-600 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-green-600 rounded-full blur-[150px]"
        />
      </motion.div>

      <motion.div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <motion.div className="inline-flex items-center px-4 py-2 glass-effect border border-white/10 text-orange-400 rounded-full text-xs font-black uppercase tracking-widest mb-10">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse" />
            Join The Future
          </motion.div>

          <h2 className="text-5xl lg:text-8xl font-black text-white mb-10 leading-tight tracking-tighter">
            Join the <span className="text-gradient">Movement</span>
          </h2>

          <p className="text-xl lg:text-3xl text-gray-400 mb-16 font-medium max-w-3xl mx-auto leading-relaxed">
            Start your journey to smarter shopping today and be part of Nigeria's food revolution.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/marketplace">
                <Button size="xl" className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-8 text-xl font-black rounded-2xl shadow-2xl shadow-orange-600/20 transition-all duration-300 w-full sm:w-auto">
                  <ShoppingBag className="mr-3 h-6 w-6" />
                  Start Your Order
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/auth/register">
                <Button size="xl" variant="outline" className="glass-effect border-2 border-white/20 text-white hover:bg-white hover:text-black px-12 py-8 text-xl font-black rounded-2xl transition-all duration-300 w-full sm:w-auto">
                  <Award className="mr-3 h-6 w-6" />
                  Join the Thrift
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Trust Indicators - Premium Style */}
          <div className="flex flex-wrap justify-center items-center gap-12 pt-12 border-t border-white/10">
            <div className="flex items-center space-x-3 text-orange-100/60 group cursor-default">
              <Shield className="h-6 w-6 group-hover:text-orange-500 smooth-transition" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">Secure Payments</span>
            </div>
            <div className="flex items-center space-x-3 text-orange-100/60 group cursor-default">
              <Truck className="h-6 w-6 group-hover:text-orange-500 smooth-transition" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">Fast Delivery</span>
            </div>
            <div className="flex items-center space-x-3 text-orange-100/60 group cursor-default">
              <Heart className="h-6 w-6 group-hover:text-orange-500 smooth-transition" />
              <span className="text-sm font-black uppercase tracking-[0.2em]">Quality Guaranteed</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>

  )
}
