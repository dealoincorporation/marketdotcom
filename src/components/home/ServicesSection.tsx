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
      description: "We shop on your behalf—so you don't have to. From trusted local markets and suppliers, we carefully source fresh produce, packaged, and processed food items—ensuring quality, fair pricing, and reliable delivery.",
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      features: ["Expert sourcing", "Quality assurance", "Reliable delivery"]
    },
    {
      icon: PiggyBank,
      title: "Daily & Monthly Thrift Plans",
      description: "Save gradually and receive a well-packaged bundle of food and grocery essentials—delivered monthly or during festive periods. Designed to help you plan ahead, beat price hikes, and shop without stress.",
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      features: ["Gradual savings", "Festive bundles", "Price protection"]
    }
  ]

  return (
    <section id="services" className="py-24 bg-gradient-to-br from-orange-50 via-white to-orange-25 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div className="absolute inset-0">
        <motion.div className="absolute top-10 right-10 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute bottom-10 left-10 w-80 h-80 bg-yellow-100/30 rounded-full blur-3xl"></motion.div>
      </motion.div>

      <motion.div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-50 text-orange-800 rounded-full text-sm font-semibold mb-8 border border-orange-200/50 shadow-sm">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></span>
            Our Services
          </motion.div>
          <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 leading-tight">
            What We
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> Offer</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Comprehensive agricultural and food supply solutions tailored for modern living
          </p>
        </motion.div>

        {/* Services Cards Grid */}
        <motion.div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <motion.div className="bg-white/90 backdrop-blur-sm border border-orange-200/50 rounded-3xl p-8 h-full hover:bg-white hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-[1.02] hover:border-orange-300/60">
                  {/* Icon */}
                  <div className="flex justify-center md:justify-start mb-6">
                    <motion.div className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${service.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300 text-center md:text-left">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-6 text-lg text-center md:text-left">
                    {service.description}
                  </p>

                  {/* Features */}
                  <motion.div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <motion.div key={featureIndex} className="flex items-center justify-center md:justify-start space-x-2">
                        <motion.div className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.gradient}`}></motion.div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Hover Effect */}
                  <motion.div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></motion.div>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Experience Better Shopping?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of satisfied customers who have transformed their shopping experience with Marketdotcom
            </p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4">
                  Browse Marketplace
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50 px-8 py-4">
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}
