"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImageSlider } from "@/components/image-slider"
import {
  ArrowLeft,
  ShoppingCart,
  PiggyBank,
  Package,
  Truck,
  Shield,
  CheckCircle,
  Clock,
  DollarSign,
  Heart,
  Zap,
  Star,
  Users,
  TrendingUp,
  Calendar,
  Store,
  Leaf,
  Award,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react"

const HERO_IMAGES = [
  "/hero/hero-image_one.jpeg",
  "/hero/hero-image_two.jpeg",
  "/hero/hero-image_three.jpeg",
  "/hero/hero-image_four.jpeg",
  "/hero/hero-image_five.jpeg",
  "/hero/hero-image_six.jpeg",
]

export default function ServicesPage() {
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
        "Flexible payment options",
        "Automatic savings tracking",
        "Early withdrawal options"
      ],
      gradient: "from-green-500 to-emerald-600",
      bgImage: "/hero/hero-image_one.jpeg",
      benefits: [
        "Beat inflation with locked-in prices",
        "Build disciplined savings habits",
        "Receive quality bundles at discounted rates",
        "Plan your monthly food budget with confidence"
      ],
      howItWorks: [
        "Choose your daily or monthly savings amount",
        "Set your savings duration (30, 60, or 90 days)",
        "We lock in current market prices for your bundle",
        "Receive your well-packaged food bundle at the end of your plan"
      ]
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
        "Custom shopping lists",
        "Same-day or scheduled delivery",
        "Real-time order tracking"
      ],
      gradient: "from-blue-500 to-cyan-600",
      bgImage: "/hero/hero-image_two.jpeg",
      benefits: [
        "Save hours of shopping time",
        "Access to best market prices",
        "Quality guaranteed products",
        "Convenient doorstep delivery"
      ],
      howItWorks: [
        "Submit your shopping list via app or call",
        "Our team sources items from trusted suppliers",
        "Quality check and price verification",
        "Fresh delivery to your doorstep"
      ]
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
        "Budget-friendly options",
        "Nutritional balance",
        "Variety in every package"
      ],
      gradient: "from-purple-500 to-pink-600",
      bgImage: "/hero/hero-image_three.jpeg",
      benefits: [
        "Packages tailored to your family size",
        "Accommodate dietary restrictions",
        "Consistent quality and freshness",
        "Better value through bulk pricing"
      ],
      howItWorks: [
        "Tell us your family size and preferences",
        "We create a customized package plan",
        "Review and approve your package",
        "Receive regular deliveries on schedule"
      ]
    },
    {
      icon: Truck,
      title: "Express Delivery",
      description: "Need your groceries fast? Our express delivery service ensures you get your orders delivered within hours, not days. Perfect for urgent needs or last-minute shopping.",
      features: [
        "Same-day delivery available",
        "2-4 hour delivery window",
        "Real-time tracking",
        "SMS notifications",
        "Contactless delivery option",
        "Multiple delivery slots",
        "Priority customer support"
      ],
      gradient: "from-orange-500 to-red-600",
      bgImage: "/hero/hero-image_four.jpeg",
      benefits: [
        "Get what you need when you need it",
        "No more waiting days for delivery",
        "Track your order in real-time",
        "Flexible delivery time slots"
      ],
      howItWorks: [
        "Place your order before 2 PM",
        "Select express delivery option",
        "Track your order in real-time",
        "Receive within 2-4 hours"
      ]
    }
  ]

  const whyChooseUs = [
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "Every product is carefully selected and quality-checked before delivery"
    },
    {
      icon: DollarSign,
      title: "Best Prices",
      description: "We negotiate directly with suppliers to bring you the best market prices"
    },
    {
      icon: Clock,
      title: "Time Saving",
      description: "Save hours of shopping time and focus on what matters most"
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our priority. We're here to serve you better"
    }
  ]

  const faqs = [
    {
      question: "How do thrift savings plans work?",
      answer: "You choose a daily or monthly savings amount (starting from ₦450/day). We lock in current market prices for your bundle, and at the end of your savings period, you receive a well-packaged food bundle at the locked-in price, protecting you from inflation."
    },
    {
      question: "What areas do you deliver to?",
      answer: "We currently deliver to major cities in Nigeria. Check our delivery coverage when placing an order, or contact us to confirm delivery to your area."
    },
    {
      question: "How do I start a thrift plan?",
      answer: "Simply sign up, choose your savings amount and duration, and start saving. You can track your progress in your dashboard and receive your bundle at the end of your plan."
    },
    {
      question: "Can I customize my food package?",
      answer: "Yes! Our customized food packages are tailored to your family size, dietary preferences, and budget. Contact us to create your personalized package plan."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept bank transfers, card payments, and mobile money. Payment options are available during checkout."
    },
    {
      question: "How fresh are the products?",
      answer: "We source directly from trusted suppliers and markets, ensuring all products are fresh. Our quality assurance team checks every order before delivery."
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
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Our Services
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
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                What We Offer
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Our <span className="text-orange-600">Services</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Comprehensive solutions designed to make your food shopping experience seamless, affordable, and convenient. From thrift savings plans to personal shopping, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/marketplace">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Start Shopping
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" variant="outline" className="border-2 border-orange-300 hover:bg-orange-50 px-8 py-6 text-lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Hero images slider */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-lg mx-auto lg:max-w-none"
            >
              <ImageSlider
                images={HERO_IMAGES}
                className="h-72 sm:h-80 lg:h-96 w-full rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
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
              What We <span className="text-orange-600">Offer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our range of services designed to meet your unique shopping needs
            </p>
          </motion.div>

          <div className="space-y-12">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden border-2 border-gray-200 hover:shadow-2xl transition-all duration-300">
                    <div className="grid md:grid-cols-3 gap-0">
                      {/* Icon Section with hero image background */}
                      <div
                        className="relative p-8 md:p-12 flex items-center justify-center min-h-[240px] md:min-h-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${service.bgImage})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />
                        <div className="relative z-10 text-center text-white">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
                            <Icon className="h-10 w-10" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-bold drop-shadow-lg">{service.title}</h3>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="md:col-span-2 p-8 md:p-12">
                        <p className="text-lg text-gray-700 mb-6 leading-relaxed">{service.description}</p>
                        
                        {/* Features */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4 text-orange-600" />
                            Key Features
                          </h4>
                          <ul className="grid sm:grid-cols-2 gap-2">
                            {service.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-start space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Benefits */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Award className="h-4 w-4 text-orange-600" />
                            Benefits
                          </h4>
                          <ul className="space-y-2">
                            {service.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex} className="flex items-start space-x-2">
                                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* How It Works */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-orange-600" />
                            How It Works
                          </h4>
                          <ol className="space-y-2">
                            {service.howItWorks.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start space-x-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {stepIndex + 1}
                                </span>
                                <span className="text-gray-700 text-sm">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="text-orange-600">Our Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to delivering excellence in every aspect of our service
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon
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
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked <span className="text-orange-600">Questions</span>
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-2 border-gray-200">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-orange-600" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 leading-relaxed pl-7">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              Ready to Get Started?
            </h2>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have transformed their shopping experience with Marketdotcom
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg font-semibold">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Start Shopping Now
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-6 text-lg font-semibold">
                  Create Account
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-orange-100 flex-wrap">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span>Call us: +234 813 835 3576</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <span>Email: marketdotcominfo@gmail.com</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
