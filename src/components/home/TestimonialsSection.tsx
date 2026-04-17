"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { TestimonialsCarousel } from "@/components/testimonials-carousel"

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div className="inline-flex items-center px-4 py-2 glass-effect border border-orange-200/50 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse" />
            Customer Success
          </motion.div>
          <h2 className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">
            What They <span className="text-gradient">Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Real experiences from real customers who have transformed their shopping journey.
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="glass-effect rounded-[3rem] p-4 premium-shadow border border-white/50 bg-white/40 mb-16">
          <TestimonialsCarousel />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="glass-effect rounded-[2.5rem] p-10 max-w-4xl mx-auto border border-white/50 premium-shadow bg-white/60">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="text-center">
                <div className="text-4xl font-black text-orange-600 mb-2">370+</div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Happy Shoppers</div>
              </div>
              <div className="text-center border-y md:border-y-0 md:border-x border-black/5 py-8 md:py-0">
                <div className="text-4xl font-black text-orange-600 mb-2">4.9★</div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-orange-600 mb-2">98%</div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Satisfaction</div>
              </div>
            </div>

            <p className="text-lg font-bold text-gray-600 mb-8">
              Join the movement towards a smarter food future in Nigeria.
            </p>
            <Link href="/marketplace">
              <Button size="xl" className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-7 text-lg font-black rounded-2xl shadow-2xl transition-all">
                Become a Member
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

  )
}
