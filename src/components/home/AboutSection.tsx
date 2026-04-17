"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden mesh-gradient-bg">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div className="relative z-10 rounded-[3rem] overflow-hidden premium-shadow glass-effect p-4">
              <img
                src="/market_image.jpeg"
                alt="About Marketdotcom"
                className="w-full h-[500px] object-cover rounded-[2.5rem]"
              />
            </motion.div>
            {/* Floating Decorative Elements */}
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-200/50 rounded-full blur-3xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div className="inline-flex items-center px-4 py-2 glass-effect border border-orange-200/50 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse" />
              Our Story
            </motion.div>

            <h2 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">
              Who We <span className="text-gradient">Are</span>
            </h2>

            <div className="space-y-6">
              <p className="text-xl text-gray-600 leading-relaxed font-medium capitalize">
                Tired of crowded markets and overpriced foodstuff? At Marketdotcom, we're here to fix that.
              </p>
              <p className="text-lg text-gray-500 leading-relaxed">
                We take the hassle out of market runs for everyday Nigerians, delivering affordable, quality food straight to your doorstep. Through our personal shopping services and smart thrift plans, we make grocery shopping stress-free for every household.
              </p>
            </div>

            {/* CAC Verified Badge - Reimagined */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-12 inline-flex items-center p-6 glass-effect rounded-3xl premium-shadow border border-white/50 group"
            >
              <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mr-4 smooth-transition group-hover:bg-orange-600">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="font-black text-gray-900 text-lg">CAC Verified</div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-tight">Corporate Affairs Commission</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>

  )
}
