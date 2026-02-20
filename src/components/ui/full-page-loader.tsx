"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center"
      >
        {/* Logo with smooth pulsing/flickering animation */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
            filter: [
              "brightness(1)",
              "brightness(1.2)",
              "brightness(1)",
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-6 relative"
        >
          <Image
            src="/mrktdotcom-logo.png"
            alt="Marketdotcom Logo"
            width={140}
            height={140}
            className="object-contain drop-shadow-lg"
            priority
          />
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Loading dots with smooth animation */}
        <div className="flex space-x-2.5">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2.5 h-2.5 bg-orange-600 rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
                y: [0, -4, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.15,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
