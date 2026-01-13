"use client"

import { MessageCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export function WhatsAppFloat() {
  const [showModal, setShowModal] = useState(false)
  const whatsappNumber = "08138353576"
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/^0/, '234')}`

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50"
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

        <motion.button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
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
        </motion.button>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          We're online! Chat with us
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowModal(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Marketdotcom Support</h3>
                    <div className="flex items-center space-x-2">
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
                        className="w-2 h-2 bg-green-300 rounded-full"
                      />
                      <span className="text-sm opacity-90">We're online now!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    Chat with us live! 💬
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Get instant help with your orders, payments, or any questions about our fresh groceries and services.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>24/7 Customer Support</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Instant Order Assistance</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-700">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Expert Product Recommendations</span>
                  </div>
                </div>

                <motion.a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold text-center block hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                >
                  Start Chat Now 🚀
                </motion.a>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Response time: Usually within 2 minutes
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}