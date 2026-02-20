"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  HelpCircle,
  ShoppingCart,
  Package,
  Truck,
  Wallet,
  CreditCard,
  User,
  MessageCircle,
  Phone,
  Mail,
  Search,
  CheckCircle,
  Clock,
  Shield,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronRight
} from "lucide-react"

export default function HelpPage() {
  const categories = [
    {
      icon: ShoppingCart,
      title: "Shopping & Orders",
      color: "from-blue-500 to-cyan-600",
      questions: [
        {
          question: "How do I place an order?",
          answer: "Browse our marketplace, add items to your cart, and proceed to checkout. You can pay via bank transfer, card, or mobile money. Once payment is confirmed, we'll process and deliver your order."
        },
        {
          question: "Can I modify or cancel my order?",
          answer: "You can modify or cancel your order within 1 hour of placing it. After that, contact our support team immediately. Once your order is being processed, cancellation may not be possible."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept bank transfers, debit/credit cards, and mobile money payments. All payments are secure and processed through our payment partners."
        },
        {
          question: "How do I track my order?",
          answer: "Once your order is confirmed, you'll receive a tracking number via SMS and email. You can also track your order in your dashboard under 'Orders'."
        }
      ]
    },
    {
      icon: Package,
      title: "Products & Delivery",
      color: "from-green-500 to-emerald-600",
      questions: [
        {
          question: "What areas do you deliver to?",
          answer: "We deliver to major cities across Nigeria. Check our delivery coverage when placing an order, or contact us to confirm delivery to your area."
        },
        {
          question: "How long does delivery take?",
          answer: "Standard delivery takes 2-5 business days. Express delivery is available for same-day or next-day delivery in select areas. Delivery times may vary based on your location."
        },
        {
          question: "What if I receive a damaged or wrong item?",
          answer: "Contact us within 24 hours of delivery with photos of the issue. We'll arrange a replacement or refund. Our quality guarantee ensures you're satisfied with your purchase."
        },
        {
          question: "Do you offer bulk orders?",
          answer: "Yes! We offer customized bulk packages for families, businesses, and events. Contact our sales team to discuss your bulk order requirements and get special pricing."
        }
      ]
    },
    {
      icon: Wallet,
      title: "Thrift Plans & Savings",
      color: "from-purple-500 to-pink-600",
      questions: [
        {
          question: "How do thrift savings plans work?",
          answer: "Choose a daily or monthly savings amount (starting from ₦450/day). We lock in current market prices for your bundle. At the end of your savings period, you receive a well-packaged food bundle at the locked-in price."
        },
        {
          question: "Can I withdraw my savings early?",
          answer: "Yes, early withdrawal options are available. However, you may forfeit some benefits like price protection. Contact support to discuss your options."
        },
        {
          question: "What happens if prices go up during my plan?",
          answer: "That's the benefit of our thrift plans! We lock in prices when you start, so even if market prices increase, you pay the original locked-in price."
        },
        {
          question: "How do I start a thrift plan?",
          answer: "Sign up for an account, go to 'Thrift Plans' in your dashboard, choose your savings amount and duration, and start saving. You can track your progress anytime."
        }
      ]
    },
    {
      icon: User,
      title: "Account & Profile",
      color: "from-orange-500 to-red-600",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Click 'Sign Up' on our homepage, fill in your details, verify your email, and you're ready to start shopping! Registration is free and takes less than 2 minutes."
        },
        {
          question: "I forgot my password. How do I reset it?",
          answer: "Click 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your email to reset your password."
        },
        {
          question: "How do I update my profile information?",
          answer: "Go to your dashboard, click on your profile, and update your information. Make sure to save your changes."
        },
        {
          question: "Can I have multiple addresses?",
          answer: "Yes! You can save multiple delivery addresses in your account. Set one as default for faster checkout."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Payments & Refunds",
      color: "from-yellow-500 to-amber-600",
      questions: [
        {
          question: "Is my payment information secure?",
          answer: "Absolutely! We use industry-standard encryption and secure payment gateways. We never store your full card details on our servers."
        },
        {
          question: "How long do refunds take?",
          answer: "Refunds are processed within 3-5 business days after approval. The money will be returned to your original payment method."
        },
        {
          question: "What is your refund policy?",
          answer: "We offer refunds for damaged, incorrect, or undelivered items. Contact us within 24 hours of delivery with details and photos."
        },
        {
          question: "Do you offer payment plans?",
          answer: "Yes! Our thrift plans allow you to save gradually and pay in installments. We also offer flexible payment options for bulk orders."
        }
      ]
    },
    {
      icon: MessageCircle,
      title: "Support & Contact",
      color: "from-indigo-500 to-blue-600",
      questions: [
        {
          question: "How can I contact customer support?",
          answer: "You can reach us via phone, email, or live chat. Our support team is available Monday-Saturday, 8 AM - 6 PM. Check the contact section below for details."
        },
        {
          question: "Do you have a physical store?",
          answer: "We're primarily an online marketplace, but we have pickup locations in select cities. Check your dashboard for nearby pickup points."
        },
        {
          question: "Can I schedule a call with support?",
          answer: "Yes! You can request a callback through your dashboard or contact us to schedule a convenient time for a support call."
        },
        {
          question: "What are your support hours?",
          answer: "Our customer support team is available Monday through Saturday, 8:00 AM to 6:00 PM WAT. We respond to emails within 24 hours."
        }
      ]
    }
  ]

  const quickLinks = [
    { title: "Track Your Order", href: "/dashboard", icon: Truck },
    { title: "View Your Cart", href: "/dashboard?tab=marketplace", icon: ShoppingCart },
    { title: "Manage Account", href: "/dashboard", icon: User },
    { title: "Thrift Plans", href: "/dashboard", icon: Wallet }
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
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Help Center
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
              We're Here to Help
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              How Can We <span className="text-orange-600">Help You?</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={link.href}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-gray-200 hover:border-orange-200 cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg mb-3">
                          <Icon className="h-6 w-6 text-orange-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{link.title}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
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
              Frequently Asked <span className="text-orange-600">Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse questions by category to find what you're looking for
            </p>
          </motion.div>

          <div className="space-y-8">
            {categories.map((category, categoryIndex) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={categoryIndex}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-2 border-gray-200 hover:shadow-xl transition-all duration-300">
                    <CardHeader className={`bg-gradient-to-r ${category.color} text-white`}>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Icon className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl">{category.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {category.questions.map((faq, faqIndex) => (
                          <div key={faqIndex} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                              <HelpCircle className="h-5 w-5 text-orange-600" />
                              {faq.question}
                            </h3>
                            <p className="text-gray-700 leading-relaxed pl-7">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Still Need <span className="text-orange-600">Help?</span>
            </h2>
            <p className="text-xl text-gray-600">
              Our support team is ready to assist you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 hover:border-orange-200">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full mb-4">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
                <p className="text-gray-600 mb-4">Speak directly with our team</p>
                <p className="text-orange-600 font-semibold">+234 813 835 3576</p>
                <p className="text-sm text-gray-500 mt-2">Mon-Sat, 8 AM - 6 PM</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 hover:border-orange-200">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600 mb-4">Send us a message anytime</p>
                <p className="text-orange-600 font-semibold">marketdotcominfo@gmail.com</p>
                <p className="text-sm text-gray-500 mt-2">We reply within 24 hours</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-200 hover:border-orange-200">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with us in real-time</p>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Start Chat
                </Button>
                <p className="text-sm text-gray-500 mt-2">Available during business hours</p>
              </CardContent>
            </Card>
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
              Ready to Start Shopping?
            </h2>
            <p className="text-xl text-orange-100 mb-10 max-w-2xl mx-auto">
              Browse our marketplace and discover quality products at great prices
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg font-semibold">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Visit Marketplace
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-6 text-lg font-semibold">
                  Create Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
