"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-gray-50 to-orange-50 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div className="absolute inset-0">
        <motion.div className="absolute top-20 left-20 w-40 h-40 bg-orange-200/30 rounded-full blur-2xl"></motion.div>
        <motion.div className="absolute bottom-20 right-20 w-60 h-60 bg-yellow-200/20 rounded-full blur-3xl"></motion.div>
      </motion.div>

      <motion.div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
            Customer Stories
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            What Our Customers
            <span className="text-orange-600"> Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real experiences from real customers who have transformed their shopping journey
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <TestimonialsCarousel />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-orange-100">
            <motion.div className="flex items-center justify-center space-x-8 mb-6">
              <motion.div className="text-center">
                <motion.div className="text-3xl font-bold text-orange-600">370+</motion.div>
                <motion.div className="text-sm text-gray-600">Smart Shoppers</motion.div>
              </motion.div>
              <motion.div className="w-px h-12 bg-gray-200"></motion.div>
              <motion.div className="text-center">
                <motion.div className="text-3xl font-bold text-orange-600">4.9★</motion.div>
                <motion.div className="text-sm text-gray-600">Average Rating</motion.div>
              </motion.div>
              <motion.div className="w-px h-12 bg-gray-200"></motion.div>
              <motion.div className="text-center">
                <motion.div className="text-3xl font-bold text-orange-600">98%</motion.div>
                <motion.div className="text-sm text-gray-600">Satisfaction</motion.div>
              </motion.div>
            </motion.div>
            <p className="text-gray-700 font-medium mb-6">
              Building a Better Food Future Together
            </p>
            <Link href="/marketplace">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3">
                Join Our Community
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
