"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Lock, Eye, FileText, Mail, Bell, Globe, Database } from "lucide-react"
import { Footer } from "@/components/footer"
import { ModernNavigation } from "@/components/modern-navigation"

export default function PrivacyPage() {
    const sections = [
        {
            icon: Eye,
            title: "Information We Collect",
            content: "We collect information you provide directly to us when you create an account, place an order, or subscribe to our newsletter. This includes your name, email address, phone number, delivery address, and payment preferences. We also automatically collect certain information about your device and how you interact with our marketplace to improve your shopping experience."
        },
        {
            icon: Database,
            title: "How We Use Your Data",
            content: "Your information is used to process and deliver your orders, manage your thrift savings plans, and provide personalized personal shopping services. We also use your data to communicate with you about your orders, send you important updates, and with your consent, share newsletters and promotional offers that might interest you."
        },
        {
            icon: Lock,
            title: "Data Security",
            content: "We implement industry-standard security measures to protect your personal information. This includes SSL encryption for all data transmissions and secure payment processing through our certified partners. While we strive to protect your data, no method of transmission over the internet is 100% secure, and we encourage you to use strong passwords for your account."
        },
        {
            icon: Globe,
            title: "Third-Party Sharing",
            content: "We do not sell your personal data. We only share information with trusted third-party partners who help us operate our platform—specifically logistics providers for deliveries and payment processors for transactions. These partners are obligated to protect your data and only use it for the specific purposes we define."
        },
        {
            icon: Bell,
            title: "Your Privacy Rights",
            content: "You have the right to access, update, or delete your personal information at any time through your account dashboard. You can also opt-out of marketing communications by following the unsubscribe link in our emails. If you have any questions about how we handle your data, our support team is always here to help."
        }
    ]

    return (
        <div className="min-h-screen bg-white">
            <ModernNavigation />

            <main className="pt-32 pb-24 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50 rounded-full blur-[120px] opacity-60 transition-all" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-50 rounded-full blur-[100px] opacity-60 transition-all" />
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <Link href="/">
                            <Button variant="ghost" className="mb-8 group">
                                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                Back to Home
                            </Button>
                        </Link>
                        
                        <div className="inline-flex items-center px-4 py-2 glass-effect border border-orange-200/50 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                            <Shield className="h-4 w-4 mr-2" />
                            Legal Protection
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tighter">
                            Privacy <span className="text-gradient">Policy</span>
                        </h1>
                        <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                            Your trust is our most valuable asset. Learn how we protect your data while you shop smarter.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {sections.map((section, index) => {
                            const Icon = section.icon
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-effect rounded-[2.5rem] p-8 lg:p-12 border border-white/50 premium-shadow bg-white/40"
                                >
                                    <div className="flex flex-col md:flex-row gap-8 items-start">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight italic">
                                                {section.title}
                                            </h2>
                                            <p className="text-gray-600 font-medium leading-relaxed text-lg">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="mt-16 p-12 glass-effect rounded-[3rem] border border-orange-100 bg-orange-50/30 text-center"
                    >
                        <Mail className="h-10 w-10 text-orange-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase italic">Questions about Privacy?</h3>
                        <p className="text-gray-600 font-medium mb-8 max-w-lg mx-auto leading-relaxed">
                            If you have any concerns or need clarity on how we manage your information, feel free to reach out to our legal team.
                        </p>
                        <a href="mailto:marketdotcominfo@gmail.com">
                            <Button size="xl" className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black px-10 h-16 shadow-2xl transition-all">
                                Contact Privacy Officer
                            </Button>
                        </a>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
