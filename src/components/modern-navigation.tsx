"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react"

export function ModernNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout, isLoading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    logout()
    setIsOpen(false)
  }

  const navItems = [
    { name: "Marketplace", href: "/marketplace", external: true },
    { name: "About", href: "#about", external: false },
    { name: "Services", href: "#services", external: false },
    { name: "Testimonials", href: "#testimonials", external: false },
  ]

  const handleNavClick = (href: string, external: boolean) => {
    if (!external && href.startsWith("#")) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
    setIsOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl shadow-2xl border-b border-white/30"
          : "bg-transparent backdrop-blur-sm"
      }`}
      style={{
        background: isScrolled
          ? 'rgba(255, 255, 255, 0.9)'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'blur(4px)',
        WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'blur(4px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/" className="flex items-center space-x-3 group">
              <img
                src="/mrktdotcom-logo.png"
                alt="Marketdotcom Logo"
                className="h-24 w-24 object-contain"
              />
              <div>
                <span className={`text-xl lg:text-2xl font-bold transition-colors ${
                isScrolled ? 'text-gray-900 group-hover:text-orange-600' : 'text-gray-900 group-hover:text-orange-600'
              }`}>
                  Marketdotcom
                </span>
                <div className={`text-xs -mt-1 hidden sm:block ${
                  isScrolled ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  Smart Shopping Solutions
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {item.external ? (
                  <Link
                    href={item.href}
                    className={`relative px-4 py-2 font-medium transition-colors group ${
                      isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-700 hover:text-orange-600'
                    }`}
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                ) : (
                  <button
                    onClick={() => handleNavClick(item.href, item.external)}
                    className={`relative px-4 py-2 font-medium transition-colors group cursor-pointer ${
                      isScrolled ? 'text-gray-700 hover:text-orange-600' : 'text-gray-700 hover:text-orange-600'
                    }`}
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300"></span>
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center space-x-2"
                >
                  <div className="text-sm text-gray-600">
                    Hi, {user?.name?.split(' ')[0] || 'User'}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50 font-medium"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 font-medium"
                    >
                      Sign In
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Link href="/auth/register">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-6">
                      Get Started
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors cursor-pointer ${
              isScrolled
                ? 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
            }`}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white/90 backdrop-blur-xl border-t border-white/30 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  {item.external ? (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleNavClick(item.href, item.external)}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      {item.name}
                    </button>
                  )}
                </motion.div>
              ))}

              {/* Mobile CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="pt-4 border-t border-gray-200 space-y-3"
              >
                {user ? (
                  <>
                    <div className="px-4 py-2 text-center text-gray-600 font-medium">
                      Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                    </div>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full justify-center border-red-300 text-red-700 hover:bg-red-50 font-medium"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full justify-center border-orange-300 text-orange-700 hover:bg-orange-50 font-medium"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-center bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Mobile Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-orange-600">370+</div>
                    <div className="text-xs text-gray-600">Shoppers</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">4.9★</div>
                    <div className="text-xs text-gray-600">Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">98%</div>
                    <div className="text-xs text-gray-600">Satisfied</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
