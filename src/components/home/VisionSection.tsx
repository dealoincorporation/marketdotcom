"use client"

import { motion } from "framer-motion"
import { Truck, PiggyBank, Store, Shield, Users, Heart, Award } from "lucide-react"

export function VisionSection() {
  const visionItems = [
    {
      icon: Truck,
      title: "Doorstep Delivery",
      desc: "Carefully packed under hygienic conditions, your food essentials are delivered straight to your doorstep—stress-free and at fair prices",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      stats: "Same Day"
    },
    {
      icon: PiggyBank,
      title: "Smart Thrift Plans",
      desc: "Save gradually with our daily and monthly thrift plans, making quality food more affordable without putting pressure on your finances",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      stats: "₦450/day"
    },
    {
      icon: Store,
      title: "Personal Shopping",
      desc: "We shop on your behalf—so you don't have to. From trusted local markets and suppliers, we carefully source fresh produce, packaged, and processed food items—ensuring quality, fair pricing, and reliable delivery.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      stats: "Expert Service"
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      desc: "Count on us for consistent quality and on-time delivery, every single time—fresh, reliable, and trustworthy service",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      stats: "100% Fresh"
    }
  ]

  const impactStats = [
    { number: "500+", label: "Happy Customers", icon: Users },
    { number: "98%", label: "On-Time Delivery", icon: Truck },
    { number: "24/7", label: "Customer Support", icon: Heart },
    { number: "₦450", label: "Daily Savings", icon: Award }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50 text-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div className="absolute inset-0">
        <motion.div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-200/30 via-orange-100/20 to-transparent"></motion.div>
        <motion.div className="absolute top-20 right-20 w-64 h-64 bg-orange-300/10 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute bottom-20 left-20 w-80 h-80 bg-yellow-200/15 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-200/20 to-yellow-200/20 rounded-full blur-3xl"></motion.div>
      </motion.div>

      {/* Floating Icons */}
      <motion.div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 text-orange-200/30"
        >
          <Heart className="h-16 w-16" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 right-32 text-yellow-200/20"
        >
          <Award className="h-12 w-12" />
        </motion.div>
      </motion.div>

      <motion.div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-orange-100 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-orange-300 rounded-full mr-2 animate-pulse"></span>
            Our Vision
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight">
            Building a Better
            <span className="block text-orange-600">Food Future</span>
          </h2>

          <p className="text-xl text-gray-700 mb-16 max-w-4xl mx-auto leading-relaxed">
            At Marketdotcom, we're revolutionizing how Nigerians shop for food by combining technology with traditional market wisdom, making grocery shopping convenient, affordable, and reliable for every household.
          </p>
        </motion.div>

        {/* Vision Cards Grid */}
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {visionItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative h-full"
              >
                <motion.div className={`bg-white/90 backdrop-blur-sm border border-orange-200/50 p-8 rounded-2xl h-full flex flex-col hover:bg-white hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105`}>
                  {/* Icon */}
                  <motion.div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 bg-gradient-to-r ${item.color} shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </motion.div>

                  {/* Stats Badge */}
                  <motion.div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-orange-100 mb-4">
                    {item.stats}
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-gray-700 leading-relaxed flex-grow">
                    {item.desc}
                  </p>

                  {/* Hover Effect */}
                  <motion.div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></motion.div>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center hidden md:block"
        >
          <motion.div className="bg-white/95 backdrop-blur-sm border border-orange-200/50 rounded-3xl p-8 max-w-4xl mx-auto shadow-xl">
            <h3 className="text-2xl font-bold mb-8 text-gray-900">Our Impact So Far</h3>

            <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <motion.div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3">
                      <IconComponent className="h-6 w-6 text-orange-200" />
                    </motion.div>
                    <motion.div className="text-3xl font-bold text-orange-600 mb-1">{stat.number}</motion.div>
                    <motion.div className="text-sm text-gray-600">{stat.label}</motion.div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
