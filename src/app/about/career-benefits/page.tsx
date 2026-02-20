"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  DollarSign,
  Heart,
  Users,
  Award,
  Clock,
  Calendar,
  CheckCircle,
  Zap,
  Target,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Shield,
  Coffee,
  Home,
  Globe,
  Sparkles,
  Building2,
  Rocket,
  MapPin
} from "lucide-react"

export default function CareerBenefitsPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Competitive Compensation",
      description: "We offer competitive salaries and performance-based bonuses that recognize and reward your contributions to our mission.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance coverage for you and your family, plus wellness programs to keep you at your best.",
      color: "from-red-500 to-pink-600"
    },
    {
      icon: GraduationCap,
      title: "Learning & Development",
      description: "Continuous learning opportunities, professional development programs, and access to courses and certifications to grow your career.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Calendar,
      title: "Work-Life Balance",
      description: "Flexible working hours, remote work options, and generous paid time off to help you maintain a healthy work-life balance.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Users,
      title: "Collaborative Culture",
      description: "Join a diverse, inclusive team where your ideas matter. We foster collaboration, innovation, and mutual respect.",
      color: "from-orange-500 to-red-600"
    },
    {
      icon: Award,
      title: "Recognition & Rewards",
      description: "Regular recognition programs, employee of the month awards, and milestone celebrations to appreciate your hard work.",
      color: "from-yellow-500 to-amber-600"
    },
    {
      icon: Rocket,
      title: "Career Growth",
      description: "Clear career progression paths, mentorship programs, and opportunities to take on challenging projects that advance your career.",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Coffee,
      title: "Modern Workspace",
      description: "Comfortable, modern office spaces with all the amenities you need, plus free snacks, coffee, and team lunches.",
      color: "from-amber-500 to-orange-600"
    }
  ]

  const perks = [
    {
      icon: Home,
      title: "Remote Work Options",
      description: "Work from anywhere with flexible remote work arrangements"
    },
    {
      icon: Globe,
      title: "Global Opportunities",
      description: "Be part of a growing company with expansion opportunities"
    },
    {
      icon: Building2,
      title: "Modern Tools",
      description: "Access to the latest technology and tools to do your best work"
    },
    {
      icon: Sparkles,
      title: "Innovation Time",
      description: "Dedicated time to work on passion projects and innovative ideas"
    }
  ]

  const values = [
    {
      title: "Impact",
      description: "Make a real difference in how people shop and save for their families"
    },
    {
      title: "Growth",
      description: "Continuous learning and development opportunities at every level"
    },
    {
      title: "Community",
      description: "Join a supportive team that values collaboration and mutual success"
    },
    {
      title: "Innovation",
      description: "Work on cutting-edge solutions that shape the future of e-commerce"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/about">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to About
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Career Benefits
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              Join Our Team
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Career <span className="text-orange-600">Benefits</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              At Marketdotcom, we believe that our success is built on the success of our team. We're committed to providing comprehensive benefits and opportunities that help you thrive both personally and professionally.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">
                  View Open Positions
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-2 border-orange-300 hover:bg-orange-50 px-8 py-6 text-lg">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive <span className="text-orange-600">Benefits</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a complete benefits package designed to support your health, growth, and well-being
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-orange-200">
                    <CardContent className="p-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl mb-4`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Additional Perks */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              Extra Perks
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              More Reasons to <span className="text-orange-600">Join Us</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beyond the standard benefits, we offer additional perks that make working here special
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, index) => {
              const Icon = perk.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full text-center hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-200">
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl mb-4">
                        <Icon className="h-8 w-8 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{perk.title}</h3>
                      <p className="text-gray-600">{perk.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Work Here */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Work at <span className="text-orange-600">Marketdotcom</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building something meaningful that impacts thousands of families across Nigeria
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-200">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-orange-600 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Locations */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
              Our Locations
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Join Us at Our <span className="text-orange-600">Stores</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're expanding! Check out our store locations and apply to join our growing team
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Sydney Store - USA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">SYDNEY STORE</h3>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 mb-6">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 font-medium">1234 Market Street</p>
                      <p className="text-gray-600">Suite 200</p>
                      <p className="text-gray-600">New York, NY 10001</p>
                      <p className="text-gray-600">United States</p>
                    </div>
                  </div>
                  <Link href="/about/career-benefits/apply">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Apply Here
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Halifax Store - Canada */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">HALIFAX STORE</h3>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 mb-6">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 font-medium">368 Lacewood Drive</p>
                      <p className="text-gray-600">Halifax, NS B3M 2N7</p>
                      <p className="text-gray-600">Canada</p>
                    </div>
                  </div>
                  <Link href="/about/career-benefits/apply">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                      Apply Here
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Join Our Team?
            </h2>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              We're always looking for talented individuals who share our passion for making shopping better for everyone
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg font-semibold">
                  View Open Positions
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-6 text-lg font-semibold">
                  Learn More About Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
