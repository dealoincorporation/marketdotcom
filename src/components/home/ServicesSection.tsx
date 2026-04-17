"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, PiggyBank } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ServicesSection() {
  const services = [
    {
      icon: ShoppingCart,
      title: "Personal Shopping Services",
      description: "Expertly sourced fresh produce and groceries from trusted markets, delivered with care.",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      features: ["Expert sourcing", "Quality assurance", "Reliable delivery"]
    },
    {
      icon: PiggyBank,
      title: "Daily & Monthly Thrift Plans",
      description: "Stress-free thrift plans to help you beat price hikes and plan for your future food needs.",
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      features: ["Gradual savings", "Festive bundles", "Price protection"]
    }
  ]

  return (
    <section id="services" className="py-24 relative overflow-hidden bg-white">
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
            Elite Services
          </motion.div>
          <h2 className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tighter">
            What We <span className="text-gradient">Offer</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Seamlessly bridging the gap between local markets and your doorstep with world-class solutions.
          </p>
        </motion.div>

        {/* Services Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent blur-3xl opacity-0 group-hover:opacity-100 smooth-transition -z-10" />
                <div className="h-full glass-effect rounded-[3rem] p-10 premium-shadow border border-white/50 smooth-transition group-hover:translate-y-[-10px] bg-white/40">
                  <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 smooth-transition`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>

                  <h3 className="text-3xl font-black text-gray-900 mb-6 group-hover:text-orange-600 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-lg text-gray-600 leading-relaxed mb-8 font-medium">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-black/5">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.gradient}`} />
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA Card - Reimagined as Premium Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-24 relative"
        >
          <div className="glass-effect rounded-[3rem] p-12 lg:p-16 border border-white/50 premium-shadow text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-[80px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100/20 rounded-full blur-[80px] -ml-32 -mb-32" />

            <h3 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tighter">
              Ready to <span className="text-gradient">Upgrade</span> Your Life?
            </h3>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
              Join thousands of elite shoppers who have discovered the ultimate Nigerian shopping experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/marketplace">
                <Button size="xl" className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-7 text-lg font-black rounded-2xl shadow-2xl hover:shadow-orange-200 transition-all duration-300">
                  Browse Marketplace
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="xl" variant="outline" className="glass-effect border-2 border-orange-100 text-orange-700 hover:bg-white px-10 py-7 text-lg font-black rounded-2xl transition-all">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

  )
}
