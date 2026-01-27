"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Star, ShoppingBag, Shield, Truck, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ImageSlider } from "@/components/image-slider"

export function AdvertSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div className="absolute inset-0">
        <motion.div className="absolute top-10 left-10 w-64 h-64 bg-orange-200/20 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-200/25 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-100/30 to-yellow-100/30 rounded-full blur-3xl"></motion.div>
      </motion.div>

      <motion.div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-100/50 overflow-hidden"
        >
          <motion.div className="grid md:grid-cols-2 gap-0">
            {/* Left Content */}
            <motion.div className="p-8 lg:p-12 flex flex-col justify-center">
              <motion.div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 rounded-full text-sm font-semibold mb-6 w-fit">
                <Star className="h-4 w-4 mr-2" />
                Why Choose Us
              </motion.div>

              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Quality Foodstuff,
                <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Delivered Fresh</span>
              </h3>

              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                Experience the convenience of modern shopping with traditional market quality. From farm-fresh produce to packaged goods,
                we bring the best of Nigerian markets directly to your doorstep with reliable delivery and exceptional service.
              </p>

              <motion.div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Get Started Today
                    <ShoppingBag className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button variant="outline" className="border-2 border-orange-300 hover:border-orange-500 px-8 py-3 font-semibold hover:bg-orange-50 transition-all duration-300">
                    Explore Marketplace
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div className="flex items-center space-x-6 mt-8 pt-8 border-t border-gray-100">
                <motion.div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Secure Payment</span>
                </motion.div>
                <motion.div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Fast Delivery</span>
                </motion.div>
                <motion.div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-orange-700" />
                  <span className="text-sm font-medium text-gray-700">Quality Assured</span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Visual - Image Slider */}
            <motion.div className="relative bg-gradient-to-br from-orange-500/10 to-yellow-500/10 p-8 lg:p-12 flex items-center justify-center">
              <motion.div className="relative w-full max-w-sm lg:max-w-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="rounded-2xl overflow-hidden shadow-2xl"
                >
                  <ImageSlider
                    images={[
                      "/market-guy with girl.png",
                      "/Whisk_4e949716576ebe0a3b24c9c7ce062b42dr.png",
                      "/Whisk_34cbee6023de4bd9f724eedd0213ceeedr.png",
                      "/Whisk_028e78c5d80daa68aef4fbe5670db5f4dr.png"
                    ]}
                    className="h-64 lg:h-80 w-full object-cover"
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
