"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Sarah O.",
    role: "Student, UI",
    text: "Marketdotcom has transformed how I shop for groceries. The thrift plan is a game-changer for my monthly budget!",
    rating: 5,
    image: "/sarah.jpeg"
  },
  {
    name: "Michael T.",
    role: "Family Man",
    text: "The quality of foodstuff is always top-notch, and delivery is prompt. Best decision I made for my family!",
    rating: 5,
    image: "/michael.jpeg"
  },
  {
    name: "Ben A.",
    role: "NYSC Member",
    text: "As a corp member, the student packages have been a lifesaver. Affordable and convenient!",
    rating: 5,
    image: "/ben.jpeg"
  },
  {
    name: "Grace K.",
    role: "Working Professional",
    text: "The personal shopping service saves me so much time. Fresh produce delivered right to my door!",
    rating: 5,
    image: "/grace.jpeg"
  },
  {
    name: "David L.",
    role: "Restaurant Owner",
    text: "Consistent quality and reliable delivery. Marketdotcom is now our primary supplier for fresh ingredients.",
    rating: 5,
    image: "/david.jpeg"
  }
]

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change testimonial every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    )
    setIsAutoPlaying(false) // Pause auto-play when user interacts
  }

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    )
    setIsAutoPlaying(false) // Pause auto-play when user interacts
  }

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false) // Pause auto-play when user interacts
  }

  return (
    <div className="relative max-w-4xl mx-auto px-4">
      {/* Main Testimonial Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-orange-100 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-50 to-transparent rounded-full transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-50 to-transparent rounded-full transform -translate-x-16 translate-y-16"></div>

        {/* Navigation Arrows */}
        <button
          onClick={prevTestimonial}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-orange-200"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5 text-orange-600" />
        </button>

        <button
          onClick={nextTestimonial}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border border-orange-200"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5 text-orange-600" />
        </button>

        <div className="relative z-10 px-12 md:px-16">
          {/* Quote Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-orange-100 p-4 rounded-full">
              <Quote className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          {/* Testimonial Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="text-center"
            >
              {/* Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <Star className="h-5 w-5 text-yellow-400 fill-current mx-0.5" />
                  </motion.div>
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-xl md:text-2xl text-gray-700 font-medium mb-8 leading-relaxed italic mx-auto max-w-3xl">
                "{testimonials[currentIndex].text}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-orange-200 shadow-lg flex-shrink-0">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-lg">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-orange-600 font-medium">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-8 space-x-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => goToTestimonial(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-orange-600 scale-125"
                : "bg-orange-200 hover:bg-orange-300"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6 max-w-md mx-auto">
        <div className="bg-orange-100 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-orange-600 h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: isAutoPlaying ? "100%" : "0%" }}
            transition={{
              duration: isAutoPlaying ? 5 : 0.3,
              ease: "linear"
            }}
            key={currentIndex} // Reset animation when testimonial changes
          />
        </div>
      </div>
    </div>
  )
}
