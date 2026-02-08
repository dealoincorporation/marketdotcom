'use client'

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, Instagram, Linkedin, MessageCircle, Users } from "lucide-react"

export function Footer() {
  const [subscriptionEmail, setSubscriptionEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState("")
  const [subscriptionError, setSubscriptionError] = useState("")
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | null;
  }>({ isValid: false, message: "", type: null })

  // Enhanced email validation function
  const validateEmail = (email: string) => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      return { isValid: false, message: "", type: null }
    }

    // Basic email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(trimmedEmail)) {
      return {
        isValid: false,
        message: "Please enter a valid email address",
        type: 'error' as const
      }
    }

    // Check for common email issues
    const localPart = trimmedEmail.split('@')[0]
    const domain = trimmedEmail.split('@')[1]

    if (localPart.length > 64) {
      return {
        isValid: false,
        message: "Email address is too long",
        type: 'error' as const
      }
    }

    if (domain.includes('..')) {
      return {
        isValid: false,
        message: "Invalid email domain format",
        type: 'error' as const
      }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /noreply/i,
      /no-reply/i,
      /admin/i,
      /test/i,
      /example/i,
      /temp/i,
      /fake/i
    ]

    const hasSuspiciousPattern = suspiciousPatterns.some(pattern =>
      trimmedEmail.match(pattern)
    )

    if (hasSuspiciousPattern) {
      return {
        isValid: true,
        message: "Please use a personal email address for newsletters",
        type: 'warning' as const
      }
    }

    // Check for popular email providers (generally good sign)
    const popularDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
    const isPopularDomain = popularDomains.some(pd => domain.toLowerCase().includes(pd))

    if (isPopularDomain) {
      return {
        isValid: true,
        message: "Valid email format",
        type: 'success' as const
      }
    }

    // Generic domain - still valid but let user know
    return {
      isValid: true,
      message: "Email format looks good",
      type: 'success' as const
    }
  }

  // Handle email input changes with real-time validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setSubscriptionEmail(email)
    const validation = validateEmail(email)
    setEmailValidation(validation)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedEmail = subscriptionEmail.trim()
    if (!trimmedEmail) {
      setEmailValidation({
        isValid: false,
        message: "Email address is required",
        type: 'error'
      })
      return
    }

    // Final validation check
    const validation = validateEmail(trimmedEmail)
    if (!validation.isValid && validation.type === 'error') {
      setEmailValidation(validation)
      return
    }

    setIsSubscribing(true)
    setSubscriptionError("")
    setSubscriptionMessage("")
    setEmailValidation({ isValid: false, message: "", type: null })

    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          source: "FOOTER",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubscriptionMessage(data.message)
        setSubscriptionEmail("")
        setEmailValidation({ isValid: false, message: "", type: null })
      } else {
        setSubscriptionError(data.error || "Something went wrong")
      }
    } catch (error) {
      setSubscriptionError("Network error. Please try again.")
    } finally {
      setIsSubscribing(false)
    }
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden mt-auto">
      {/* Background Elements */}
      <motion.div className="absolute inset-0">
        <motion.div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-600/5 to-transparent"></motion.div>
        <motion.div className="absolute top-20 right-20 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></motion.div>
        <motion.div className="absolute bottom-20 left-20 w-80 h-80 bg-yellow-500/3 rounded-full blur-3xl"></motion.div>
      </motion.div>

      <motion.div className="relative z-10">
        {/* Main Footer Content */}
        <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div className="grid lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <motion.div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div className="flex items-center space-x-3 mb-6">
                  <img
                    src="/mrktdotcom-logo.png"
                    alt="Marketdotcom Logo"
                    className="h-24 w-24 object-contain"
                  />
                  <motion.div>
                    <span className="text-2xl font-bold">Marketdotcom</span>
                    <motion.div className="text-sm text-orange-400 font-medium">Smart Shopping Solutions</motion.div>
                  </motion.div>
                </motion.div>

                <p className="text-gray-300 mb-8 leading-relaxed max-w-sm">
                  Connecting farmers, markets, and homes with affordable, quality food—one smart shop at a time.
                </p>

                {/* Social & Contact Links */}
                <motion.div className="flex flex-wrap gap-3">
                  {[
                    { name: "WhatsApp", icon: MessageCircle, href: "https://wa.link/ig48j8" },
                    { name: "WhatsApp Community", icon: Users, href: "https://whatsapp.com/channel/0029VbAyTyFIN9ihlQWcnq3u" },
                    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/marketdotcom.ng?igsh=MWl2MDZ5dDlxbWN4Zw==" },
                    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/marketdotcom-1898093a5/" }
                  ].map((social, index) => {
                    const IconComponent = social.icon
                    return (
                      <motion.a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="bg-gray-800 hover:bg-orange-600 p-3 rounded-xl transition-all duration-300 hover:scale-110 group"
                        aria-label={social.name}
                      >
                        <IconComponent className="h-5 w-5 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                      </motion.a>
                    )
                  })}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Quick Links */}
            <motion.div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold mb-6 relative">
                  Quick Links
                  <motion.div className="absolute bottom-0 left-0 w-8 h-0.5 bg-orange-500"></motion.div>
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: "Marketplace", href: "/marketplace" },
                    { name: "About Us", href: "/about" },
                    { name: "Services", href: "#services" },
                    { name: "Testimonials", href: "#testimonials" },
                    { name: "Sign In", href: "/auth/login" }
                  ].map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith("#") ? (
                        <button
                          onClick={() => {
                            const element = document.querySelector(link.href);
                            if (element) element.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-gray-400 hover:text-orange-400 transition-colors duration-300 hover:translate-x-1 transform"
                        >
                          {link.name}
                        </button>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-orange-400 transition-colors duration-300 hover:translate-x-1 transform inline-block"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>

            {/* Services */}
            <motion.div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold mb-6 relative">
                  Our Services
                  <motion.div className="absolute bottom-0 left-0 w-8 h-0.5 bg-orange-500"></motion.div>
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: "Personal Shopping", href: "#" },
                    { name: "Thrift Plans", href: "#" },
                    { name: "Custom Packages", href: "#" },
                    { name: "Express Delivery", href: "#" },
                    { name: "Bulk Orders", href: "#" }
                  ].map((service) => (
                    <li key={service.name}>
                      <a
                        href={service.href}
                        className="text-gray-400 hover:text-orange-400 transition-colors duration-300 hover:translate-x-1 transform inline-block"
                      >
                        {service.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>

            {/* Contact Info */}
            <motion.div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold mb-6 relative">
                  Get in Touch
                  <motion.div className="absolute bottom-0 left-0 w-8 h-0.5 bg-orange-500"></motion.div>
                </h3>

                <motion.div className="space-y-4">
                  <motion.div className="flex items-start space-x-3">
                    <motion.div className="bg-orange-600/20 p-2 rounded-lg flex-shrink-0">
                      <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </motion.div>
                    <motion.div>
                      <p className="text-gray-300 font-medium">Address</p>
                      <a href="https://maps.google.com/?q=Road+4+Glorious+Estate+Badore+Ajah+Lagos" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-orange-400 transition-colors">
                        Road 4, Glorious Estate, Badore Ajah Lagos State.
                      </a>
                    </motion.div>
                  </motion.div>

                  <motion.div className="flex items-start space-x-3">
                    <motion.div className="bg-orange-600/20 p-2 rounded-lg flex-shrink-0">
                      <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </motion.div>
                    <motion.div>
                      <p className="text-gray-300 font-medium">Phone</p>
                      <a href="tel:+2348138353576" className="text-gray-400 text-sm hover:text-orange-400 transition-colors">08138353576</a>
                    </motion.div>
                  </motion.div>

                  <motion.div className="flex items-start space-x-3">
                    <motion.div className="bg-orange-600/20 p-2 rounded-lg flex-shrink-0">
                      <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    <motion.div>
                      <p className="text-gray-300 font-medium">Email</p>
                      <a href="mailto:marketdotcominfo@gmail.com" className="text-gray-400 text-sm hover:text-orange-400 transition-colors">marketdotcominfo@gmail.com</a>
                    </motion.div>
                  </motion.div>

                  <motion.div className="flex items-start space-x-3">
                    <motion.div className="bg-orange-600/20 p-2 rounded-lg flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-orange-400" />
                    </motion.div>
                    <motion.div>
                      <p className="text-gray-300 font-medium">WhatsApp</p>
                      <a href="https://wa.link/ig48j8" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-orange-400 transition-colors block">
                        Chat with us
                      </a>
                      <a href="https://whatsapp.com/channel/0029VbAyTyFIN9ihlQWcnq3u" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-orange-400 transition-colors block mt-1">
                        Join our Community
                      </a>
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Newsletter Signup */}
                <motion.div className="mt-8 p-4 bg-gradient-to-r from-orange-600/10 to-orange-500/10 rounded-xl border border-orange-500/20">
                  <p className="text-sm font-medium text-gray-300 mb-3">Stay Updated</p>
                  <form onSubmit={handleSubscribe} className="space-y-3" noValidate>
                    <motion.div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="email"
                          placeholder="Your email"
                          value={subscriptionEmail}
                          onChange={handleEmailChange}
                          className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                            emailValidation.type === 'error'
                              ? 'border-red-500 focus:border-red-500'
                              : emailValidation.type === 'success'
                              ? 'border-green-500 focus:border-green-500'
                              : emailValidation.type === 'warning'
                              ? 'border-yellow-500 focus:border-yellow-500'
                              : 'border-gray-700 focus:border-orange-500'
                          }`}
                          aria-label="Email address for newsletter subscription"
                          aria-describedby={emailValidation.message ? "email-validation-message" : undefined}
                          required
                        />
                        {/* Validation Icon */}
                        {emailValidation.type && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {emailValidation.type === 'success' && (
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {emailValidation.type === 'error' && (
                              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            {emailValidation.type === 'warning' && (
                              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={isSubscribing || emailValidation.type === 'error'}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors duration-300 flex items-center gap-2"
                        aria-describedby={isSubscribing ? "subscribing-status" : undefined}
                      >
                        {isSubscribing ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span id="subscribing-status">Subscribing...</span>
                          </>
                        ) : (
                          "Subscribe"
                        )}
                      </button>
                    </motion.div>

                    {/* Validation Message */}
                    {emailValidation.message && (
                      <motion.div
                        id="email-validation-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-xs px-2 py-1 rounded-md ${
                          emailValidation.type === 'error'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : emailValidation.type === 'success'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : emailValidation.type === 'warning'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                            : ''
                        }`}
                      >
                        {emailValidation.message}
                      </motion.div>
                    )}

                    {/* Success/Error Messages */}
                    {subscriptionMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20"
                      >
                        ✓ {subscriptionMessage}
                      </motion.div>
                    )}
                    {subscriptionError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20"
                      >
                        ✗ {subscriptionError}
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div className="border-t border-gray-800">
          <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div className="flex flex-col md:flex-row justify-between items-center">
              <motion.div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-0">
                <p className="text-gray-400 text-sm">
                  © 2025 - 2026 Marketdotcom. All rights reserved.
                </p>
                <motion.div className="flex items-center space-x-4 text-xs text-gray-500">
                  <Link href="/help" className="hover:text-orange-400 transition-colors">Help Center</Link>
                </motion.div>
              </motion.div>

              <motion.div className="flex items-center space-x-4">
                <motion.div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>🇳🇬</span>
                  <span>Nationwide Delivery</span>
                </motion.div>
                <motion.div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Shield className="h-3 w-3" />
                  <span>SSL Secured</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </footer>
  )
}
