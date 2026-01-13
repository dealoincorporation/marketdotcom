import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Truck,
  Package,
  Clock,
  Star,
  CheckCircle,
  ShoppingCart,
  Users,
  Calendar,
  Zap,
  Shield,
  Heart,
  Award,
  MapPin,
  Phone
} from "lucide-react"

export default function ServicesPage() {
  const thriftPlans = [
    {
      name: "Daily Thrift",
      price: "₦2,500 - ₦15,000",
      duration: "Daily",
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      features: [
        "Fresh groceries delivered daily",
        "Customizable packages",
        "Flexible delivery times",
        "Quality guaranteed",
        "Cancel anytime",
        "Wallet integration"
      ],
      description: "Perfect for busy individuals who want fresh groceries delivered to their door every day.",
      popular: false
    },
    {
      name: "Weekly Thrift",
      price: "₦15,000 - ₦50,000",
      duration: "Weekly",
      icon: Package,
      color: "from-green-500 to-green-600",
      features: [
        "Curated weekly packages",
        "Cost-effective pricing",
        "Meal planning included",
        "Premium quality items",
        "Flexible delivery schedule",
        "Loyalty points bonus"
      ],
      description: "Ideal for families and households looking for planned, cost-effective grocery solutions.",
      popular: true
    },
    {
      name: "Monthly Thrift",
      price: "₦50,000 - ₦200,000",
      duration: "Monthly",
      icon: Award,
      color: "from-purple-500 to-purple-600",
      features: [
        "Comprehensive monthly supply",
        "Maximum savings",
        "Bulk pricing advantages",
        "Priority delivery",
        "Dedicated account manager",
        "Exclusive member benefits"
      ],
      description: "Best for large households, businesses, and those seeking maximum value and convenience.",
      popular: false
    }
  ]

  const additionalServices = [
    {
      title: "Custom Orders",
      description: "Build your own grocery package with items you love",
      icon: ShoppingCart,
      features: [
        "Complete customization",
        "No minimum order",
        "Special dietary options",
        "Bulk discounts available",
        "Express delivery options"
      ]
    },
    {
      title: "Business Solutions",
      description: "Specialized services for restaurants, hotels, and offices",
      icon: Users,
      features: [
        "Volume discounts",
        "Dedicated support",
        "Flexible payment terms",
        "Custom delivery schedules",
        "Quality assurance"
      ]
    },
    {
      title: "Express Delivery",
      description: "Same-day delivery for urgent grocery needs",
      icon: Zap,
      features: [
        "2-4 hour delivery window",
        "Premium pricing",
        "Real-time tracking",
        "Priority processing",
        "Contactless delivery"
      ]
    }
  ]

  const deliveryFeatures = [
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Choose delivery times that work for your schedule"
    },
    {
      icon: MapPin,
      title: "Wide Coverage",
      description: "Delivering across major cities in Nigeria"
    },
    {
      icon: Shield,
      title: "Quality Guarantee",
      description: "Fresh, hygienic products or your money back"
    },
    {
      icon: Heart,
      title: "Personal Touch",
      description: "Professional drivers and personalized service"
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
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Our Services
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Fresh Groceries, <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Delivered Daily</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover our comprehensive range of grocery services designed to save you time, money, and provide the freshest products right to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              View Thrift Plans
            </Button>
            <Button size="lg" variant="outline">
              Custom Order
            </Button>
          </div>
        </div>

        {/* Thrift Plans */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Thrift Plans</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the perfect plan for your household size and budget. All plans include fresh, locally sourced groceries delivered to your door.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {thriftPlans.map((plan, index) => {
              const Icon = plan.icon
              return (
                <Card key={index} className={`relative hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-green-500' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-green-600 mb-2">{plan.price}</div>
                    <Badge variant="secondary">{plan.duration}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90`}>
                      Choose {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Additional Services */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Additional Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
                        <Icon className="h-6 w-6 text-orange-600" />
                      </div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Delivery Features */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Our Delivery Service?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {deliveryFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Service Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Compare Our Services</h2>
          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
              <TabsTrigger value="plans">Thrift Plans</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-4 px-2">Feature</th>
                          <th className="text-center py-4 px-2">Daily Thrift</th>
                          <th className="text-center py-4 px-2">Weekly Thrift</th>
                          <th className="text-center py-4 px-2">Monthly Thrift</th>
                          <th className="text-center py-4 px-2">Custom Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-4 px-2 font-medium">Delivery Frequency</td>
                          <td className="text-center py-4 px-2">Daily</td>
                          <td className="text-center py-4 px-2">Weekly</td>
                          <td className="text-center py-4 px-2">Monthly</td>
                          <td className="text-center py-4 px-2">As needed</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-4 px-2 font-medium">Minimum Order</td>
                          <td className="text-center py-4 px-2">₦2,500</td>
                          <td className="text-center py-4 px-2">₦15,000</td>
                          <td className="text-center py-4 px-2">₦50,000</td>
                          <td className="text-center py-4 px-2">₦1,000</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-4 px-2 font-medium">Customization</td>
                          <td className="text-center py-4 px-2">High</td>
                          <td className="text-center py-4 px-2">Medium</td>
                          <td className="text-center py-4 px-2">Low</td>
                          <td className="text-center py-4 px-2">Full</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-4 px-2 font-medium">Best For</td>
                          <td className="text-center py-4 px-2">Individuals</td>
                          <td className="text-center py-4 px-2">Families</td>
                          <td className="text-center py-4 px-2">Businesses</td>
                          <td className="text-center py-4 px-2">Everyone</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span>Standard Features</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Fresh, quality groceries</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Doorstep delivery</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>24/7 customer support</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Secure payment options</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Quality guarantee</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="h-5 w-5 text-purple-500" />
                      <span>Premium Benefits</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Priority delivery slots</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Dedicated account manager</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Bulk pricing discounts</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Exclusive promotions</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Custom packaging options</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Transparent Pricing</h3>
                    <p className="text-gray-600">No hidden fees, no surprise charges</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-4 text-green-600">What's Included</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Fresh groceries at market price</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Delivery within 4 hours</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Quality check and packaging</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>24/7 customer support</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-4 text-orange-600">Additional Costs</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center space-x-2">
                          <span className="text-gray-500">•</span>
                          <span>Express delivery: +₦500</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-gray-500">•</span>
                          <span>Premium packaging: +₦200</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-gray-500">•</span>
                          <span>Special requests: +₦300</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-gray-500">•</span>
                          <span>All prices are final</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust Marketdotcom for their daily grocery needs. Choose the perfect plan for your lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/marketplace">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  Browse Marketplace
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              Questions? Call us at <span className="font-semibold">+234-903-181-2756</span> or email <span className="font-semibold">support@marketdotcom.ng</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}