"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-gradient-to-br from-white to-orange-50 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div className="absolute inset-0">
        <motion.div className="absolute top-0 left-0 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-100/30 rounded-full blur-3xl"></motion.div>
      </motion.div>

      <motion.div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-8 mx-auto">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
            About Marketdotcom
          </motion.div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
            Who We
            <span className="text-orange-600"> Are</span>
          </h2>

          <motion.div className="text-center md:text-justify max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Tired of crowded markets and overpriced foodstuff? At Marketdotcom, we're here to fix that.
              We take the hassle out of market runs for everyday Nigerians, delivering affordable, quality food straight to your doorstep.
            </p>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Through our personal shopping services, smart thrift plans, and convenient delivery solutions,
              we make grocery shopping accessible, affordable, and stress-free for Nigerian households.
            </p>
          </motion.div>

          {/* CAC Verified Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-orange-200 rounded-xl shadow-lg mx-auto"
          >
            <Shield className="h-6 w-6 text-orange-600 mr-3" />
            <motion.div>
              <motion.div className="font-bold text-gray-900">CAC Verified</motion.div>
              <motion.div className="text-sm text-gray-600">Corporate Affairs Commission</motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
