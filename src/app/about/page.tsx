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
  Clock
} from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Adebayo Johnson",
      role: "Founder & CEO",
      image: "/api/placeholder/150/150",
      bio: "Passionate about revolutionizing grocery shopping in Nigeria with innovative thrift solutions."
    },
    {
      name: "Funmi Adeolu",
      role: "Head of Operations",
      image: "/api/placeholder/150/150",
      bio: "Expert in supply chain management and customer service excellence."
    },
    {
      name: "Tunde Bakare",
      role: "Technology Lead",
      image: "/api/placeholder/150/150",
      bio: "Driving digital innovation and platform development for seamless user experiences."
    }
  ]

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description: "Marketdotcom was established with a vision to transform grocery shopping in Nigeria."
    },
    {
      year: "2024",
      title: "Platform Launch",
      description: "Successfully launched our online marketplace and thrift delivery services."
    },
    {
      year: "2025",
      title: "Expansion",
      description: "Growing our customer base and expanding delivery coverage across major cities."
    }
  ]

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Everything we do is centered around providing exceptional value to our customers."
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "We guarantee the freshness and quality of every item in our thrift packages."
    },
    {
      icon: Truck,
      title: "Reliable Delivery",
      description: "Timely and dependable delivery services that you can count on every day."
    },
    {
      icon: Users,
      title: "Community Focus",
      description: "Building strong relationships with local farmers and vendors in our community."
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
            Revolutionizing <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Grocery Shopping</span> in Nigeria
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're on a mission to make fresh, quality groceries accessible to every Nigerian household through innovative thrift plans and reliable delivery services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Start Shopping Today
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
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
                To democratize access to fresh, quality groceries by providing affordable thrift plans and seamless delivery services that save our customers time and money while supporting local farmers and vendors.
              </p>
            </CardContent>
          </Card>

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
                To become Nigeria's leading grocery delivery platform, setting the standard for quality, reliability, and customer satisfaction in the food retail industry.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Founded in 2023, Marketdotcom emerged from a simple observation: Nigerians deserved better access to fresh groceries without the hassle of traditional shopping.
                </p>
                <p>
                  Our founders recognized that busy professionals, families, and individuals needed a reliable solution that would save them time while ensuring they received quality products at competitive prices.
                </p>
                <p>
                  What started as a small delivery service has grown into a comprehensive platform offering daily thrift plans, custom packages, and a marketplace that connects customers directly with local vendors.
                </p>
                <p>
                  Today, we're proud to serve thousands of satisfied customers across Nigeria, supporting local farmers and contributing to the growth of our communities.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Award className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                  <p className="text-orange-800 font-semibold">Trusted by Thousands</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-200 to-red-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <Badge variant="secondary" className="mb-4">{member.role}</Badge>
                  <p className="text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Journey</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="relative hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </CardContent>
                {index < milestones.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-orange-400 to-red-400"></div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-8 text-center">
            <HandHeart className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Community?</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Experience the convenience of fresh grocery delivery with our thrift plans. Join thousands of satisfied customers who trust Marketdotcom for their daily needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Get Started Today
              </Button>
              <Link href="/auth/register">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Visit Us</h4>
                  <p className="text-gray-600 text-sm">38 Agberu Rd, Off Alasoro Street<br />Elebu Oja, Ibadan, Oyo State</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Call Us</h4>
                  <p className="text-gray-600 text-sm">+234-903-181-2756</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900">Email Us</h4>
                  <p className="text-gray-600 text-sm">hello@marketdotcom.ng</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}