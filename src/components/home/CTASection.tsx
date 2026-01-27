"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, Award, Shield, Truck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white relative overflow-hidden">
      {/* Background Elements */}
      <motion.div className="absolute inset-0">
        <motion.div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/20 to-transparent"></motion.div>
        <motion.div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute bottom-20 left-20 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl"></motion.div>
      </motion.div>

      <motion.div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">How to Join the Movement</h2>
          <p className="text-xl text-orange-100 mb-12 max-w-3xl mx-auto">
            Start your journey to smarter shopping today and be part of Nigeria's food revolution
          </p>

          <motion.div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/marketplace">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-10 py-4 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300">
                  <ShoppingBag className="mr-3 h-5 w-5" />
                  Start Your Order
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 text-lg px-10 py-4 font-semibold transition-all duration-300">
                  <Award className="mr-3 h-5 w-5" />
                  Join the Thrift Plan
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div className="flex flex-wrap justify-center items-center gap-8 text-orange-100">
            <motion.div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-300" />
              <span className="text-sm font-medium">Secure Payments</span>
            </motion.div>
            <motion.div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-orange-300" />
              <span className="text-sm font-medium">Fast Delivery</span>
            </motion.div>
            <motion.div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-orange-300" />
              <span className="text-sm font-medium">Quality Guaranteed</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
