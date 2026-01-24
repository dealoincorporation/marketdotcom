"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  ShoppingBag,
  PiggyBank,
  Store,
  Truck,
  Shield,
  Heart,
  Users,
  Award,
  Clock,
  Calendar,
  CheckCircle,
  Zap,
  Target,
  Eye,
  Leaf,
  DollarSign,
  Package,
  TrendingUp
} from "lucide-react"

export default function AboutPage() {
  const coreValues = [
    {
      icon: Shield,
      title: "Quality Experience",
      description: "We source only the freshest produce and highest quality products from trusted suppliers, ensuring every item meets our strict quality standards before reaching your doorstep."
    },
    {
      icon: DollarSign,
      title: "Affordability",
      description: "Through our smart pricing and thrift savings plans, we make quality food accessible to every household without compromising on freshness or value."
    },
    {
      icon: Zap,
      title: "Convenience",
      description: "Say goodbye to crowded markets and long queues. Shop from anywhere, anytime, and have everything delivered fresh to your door—saving you time for what matters most."
    },
    {
      icon: Heart,
      title: "Customer-Centric",
      description: "Your satisfaction is our priority. We listen, adapt, and continuously improve our services to meet your evolving needs and exceed your expectations."
    }
  ]

  const services = [
    {
      icon: PiggyBank,
      title: "Thrift Savings Plans",
      description: "Our innovative daily and monthly thrift plans allow you to save gradually, making quality food more affordable. Plan ahead, beat price hikes, and receive well-packaged bundles delivered monthly or during festive periods—all without disrupting your budget.",
      features: [
        "Daily savings starting from ₦450/day",
        "Monthly food bundles",
        "Festive period packages",
        "Price protection against inflation",
        "Flexible payment options"
      ],
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Store,
      title: "Personal Shopping Services",
      description: "We shop on your behalf—so you don't have to. Our expert team carefully sources fresh produce, packaged goods, and processed food items from trusted local markets and suppliers, ensuring quality, fair pricing, and reliable delivery every time.",
      features: [
        "Expert market sourcing",
        "Quality assurance checks",
        "Fair pricing guarantee",
        "Reliable delivery",
        "Custom shopping lists"
      ],
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Package,
      title: "Customized Food Packages",
      description: "Tailored to your family's needs and preferences, our customized food packages help you plan ahead and access fresh food without disruption. Whether it's weekly essentials or monthly bulk orders, we create packages that fit your lifestyle.",
      features: [
        "Personalized meal planning",
        "Family-size packages",
        "Dietary preferences",
        "Regular delivery schedules",
        "Budget-friendly options"
      ],
      gradient: "from-purple-500 to-pink-600"
    }
  ]

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "No more spending hours in crowded markets. Shop in minutes and get back to your life."
    },
    {
      icon: TrendingUp,
      title: "Save Money",
      description: "Beat price hikes with our thrift plans and get better value through bulk purchasing."
    },
    {
      icon: Leaf,
      title: "Fresh Quality",
      description: "Every product is carefully selected and delivered fresh, ensuring the best quality for your family."
    },
    {
      icon: Calendar,
      title: "Plan Ahead",
      description: "With our savings plans and scheduled deliveries, you can plan your monthly food budget with confidence."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                About Marketdotcom
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                Our Story
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                About <span className="text-orange-600">Marketdotcom</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed">
                Marketdotcom was founded to solve the common problem of time-consuming, fragmented monthly food shopping. By consolidating all essential items in one place, we aim to provide convenience, affordability and quality experience.
              </p>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                Through our thrift savings plans, personal shopping services, and customized food packages, customers can plan ahead, save gradually, and access fresh food without disruption.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/marketplace">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Start Shopping
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="border-2 border-orange-300 hover:bg-orange-50 px-8 py-6 text-lg">
                    Join Our Community
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/360_F_382021894_YgVpXsRuwFr6lbSqa4uSzDiR9YLqqdtF.jpg"
                  alt="Fresh produce and groceries"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
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
              What We <span className="text-orange-600">Stand For</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values guide everything we do, ensuring you get the best shopping experience possible
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => {
              const Icon = value.icon
              const images = [
                "/Whisk_34cbee6023de4bd9f724eedd0213ceeedr.png",
                "/Whisk_028e78c5d80daa68aef4fbe5670db5f4dr.png",
                "/Whisk_4e949716576ebe0a3b24c9c7ce062b42dr.png",
                "/360_F_382021894_YgVpXsRuwFr6lbSqa4uSzDiR9YLqqdtF.jpg"
              ]
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-200 overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={images[index % images.length]}
                        alt={value.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl mb-4 -mt-8 relative z-10">
                        <Icon className="h-8 w-8 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Our Services */}
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
              Our Solutions
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How We <span className="text-orange-600">Help You</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive solutions designed to make your food shopping experience seamless and affordable
            </p>
          </motion.div>

          <div className="space-y-12">
            {services.map((service, index) => {
              const Icon = service.icon
              const serviceImages = [
                "/Whisk_34cbee6023de4bd9f724eedd0213ceeedr.png",
                "/Whisk_028e78c5d80daa68aef4fbe5670db5f4dr.png",
                "/Whisk_4e949716576ebe0a3b24c9c7ce062b42dr.png"
              ]
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden border-2 border-gray-200 hover:shadow-2xl transition-all duration-300">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={serviceImages[index % serviceImages.length]}
                          alt={service.title}
                          className="w-full h-full object-cover min-h-[300px]"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-r ${service.gradient} opacity-80`}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white relative z-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                              <Icon className="h-10 w-10" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4">{service.title}</h3>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-8 md:p-12">
                        <p className="text-lg text-gray-700 mb-6 leading-relaxed">{service.description}</p>
                        <ul className="space-y-3">
                          {service.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start space-x-3">
                              <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Why Choose <span className="text-orange-600">Marketdotcom</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the benefits of smart shopping with our comprehensive platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-orange-200">
                    <CardContent className="p-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl mb-4">
                        <Icon className="h-8 w-8 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="/360_F_382021894_YgVpXsRuwFr6lbSqa4uSzDiR9YLqqdtF.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative mb-6 rounded-xl overflow-hidden">
                <img
                  src="/Whisk_028e78c5d80daa68aef4fbe5670db5f4dr.png"
                  alt="Our Vision"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-orange-600/20 rounded-xl backdrop-blur-sm">
                      <Eye className="h-8 w-8 text-orange-400" />
                    </div>
                    <h2 className="text-3xl font-bold">Our Vision</h2>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                To become Nigeria's most trusted platform for convenient and timely grocery and food essentials shopping, combined with smart savings solutions that help households plan ahead and access quality food without disruption.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative mb-6 rounded-xl overflow-hidden">
                <img
                  src="/Whisk_4e949716576ebe0a3b24c9c7ce062b42dr.png"
                  alt="Our Mission"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-orange-600/20 rounded-xl backdrop-blur-sm">
                      <Target className="h-8 w-8 text-orange-400" />
                    </div>
                    <h2 className="text-3xl font-bold">Our Mission</h2>
                  </div>
                </div>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed">
                To deliver a reliable and convenient platform that enables Nigerian households to purchase groceries and food essentials effortlessly, receive orders on time, and build disciplined savings for their everyday and seasonal food needs—through trusted vendors, efficient logistics, and a mobile-first digital experience.
              </p>
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
              Ready to Transform Your Shopping Experience?
            </h2>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have discovered the convenience of smart shopping with Marketdotcom
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg font-semibold">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Start Shopping Now
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-6 text-lg font-semibold">
                  Join Our Community
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
