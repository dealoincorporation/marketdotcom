"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  Truck,
  Shield,
  Check,
  Plus,
  Home,
  Building,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "react-hot-toast"

interface Address {
  id: string
  type: "home" | "work" | "other"
  name: string
  address: string
  city: string
  state: string
  postalCode?: string
  phone: string
  isDefault: boolean
}

interface DeliverySlot {
  id: string
  date: string
  timeSlot: string
  available: boolean
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Delivery, 2: Payment, 3: Confirmation

  // Delivery Information
  const [selectedAddress, setSelectedAddress] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")

  // New Address Form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    type: "home" as const,
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    phone: ""
  })

  // Payment Information
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [useWallet, setUseWallet] = useState(false)
  const [walletBalance, setWalletBalance] = useState(0)

  // Mock data
  const [addresses] = useState<Address[]>([
    {
      id: "1",
      type: "home",
      name: "Home",
      address: "123 Main Street, Victoria Island",
      city: "Lagos",
      state: "Lagos",
      postalCode: "100001",
      phone: "+2348012345678",
      isDefault: true
    },
    {
      id: "2",
      type: "work",
      name: "Office",
      address: "456 Business District, Ikoyi",
      city: "Lagos",
      state: "Lagos",
      postalCode: "100002",
      phone: "+2348012345679",
      isDefault: false
    }
  ])

  const [deliverySlots] = useState<DeliverySlot[]>([
    { id: "1", date: "2024-01-10", timeSlot: "10:00 AM - 2:00 PM", available: true },
    { id: "2", date: "2024-01-10", timeSlot: "2:00 PM - 6:00 PM", available: true },
    { id: "3", date: "2024-01-11", timeSlot: "10:00 AM - 2:00 PM", available: true },
    { id: "4", date: "2024-01-11", timeSlot: "2:00 PM - 6:00 PM", available: false },
  ])

  const totalItems = getTotalItems()
  const subtotal = getTotalPrice()
  const deliveryFee = subtotal > 10000 ? 0 : 1500
  const walletDeduction = useWallet ? Math.min(walletBalance, subtotal + deliveryFee) : 0
  const finalTotal = subtotal + deliveryFee - walletDeduction

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }

    if (items.length === 0) {
      router.push('/cart')
      return
    }

    // Fetch wallet balance
    fetchWalletBalance()
  }, [user, items, router])

  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/wallet')
      const data = await response.json()
      setWalletBalance(data.walletBalance || 0)
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  const handleAddNewAddress = async () => {
    // In a real app, this would make an API call
    console.log("Adding new address:", newAddress)
    setShowNewAddressForm(false)
    setNewAddress({
      type: "home",
      name: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      phone: ""
    })
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      // Create order in database first
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          variationId: null, // Cart doesn't support variations yet
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        deliveryAddress: addresses.find(addr => addr.id === selectedAddress),
        deliveryDate,
        deliveryTime,
        deliveryNotes,
        paymentMethod,
        useWallet,
        subtotal,
        deliveryFee,
        walletDeduction,
        finalTotal
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const orderResult = await response.json()
      const orderId = orderResult.orderId

      // Handle payment based on method
      if (paymentMethod === 'wallet') {
        // Wallet payment is already handled in order creation
        clearCart()
        setStep(3)
        toast.success('Order placed successfully!')
      } else if (paymentMethod === 'paystack') {
        // Initialize Paystack payment
        await handlePaystackPayment(orderId, finalTotal)
      } else if (paymentMethod === 'card') {
        // For card payments, we could integrate a payment gateway here
        // For now, treat as wallet payment
        clearCart()
        setStep(3)
        toast.success('Order placed successfully!')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaystackPayment = async (orderId: string, amount: number) => {
    try {
      // Initialize payment with Paystack
      const paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          paymentMethod: 'paystack'
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to initialize payment')
      }

      const paymentData = await paymentResponse.json()

      // Load Paystack inline script if not already loaded
      if (!window.PaystackPop) {
        await loadPaystackScript()
      }

      // Open Paystack payment modal
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_9071bb582b6486e980b86bce551587236426329a', // Your provided test key
        email: user?.email || '',
        amount: amount * 100, // Convert to kobo
        reference: paymentData.reference,
        onClose: function() {
          toast('Payment cancelled', {
            style: {
              background: 'rgba(239, 68, 68, 0.95)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }
          })
        },
        onSuccess: function(transaction: any) {
          // Verify payment
          verifyPayment(transaction.reference)
        }
      })

      handler.openIframe()
    } catch (error) {
      console.error('Error initializing Paystack payment:', error)
      toast.error('Failed to initialize payment. Please try again.')
    }
  }

  const verifyPayment = async (reference: string) => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      })

      const result = await response.json()

      if (result.success && result.paymentStatus === 'COMPLETED') {
        clearCart()
        setStep(3)
        toast.success('Payment successful! Order placed.')
      } else {
        toast.error('Payment verification failed. Please contact support.')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      toast.error('Payment verification failed. Please contact support.')
    }
  }

  const loadPaystackScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Paystack script'))
      document.head.appendChild(script)
    })
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/cart" className="group flex items-center space-x-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200">
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
              <span className="text-gray-700 font-medium group-hover:text-orange-600 transition-colors">Back to Cart</span>
            </Link>

            <div className="text-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Secure Checkout</h1>
              <div className="flex items-center justify-center space-x-8 mt-3">
                <div className={`flex flex-col items-center space-y-2 transition-all duration-300 ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                    step >= 1 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="text-xs font-medium">Delivery</span>
                </div>
                <div className={`w-8 h-0.5 transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center space-y-2 transition-all duration-300 ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                    step >= 2 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="text-xs font-medium">Payment</span>
                </div>
                <div className={`w-8 h-0.5 transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center space-y-2 transition-all duration-300 ${step >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                    step >= 3 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                  }`}>
                    3
                  </div>
                  <span className="text-xs font-medium">Confirm</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
              <div className="text-sm font-semibold text-gray-800">
                {totalItems} items
              </div>
              <div className="w-px h-4 bg-orange-200"></div>
              <div className="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                ₦{subtotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Delivery Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Address */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <MapPin className="h-6 w-6 mr-3" />
                    Choose Delivery Address
                  </h2>
                  <p className="text-orange-100 mt-1">Select where you'd like your order delivered</p>
                </div>
                <div className="p-6">
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-4">
                    {addresses.map(address => (
                      <div key={address.id} className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        selectedAddress === address.id
                          ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}>
                        <div className="flex items-start space-x-4">
                          <RadioGroupItem
                            value={address.id}
                            id={address.id}
                            className="mt-1"
                          />
                          <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="font-bold text-lg text-gray-900">{address.name}</span>
                                  {address.isDefault && (
                                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm">
                                      Default
                                    </Badge>
                                  )}
                                  <div className={`p-2 rounded-lg ${
                                    address.type === "home"
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-purple-100 text-purple-600'
                                  }`}>
                                    {address.type === "home" ? <Home className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                                  </div>
                                </div>
                                <p className="text-gray-700 font-medium mb-1">{address.address}</p>
                                <p className="text-gray-600 text-sm">{address.city}, {address.state}</p>
                                <p className="text-gray-600 text-sm font-medium">{address.phone}</p>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setShowNewAddressForm(true)}
                      className="w-full h-12 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-2 border-dashed border-gray-300 hover:border-orange-400 transition-all duration-300 group"
                    >
                      <Plus className="h-5 w-5 mr-3 text-gray-500 group-hover:text-orange-600 transition-colors" />
                      <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">Add New Address</span>
                    </Button>
                  </div>

                  {showNewAddressForm && (
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                        <h3 className="text-lg font-bold text-white flex items-center">
                          <Plus className="h-5 w-5 mr-2" />
                          Add New Address
                        </h3>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="addressType" className="text-sm font-semibold text-gray-700">Address Type</Label>
                            <Select value={newAddress.type} onValueChange={(value: any) => setNewAddress({...newAddress, type: value})}>
                              <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="home">🏠 Home</SelectItem>
                                <SelectItem value="work">🏢 Work</SelectItem>
                                <SelectItem value="other">📍 Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addressName" className="text-sm font-semibold text-gray-700">Address Name</Label>
                            <Input
                              id="addressName"
                              value={newAddress.name}
                              onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                              placeholder="e.g., Home, Office"
                              className="h-12 border-2 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="streetAddress" className="text-sm font-semibold text-gray-700">Street Address</Label>
                          <Textarea
                            id="streetAddress"
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                            placeholder="Enter your full address"
                            rows={3}
                            className="border-2 focus:border-blue-500 resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-sm font-semibold text-gray-700">City</Label>
                            <Input
                              id="city"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                              className="h-12 border-2 focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state" className="text-sm font-semibold text-gray-700">State</Label>
                            <Input
                              id="state"
                              value={newAddress.state}
                              onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                              className="h-12 border-2 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-700">Postal Code <span className="text-gray-500">(Optional)</span></Label>
                            <Input
                              id="postalCode"
                              value={newAddress.postalCode}
                              onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                              className="h-12 border-2 focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                            <Input
                              id="phone"
                              value={newAddress.phone}
                              onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                              placeholder="+234xxxxxxxxxx"
                              className="h-12 border-2 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex space-x-4 pt-4">
                          <Button
                            onClick={handleAddNewAddress}
                            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Add Address
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowNewAddressForm(false)}
                            className="flex-1 h-12 border-2 hover:bg-gray-50 font-semibold"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Schedule */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Calendar className="h-6 w-6 mr-3" />
                    Schedule Your Delivery
                  </h2>
                  <p className="text-green-100 mt-1">Choose when you'd like your order delivered</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      Preferred Delivery Date
                    </Label>
                    <Select value={deliveryDate} onValueChange={setDeliveryDate}>
                      <SelectTrigger className="h-12 border-2 focus:border-green-500 bg-white">
                        <SelectValue placeholder="Select delivery date" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...new Set(deliverySlots.map(slot => slot.date))].map(date => (
                          <SelectItem key={date} value={date} className="h-12">
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {deliveryDate && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-green-600" />
                        Preferred Time Slot
                      </Label>
                      <RadioGroup value={deliveryTime} onValueChange={setDeliveryTime} className="space-y-3">
                        {deliverySlots
                          .filter(slot => slot.date === deliveryDate && slot.available)
                          .map(slot => (
                            <div key={slot.id} className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                              deliveryTime === slot.timeSlot
                                ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                                : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                            }`}>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem value={slot.timeSlot} id={slot.id} />
                                <Label htmlFor={slot.id} className="flex-1 cursor-pointer">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                      <Clock className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                      <span className="font-semibold text-gray-900">{slot.timeSlot}</span>
                                      <p className="text-sm text-gray-600">Fast & reliable delivery</p>
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            </div>
                          ))}
                      </RadioGroup>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label htmlFor="deliveryNotes" className="text-sm font-semibold text-gray-700 flex items-center">
                      📝 Delivery Notes <span className="text-gray-500 ml-1">(Optional)</span>
                    </Label>
                    <Textarea
                      id="deliveryNotes"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Any special instructions for delivery..."
                      rows={3}
                      className="border-2 focus:border-green-500 resize-none bg-white"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Truck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-900 mb-2">🚚 Delivery Information</h3>
                        <ul className="text-sm text-blue-800 space-y-1.5">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Orders delivered within 4 hours of scheduled time
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Place orders before 10 AM for same-day delivery
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            Orders after 3 PM delivered next day
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-green-600" />
                            SMS & email updates on delivery status
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Order Items */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      🛒 Order Summary
                    </h2>
                    <p className="text-purple-100 mt-1">{totalItems} items in your cart</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      {items.map(item => (
                        <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-orange-600">{item.quantity}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">₦{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-900">₦{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="border-t border-gray-300 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total</span>
                          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ₦{finalTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setStep(2)}
                      className="w-full h-12 mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={!selectedAddress || !deliveryDate || !deliveryTime}
                    >
                      Continue to Payment →
                    </Button>

                    {!selectedAddress && (
                      <p className="text-sm text-red-600 mt-2 flex items-center">
                        <span className="mr-1">⚠️</span> Please select a delivery address
                      </p>
                    )}
                    {selectedAddress && (!deliveryDate || !deliveryTime) && (
                      <p className="text-sm text-red-600 mt-2 flex items-center">
                        <span className="mr-1">⚠️</span> Please select delivery date and time
                      </p>
                    )}
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <span>Fast Delivery</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Quality</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Payment Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Payment Method Selection */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    💳 Choose Payment Method
                  </h2>
                  <p className="text-orange-100 mt-1">Select how you'd like to pay for your order</p>
                </div>
                <div className="p-6">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                    {/* Credit/Debit Card */}
                    <div className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "card"
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <RadioGroupItem value="card" id="card" className="text-orange-600" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl">
                              <CreditCard className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-900 mb-1">Credit/Debit Card</div>
                              <div className="text-sm text-gray-600 mb-2">Visa, Mastercard, Verve accepted</div>
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                                  <div className="w-8 h-5 bg-gradient-to-r from-red-600 to-red-700 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                                  <div className="w-8 h-5 bg-gradient-to-r from-purple-600 to-purple-700 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Label>
                        <div className="text-green-600">
                          <Shield className="h-6 w-6" />
                        </div>
                      </div>
                      {paymentMethod === "card" && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Wallet Balance */}
                    <div className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "wallet"
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                        : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <RadioGroupItem value="wallet" id="wallet" className="text-green-600" />
                        <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                              <span className="text-3xl">💰</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-900 mb-1">Wallet Balance</div>
                              <div className="text-sm text-gray-600 mb-2">Instant payment from your wallet</div>
                              <div className="text-lg font-bold text-green-600">
                                ₦{walletBalance.toLocaleString()} available
                              </div>
                            </div>
                          </div>
                        </Label>
                        {walletBalance >= finalTotal ? (
                          <div className="text-green-600">
                            <Check className="h-6 w-6" />
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <X className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      {paymentMethod === "wallet" && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Bank Transfer (Paystack) */}
                    <div className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "paystack"
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <RadioGroupItem value="paystack" id="paystack" className="text-purple-600" />
                        <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                          <div className="flex items-center space-x-4">
                            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                              <span className="text-3xl">🏦</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-900 mb-1">Bank Transfer</div>
                              <div className="text-sm text-gray-600 mb-2">Paystack - secure bank transfers</div>
                              <div className="text-sm text-purple-600 font-medium">
                                Direct bank transfer or USSD
                              </div>
                            </div>
                          </div>
                        </Label>
                        <div className="text-purple-600">
                          <Shield className="h-6 w-6" />
                        </div>
                      </div>
                      {paymentMethod === "paystack" && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </RadioGroup>

                  {/* Wallet Deduction Option */}
                  {paymentMethod === "card" && walletBalance > 0 && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          id="useWallet"
                          checked={useWallet}
                          onChange={(e) => setUseWallet(e.target.checked)}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-2"
                        />
                        <Label htmlFor="useWallet" className="flex-1 cursor-pointer">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-100 rounded-xl">
                              <span className="text-2xl">💰</span>
                            </div>
                            <div>
                              <div className="font-semibold text-green-900 text-lg">💡 Use Wallet Balance</div>
                              <div className="text-sm text-green-700 mt-1">
                                Save ₦{Math.min(walletBalance, finalTotal).toLocaleString()} from your wallet balance
                              </div>
                            </div>
                          </div>
                        </Label>
                        {useWallet && (
                          <div className="text-green-600">
                            <Check className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Security & Trust */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl">
                    <Shield className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-2">🔒 Secure Payment Guarantee</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      Your payment information is encrypted and processed securely.
                      We never store your card details and use bank-level security.
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">SSL Encrypted</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">PCI Compliant</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">Bank-Level Security</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Payment Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    💰 Payment Summary
                  </h2>
                  <p className="text-orange-100 mt-1">Review your order details</p>
                </div>
                <div className="p-6">
                  {/* Order Breakdown */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Subtotal</span>
                      <span className="font-bold text-gray-900">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Delivery Fee</span>
                      <span className={`font-bold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}
                      </span>
                    </div>
                    {useWallet && (
                      <div className="flex justify-between items-center py-3 px-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <span className="font-medium text-green-900">Wallet Deduction</span>
                        <span className="font-bold text-green-600">-₦{walletDeduction.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-gray-300 pt-4 mt-4">
                      <div className="flex justify-between items-center py-3">
                        <span className="text-xl font-bold text-gray-900">Total to Pay</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          ₦{finalTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300"
                      >
                        ← Back
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            Place Order →
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Payment Method Confirmation */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {paymentMethod === 'card' && <CreditCard className="h-5 w-5 text-blue-600" />}
                          {paymentMethod === 'wallet' && <span className="text-lg">💰</span>}
                          {paymentMethod === 'paystack' && <span className="text-lg">🏦</span>}
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-blue-800 font-medium">
                            💳 Paying with <strong className="text-blue-900">
                              {paymentMethod === 'card' ? 'Credit/Debit Card' :
                               paymentMethod === 'wallet' ? 'Wallet Balance' : 'Bank Transfer'}
                            </strong>
                            {useWallet && paymentMethod === 'card' && (
                              <span className="block text-xs text-green-700 mt-1">
                                + ₦{walletDeduction.toLocaleString()} from wallet
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-600 bg-gray-50 rounded-lg py-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Secured by SSL encryption</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">🎉 Order Placed Successfully!</h1>
                <p className="text-green-100 text-lg">
                  Your order has been received and is being processed.
                  You'll receive SMS and email updates shortly.
                </p>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Order Details */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-bold text-xl text-blue-900 mb-4 flex items-center">
                      📋 Order Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-blue-700 font-medium">Order Total:</span>
                        <span className="text-blue-900 font-bold text-lg">₦{finalTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-blue-700 font-medium">Delivery Date:</span>
                        <span className="text-blue-900">{new Date(deliveryDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-blue-700 font-medium">Delivery Time:</span>
                        <span className="text-blue-900">{deliveryTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="font-bold text-xl text-purple-900 mb-4 flex items-center">
                      🚚 Delivery Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-purple-900 font-medium">Delivery Address</p>
                          <p className="text-purple-700 text-sm">{addresses.find(addr => addr.id === selectedAddress)?.name}</p>
                          <p className="text-purple-700 text-sm">{addresses.find(addr => addr.id === selectedAddress)?.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Truck className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-purple-900 font-medium">Estimated Delivery</p>
                          <p className="text-purple-700 text-sm">Within 4 hours of scheduled time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      📦 Track My Order
                    </Button>
                  </Link>
                  <Link href="/marketplace" className="flex-1">
                    <Button variant="outline" className="w-full h-12 border-2 hover:bg-gray-50 font-semibold">
                      🛒 Continue Shopping
                    </Button>
                  </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>Order Confirmed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-blue-600" />
                      <span>Payment Processed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-purple-600" />
                      <span>Delivery Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
