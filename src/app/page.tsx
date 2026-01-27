"use client"

import { motion } from "framer-motion"
import { ModernNavigation } from "@/components/modern-navigation"
import { MarketplacePreview } from "@/components/marketplace/MarketplacePreview"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/home/HeroSection"
import { AboutSection } from "@/components/home/AboutSection"
import { ServicesSection } from "@/components/home/ServicesSection"
import { TestimonialsSection } from "@/components/home/TestimonialsSection"
import { AdvertSection } from "@/components/home/AdvertSection"
import { VisionSection } from "@/components/home/VisionSection"
import { CTASection } from "@/components/home/CTASection"

export default function Home() {
  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Modern Navigation */}
      <ModernNavigation />

      {/* Hero Section */}
      <HeroSection />

      {/* Marketplace Preview */}
      <MarketplacePreview />

      {/* About Section */}
      <AboutSection />

      {/* Services Section */}
      <ServicesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Advert Section */}
      <AdvertSection />

      {/* Vision Section */}
      <VisionSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </motion.div>
  )
}
