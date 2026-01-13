import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Star,
  Quote,
  Users,
  Heart,
  TrendingUp,
  Award,
  CheckCircle,
  MapPin,
  Calendar,
  ThumbsUp
} from "lucide-react"

export default function TestimonialsPage() {
  const testimonials = [
    {
      id: 1,
      name: "Adunni Okafor",
      location: "Lagos",
      plan: "Weekly Thrift",
      rating: 5,
      date: "2024-12-15",
      avatar: "AO",
      testimonial: "Marketdotcom has completely changed my grocery shopping experience! The weekly thrift plan saves me so much time and money. The quality of produce is always excellent, and delivery is always on time. My family loves the fresh vegetables and fruits we receive every week.",
      highlights: ["Quality", "Reliability", "Time-saving"],
      verified: true
    },
    {
      id: 2,
      name: "Chukwuma Nwosu",
      location: "Ibadan",
      plan: "Monthly Thrift",
      rating: 5,
      date: "2024-12-10",
      avatar: "CN",
      testimonial: "As a busy professional, I don't have time to shop for groceries. Marketdotcom's monthly thrift plan ensures my home is always stocked with fresh items. The variety is amazing, and the prices are very competitive. Their customer service is also top-notch!",
      highlights: ["Convenience", "Variety", "Value"],
      verified: true
    },
    {
      id: 3,
      name: "Funmilayo Adebayo",
      location: "Abuja",
      plan: "Daily Thrift",
      rating: 5,
      date: "2024-12-08",
      avatar: "FA",
      testimonial: "The daily thrift service is perfect for my small household. I can customize my orders and get exactly what I need delivered fresh every day. The drivers are professional and courteous. Marketdotcom has made my life so much easier!",
      highlights: ["Freshness", "Customization", "Service"],
      verified: true
    },
    {
      id: 4,
      name: "Emeka Okoro",
      location: "Port Harcourt",
      plan: "Custom Orders",
      rating: 5,
      date: "2024-12-05",
      avatar: "EO",
      testimonial: "For special occasions and events, I use Marketdotcom's custom ordering service. They handle bulk orders professionally and always deliver on time. The quality control is excellent, and their team goes above and beyond to ensure customer satisfaction.",
      highlights: ["Bulk orders", "Events", "Reliability"],
      verified: true
    },
    {
      id: 5,
      name: "Grace Onyeka",
      location: "Kano",
      plan: "Weekly Thrift",
      rating: 5,
      date: "2024-12-03",
      avatar: "GO",
      testimonial: "I've been a customer for over 6 months now, and I'm consistently impressed with the quality and service. The weekly packages are well-balanced, and the produce is always fresh. It's become an essential part of our household routine.",
      highlights: ["Consistency", "Fresh produce", "Long-term customer"],
      verified: true
    },
    {
      id: 6,
      name: "Ibrahim Suleiman",
      location: "Kaduna",
      plan: "Monthly Thrift",
      rating: 5,
      date: "2024-11-28",
      avatar: "IS",
      testimonial: "Marketdotcom supports local farmers and provides authentic Nigerian ingredients. The monthly thrift plan gives me access to traditional spices and vegetables that are hard to find elsewhere. The cultural authenticity is important to me.",
      highlights: ["Local sourcing", "Authenticity", "Cultural relevance"],
      verified: true
    },
    {
      id: 7,
      name: "Ngozi Eze",
      location: "Enugu",
      plan: "Daily Thrift",
      rating: 5,
      date: "2024-11-25",
      avatar: "NE",
      testimonial: "The wallet system and loyalty program are fantastic! I earn points on every purchase and get great discounts. The app is easy to use, and tracking my orders is seamless. Marketdotcom truly values its customers.",
      highlights: ["Loyalty program", "App experience", "Rewards"],
      verified: true
    },
    {
      id: 8,
      name: "Samuel Adeyemi",
      location: "Ogun",
      plan: "Weekly Thrift",
      rating: 5,
      date: "2024-11-20",
      avatar: "SA",
      testimonial: "As a business owner, I use Marketdotcom for both personal and office supplies. The bulk ordering options and business pricing make it cost-effective. Their reliability for office deliveries is crucial for our operations.",
      highlights: ["Business solutions", "Bulk pricing", "Office deliveries"],
      verified: true
    },
    {
      id: 9,
      name: "Blessing Nnamdi",
      location: "Anambra",
      plan: "Custom Orders",
      rating: 5,
      date: "2024-11-18",
      avatar: "BN",
      testimonial: "During the festive season, Marketdotcom helped me with large orders for family gatherings. Everything arrived fresh and on time. The team's attention to detail and festive spirit made the experience memorable.",
      highlights: ["Festive orders", "Large quantities", "Special occasions"],
      verified: true
    }
  ]

  const stats = [
    {
      number: "10,000+",
      label: "Happy Customers",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "98%",
      label: "Satisfaction Rate",
      icon: Heart,
      color: "from-red-500 to-red-600"
    },
    {
      number: "50,000+",
      label: "Orders Delivered",
      icon: TrendingUp,
      color: "from-green-500 to-green-600"
    },
    {
      number: "4.9/5",
      label: "Average Rating",
      icon: Star,
      color: "from-yellow-500 to-yellow-600"
    }
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

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
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                <Star className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Customer Reviews
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            What Our <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Customers Say</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Don't just take our word for it. Hear from thousands of satisfied customers who trust Marketdotcom for their daily grocery needs.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Featured Testimonial */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 mb-12">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Quote className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <blockquote className="text-xl text-gray-700 italic mb-6 max-w-4xl mx-auto">
                "Marketdotcom has revolutionized how I shop for groceries. The quality, convenience, and reliability are unmatched.
                It's not just a service—it's a game-changer for busy professionals and families across Nigeria."
              </blockquote>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  AO
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Adunni Okafor</div>
                  <div className="text-sm text-gray-600">Lagos • Weekly Thrift Customer</div>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(5)}
                  <span className="text-sm text-gray-600 ml-2">Verified Customer</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Customer Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{testimonial.location}</span>
                        </div>
                      </div>
                    </div>
                    {testimonial.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {renderStars(testimonial.rating)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {testimonial.plan}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <blockquote className="text-gray-700 mb-4 italic">
                    "{testimonial.testimonial}"
                  </blockquote>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {testimonial.highlights.map((highlight, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(testimonial.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Why Customers Trust Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-green-100 to-green-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">Every item is carefully inspected and guaranteed fresh or your money back.</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <ThumbsUp className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reliable Service</h3>
              <p className="text-gray-600">98% on-time delivery rate with professional drivers and real-time tracking.</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer First</h3>
              <p className="text-gray-600">24/7 support with dedicated customer service team ready to help.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <Star className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Happy Customers</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Experience the quality, convenience, and reliability that thousands of Nigerians trust for their daily grocery needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline">
                  View Our Services
                </Button>
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              <p>Join over 10,000 satisfied customers across Nigeria</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Recent customer reviews and ratings</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-1">
              {renderStars(5)}
            </div>
            <span className="text-lg font-semibold text-gray-900">4.9 out of 5</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-600">Based on 2,500+ reviews</span>
          </div>
        </div>
      </div>
    </div>
  )
}