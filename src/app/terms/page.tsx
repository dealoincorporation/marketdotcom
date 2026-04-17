"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Scale, ShoppingBag, PiggyBank, Truck, AlertCircle, FileText, CheckCircle, Handshake } from "lucide-react"
import { Footer } from "@/components/footer"
import { ModernNavigation } from "@/components/modern-navigation"

export default function TermsPage() {
    const terms = [
        {
            icon: Handshake,
            title: "Agreement to Terms",
            content: "By accessing and using Marketdotcom, you agree to be bound by these Terms and Conditions. Our platform provides a digital marketplace for food and household essentials, personal shopping services, and thrift savings plans. These terms apply to all visitors, users, and others who access or use our services."
        },
        {
            icon: ShoppingBag,
            title: "Marketplace & Personal Shopping",
            content: "When you place an order, you are authorizing us to act as your agent to source products from local markets and suppliers. We strive for 100% accuracy in pricing and availability; however, due to market volatility, minor price adjustments or substitutions may be necessary. We will always communicate such changes for your approval before fulfillment."
        },
        {
            icon: PiggyBank,
            title: "Smart Thrift Plans",
            content: "Our thrift plans allow you to save gradually (starting from ₦450/day) for future food bundles. By starting a plan, you agree to the specified savings duration. We lock in current market prices for your bundle to protect you from inflation. Early withdrawals are possible but may be subject to processing fees or the forfeiture of price protection benefits."
        },
        {
            icon: Truck,
            title: "Delivery & Fulfillment",
            content: "We aim for swift and hygienic delivery of all items. Delivery timelines provided at checkout are estimates. Once items are delivered and signed for, risk of loss passes to you. We are not responsible for delays caused by circumstances beyond our control or incorrect delivery information provided by the user."
        },
        {
            icon: AlertCircle,
            title: "Refunds & Cancellations",
            content: "Due to the perishable nature of many items we source, cancellations must be made before shopping begins. Refunds or replacements are provided for damaged or incorrect items reported within 24 hours of delivery. All refund claims require evidence (such as photos) and are processed according to our internal quality audit."
        },
        {
            icon: Scale,
            title: "Limitation of Liability",
            content: "Marketdotcom and its affiliates shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the platform. We provide our services 'as is' and 'as available' without any warranties of any kind, whether express or implied, including the fitness for a particular purpose."
        }
    ]

    return (
        <div className="min-h-screen bg-white">
            <ModernNavigation />

            <main className="pt-32 pb-24 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-50 rounded-full blur-[120px] opacity-60 transition-all" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-yellow-50 rounded-full blur-[100px] opacity-60 transition-all" />
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
                            <FileText className="h-4 w-4 mr-2" />
                            User Agreement
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tighter">
                            Terms & <span className="text-gradient">Conditions</span>
                        </h1>
                        <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
                            A clear and fair agreement to ensure a seamless and safe shopping experience for everyone.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {terms.map((item, index) => {
                            const Icon = item.icon
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
                                                {item.title}
                                            </h2>
                                            <p className="text-gray-600 font-medium leading-relaxed text-lg">
                                                {item.content}
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
                        <CheckCircle className="h-10 w-10 text-orange-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase italic">Acceptance of Terms</h3>
                        <p className="text-gray-600 font-medium mb-8 max-w-lg mx-auto leading-relaxed">
                            By continuing to use our platform, you acknowledge that you have read, understood, and agreed to be bound by these terms.
                        </p>
                        <Link href="/marketplace">
                            <Button size="xl" className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black px-10 h-16 shadow-2xl transition-all">
                                Start Shopping
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
