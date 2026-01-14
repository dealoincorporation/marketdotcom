import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Heart,
  Users,
  Award,
  Truck,
  Shield,
  Star,
  Target,
  Eye,
  HandHeart,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShoppingBag,
  PiggyBank,
  Store,
  CheckCircle,
  DollarSign,
  Zap,
  Calendar,
  MessageCircle,
  Instagram,
  Linkedin
} from "lucide-react"

export default function AboutPage() {
  const whatWeOffer = [
    {
      icon: Truck,
      title: "Doorstep Delivery",
      description: "Carefully packed under hygienic conditions, your food essentials are delivered straight to your doorstep—stress-free and at fair prices."
    },
    {
      icon: PiggyBank,
      title: "Daily & Monthly Thrift Plans",
      description: "Save gradually and receive a well-packaged bundle of food and grocery essentials—delivered monthly or during festive periods. Designed to help you plan ahead, beat price hikes, and shop without stress."
    },
    {
      icon: Store,
      title: "Personal Shopping Services",
      description: "We shop on your behalf—so you don't have to. From trusted local markets and suppliers, we carefully source fresh produce, packaged, and processed food items—ensuring quality, fair pricing, and reliable delivery."
    }
  ]

  const whyChooseUs = [
    {
      icon: CheckCircle,
      title: "Reliable Quality, Delivered On Time",
      description: "Count on Marketdotcom for fresh, high-quality groceries delivered accurately and on schedule—every order, every time."
    },
    {
      icon: DollarSign,
      title: "Budget-Smart Food Solutions",
      description: "Our daily and monthly thrift plans help you save gradually, making quality food more affordable without putting pressure on your finances."
    },
    {
      icon: Zap,
      title: "Convenient, Streamlined Shopping",
      description: "Shop fresh groceries and household essentials from anywhere—home or office—without visiting the market, saving time for what truly matters."
    },
    {
      icon: Calendar,
      title: "Flexible Delivery Options",
      description: "Choose delivery that fits your schedule—same-day, next-day, or scheduled delivery—and receive your groceries exactly when you need them."
    }
  ]

  const socialLinks = [
    {
      icon: MessageCircle,
      name: "WhatsApp Contact",
      url: "https://wa.link/ig48j8",
      color: "hover:text-green-600"
    },
    {
      icon: MessageCircle,
      name: "WhatsApp Community",
      url: "https://whatsapp.com/channel/0029VbAyTyFIN9ihlQWcnq3u",
      color: "hover:text-green-600"
    },
    {
      icon: Instagram,
      name: "Instagram",
      url: "https://www.instagram.com/marketdotcom.ng?igsh=MWl2MDZ5dDlxbWN4Zw==",
      color: "hover:text-pink-600"
    },
    {
      icon: Linkedin,
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/marketdotcom-1898093a5/",
      color: "hover:text-blue-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                About Marketdotcom
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Marketdotcom</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Nigeria's most trusted platform for convenient and timely grocery and food essentials shopping, combined with smart savings solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Start Shopping Today
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg leading-relaxed">
                To become Nigeria's most trusted platform for convenient and timely grocery and food essentials shopping, combined with smart savings solutions that help households plan ahead.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg leading-relaxed">
                To deliver a reliable and convenient platform that enables Nigerian households to purchase groceries and food essentials effortlessly, receive orders on time, and build disciplined savings for their everyday and seasonal food needs—through trusted vendors, efficient logistics, and a mobile-first digital experience.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">What We Offer</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Comprehensive solutions for all your grocery and food essentials needs
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {whatWeOffer.map((offer, index) => {
              const Icon = offer.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{offer.title}</h3>
                    <p className="text-gray-600">{offer.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* About Us */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About Marketdotcom</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Marketdotcom was founded to solve the common problem of time-consuming, fragmented monthly food shopping. By consolidating all essential items in one place, we aim to provide convenience, affordability and quality experience.
                </p>
                <p>
                  Through our thrift savings plans, personal shopping services, and customized food packages, customers can plan ahead, save gradually, and access fresh food without disruption.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Award className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                  <p className="text-orange-800 font-semibold">Solving Real Problems</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Marketdotcom? */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Why Marketdotcom?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover what makes us Nigeria's most trusted grocery shopping platform
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {whyChooseUs.map((reason, index) => {
              const Icon = reason.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex-shrink-0">
                        <Icon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{reason.title}</h3>
                        <p className="text-gray-600">{reason.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>


        {/* Contact & Social Links */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <HandHeart className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect With Us</h2>
              <p className="text-gray-700 max-w-2xl mx-auto">
                Join our community and experience the convenience of fresh grocery delivery with our smart savings solutions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${social.color}`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="font-medium">{social.name}</span>
                  </a>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/marketplace">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Start Shopping Now
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline">
                  Join Our Community
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <MapPin className="h-6 w-6 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Address</h4>
                  <p className="text-gray-600 text-sm">Road 4, Glorious Estate, Badore Ajah Lagos State.</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Mail className="h-6 w-6 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Email</h4>
                  <p className="text-gray-600 text-sm">marketdotcominfo@gmail.com</p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Phone className="h-6 w-6 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Phone</h4>
                  <p className="text-gray-600 text-sm">08138353576</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}