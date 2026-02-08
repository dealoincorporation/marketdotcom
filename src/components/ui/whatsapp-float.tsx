"use client"

import { MessageCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

export function WhatsAppFloat() {
  const whatsappNumber = "08138353576"
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/^0/, '234')}`

  const [showModal, setShowModal] = useState(false)
  const [hasShownInitial, setHasShownInitial] = useState(false)

  // Modal appears only once per session after 30 seconds, for 10 seconds
  useEffect(() => {
    // Check if modal has already been shown in this session
    const modalShown = localStorage.getItem('whatsappModalShown')
    if (modalShown === 'true') {
      return // Don't show again in this session
    }

    // Show modal once after 30 seconds (increased from 5)
    const initialTimer = setTimeout(() => {
      setShowModal(true)
      setHasShownInitial(true)
      localStorage.setItem('whatsappModalShown', 'true')

      // Hide after 10 seconds (increased from 8)
      setTimeout(() => setShowModal(false), 10000)
    }, 30000) // Increased from 5 seconds to 30 seconds

    return () => {
      clearTimeout(initialTimer)
    }
  }, [])

  return (
    <>
      {/* WhatsApp Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.4
            }}
            className="fixed bottom-24 right-6 z-50 max-w-xs"
          >
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl border border-green-400/20 p-4 relative">
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
              >
                <X className="w-3 h-3 text-white" />
              </button>

              {/* Content */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1">
                    Need help? Chat with us! 💬
                  </h3>
                  <p className="text-green-100 text-xs leading-relaxed">
                    We're here to help you with your shopping experience
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full bg-white text-green-600 font-medium text-sm py-2 px-4 rounded-lg hover:bg-green-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(false)}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Start Chat</span>
              </motion.a>

              {/* Decorative elements */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Chat bubble tail */}
            <div className="absolute bottom-0 right-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-green-600"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Float Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-24 right-6 z-50"
      >
        {/* Online Indicator */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"
        />

        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(false)} // Hide modal when clicked
        >
          <MessageCircle className="h-7 w-7" />

          {/* Pulse effect */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-green-400 rounded-full"
          />
        </motion.a>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat on WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </motion.div>
    </>
  )
}