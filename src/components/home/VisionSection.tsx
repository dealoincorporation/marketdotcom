"use client"

import { motion } from "framer-motion"
import { Truck, PiggyBank, Store, Shield, Users, Heart, Award } from "lucide-react"

export function VisionSection() {
  const visionItems = [
    {
      icon: Truck,
      title: "Doorstep Delivery",
      desc: "Hygienically packed essentials delivered stress-free to your doorstep.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      stats: "Same Day"
    },
    {
      icon: PiggyBank,
      title: "Smart Thrift Plans",
      desc: "Affordable daily and monthly plans to help you save on quality food items.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      stats: "₦450/day"
    },
    {
      icon: Store,
      title: "Personal Shopping",
      desc: "We source fresh produce and groceries from trusted markets, ensuring quality and fair pricing.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      stats: "Expert Service"
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      desc: "Reliable, on-time delivery of fresh and high-quality groceries, every time.",
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
    <section className="py-24 relative overflow-hidden mesh-gradient-bg">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div className="inline-flex items-center px-4 py-2 glass-effect border border-orange-200/50 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-8">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse" />
            Our Vision
          </motion.div>

          <h2 className="text-5xl lg:text-8xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">
            Building a Better<br />
            <span className="text-gradient">Food Future</span>
          </h2>

          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto font-medium leading-relaxed">
            Revolutionizing how Nigerians shop by combining cutting-edge technology with traditional market values.
          </p>
        </motion.div>

        {/* Vision Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {visionItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="h-full glass-effect rounded-[2.5rem] p-10 premium-shadow border border-white/50 bg-white/40 smooth-transition group-hover:translate-y-[-10px]">
                  <div className={`w-16 h-16 rounded-2xl mb-8 bg-gradient-to-br ${item.color} flex items-center justify-center shadow-2xl group-hover:scale-110 smooth-transition`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  <div className="inline-flex items-center px-3 py-1.5 glass-effect rounded-lg text-[10px] font-black uppercase tracking-widest text-orange-600 mb-6 bg-white/50">
                    {item.stats}
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Impact Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="glass-effect rounded-[3rem] p-12 lg:p-16 border border-white/50 premium-shadow bg-white/50">
            <h3 className="text-3xl font-black text-gray-900 mb-12 text-center uppercase tracking-widest">Our Global Impact</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {impactStats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center group"
                  >
                    <div className="w-14 h-14 glass-effect rounded-2xl flex items-center justify-center mx-auto mb-6 smooth-transition group-hover:bg-orange-600 group-hover:text-white">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-4xl font-black text-orange-600 mb-1 tracking-tighter">{stat.number}</div>
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-tight">{stat.label}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
