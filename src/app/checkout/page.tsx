"use client"

import { useState, useEffect, useRef } from "react"
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
  X,
  ChevronDown,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import { useAddressStore } from "@/lib/address-store"
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
  isAvailable: boolean
  maxOrders: number
  currentOrders: number
  price?: number
  description?: string
  createdAt: string
  updatedAt: string
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore()
  const {
    addresses,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    validateAddress,
    formatAddress
  } = useAddressStore()

  const [loading, setLoading] = useState(false)
  const [addressesLoaded, setAddressesLoaded] = useState(false)
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
  const [mockAddresses] = useState<Address[]>([
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

  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([])
  const [deliverySlotsLoading, setDeliverySlotsLoading] = useState(true)
  const [showDeliveryDateDropdown, setShowDeliveryDateDropdown] = useState(false)
  const [showCreateSlotsModal, setShowCreateSlotsModal] = useState(false)
  const [slotConfig, setSlotConfig] = useState({
    daysAhead: 7,
    timeSlots: [
      { time: '9:00 AM - 12:00 PM', enabled: true },
      { time: '12:00 PM - 3:00 PM', enabled: true },
      { time: '3:00 PM - 6:00 PM', enabled: true },
      { time: '6:00 PM - 9:00 PM', enabled: true }
    ],
    maxOrders: 15,
    price: ''
  })

  // Fetch delivery slots function
  const fetchDeliverySlots = async () => {
    try {
      setDeliverySlotsLoading(true)
      console.log('Fetching delivery slots...')
      const response = await fetch('/api/delivery-slots')
      if (response.ok) {
        const slots = await response.json()
        setDeliverySlots(slots)
      } else {
        console.error('Failed to fetch delivery slots')
        // Fallback to some default slots if API fails
        setDeliverySlots([
          { id: "fallback-1", date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], timeSlot: "10:00 AM - 2:00 PM", isAvailable: true, maxOrders: 10, currentOrders: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
          { id: "fallback-2", date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], timeSlot: "2:00 PM - 6:00 PM", isAvailable: true, maxOrders: 10, currentOrders: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ])
      }
    } catch (error) {
      console.error('Error fetching delivery slots:', error)
      // Fallback to default slots
      setDeliverySlots([
        { id: "fallback-1", date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], timeSlot: "10:00 AM - 2:00 PM", isAvailable: true, maxOrders: 10, currentOrders: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "fallback-2", date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], timeSlot: "2:00 PM - 6:00 PM", isAvailable: true, maxOrders: 10, currentOrders: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ])
    } finally {
      setDeliverySlotsLoading(false)
    }
  }

  // Fetch delivery slots on component mount
  useEffect(() => {
    fetchDeliverySlots()
  }, [])

  // Close dropdown when clicking outside (using a ref-based approach)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && showDeliveryDateDropdown) {
        setShowDeliveryDateDropdown(false)
      }
    }

    if (showDeliveryDateDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDeliveryDateDropdown])

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

    // Fetch addresses and wallet balance
    const loadData = async () => {
      await Promise.all([
        fetchAddresses(),
        fetchWalletBalance()
      ])
      setAddressesLoaded(true)

      // Set default address if available
      const defaultAddr = getDefaultAddress()
      if (defaultAddr && !selectedAddress) {
        setSelectedAddress(defaultAddr.id)
      }
    }

    loadData()
  }, [user, items, router, fetchAddresses, getDefaultAddress])

  const fetchWalletBalance = async () => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token')

      const response = await fetch('/api/wallet', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      const data = await response.json()
      setWalletBalance(data.walletBalance || 0)
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
    }
  }

  const handleAddNewAddress = async () => {
    const addressData = {
      ...newAddress,
      userId: user?.id,
      isDefault: addresses.length === 0 // Make first address default
    }

    const success = await addAddress(addressData)
    if (success) {
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

      // Refresh addresses
      await fetchAddresses()

      // Set as selected if it's the first address
      if (addresses.length === 0) {
        await fetchAddresses()
        // Use getDefaultAddress to find the first/default address
        const defaultAddr = getDefaultAddress()
        if (defaultAddr) {
          setSelectedAddress(defaultAddr.id)
        }
      }
    }
  }

  const createDeliverySlots = async () => {
    try {
      setDeliverySlotsLoading(true)
      const token = localStorage.getItem('token')

      // Create slots based on configuration
      const enabledTimeSlots = slotConfig.timeSlots.filter(slot => slot.enabled).map(slot => slot.time)

      const slotsToCreate = []
      for (let i = 1; i <= slotConfig.daysAhead; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        const dateString = date.toISOString().split('T')[0]

        for (const timeSlot of enabledTimeSlots) {
          slotsToCreate.push({
            date: dateString,
            timeSlot,
            maxOrders: slotConfig.maxOrders,
            price: slotConfig.price ? parseFloat(slotConfig.price) : null,
            description: 'Configured delivery slot'
          })
        }
      }

      // Create slots via API
      const promises = slotsToCreate.map(slot =>
        fetch('/api/delivery-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(slot)
        })
      )

      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.ok).length

      if (successCount > 0) {
        toast.success(`Created ${successCount} delivery slots successfully!`)
        setShowCreateSlotsModal(false)
        // Refresh delivery slots
        try {
          setDeliverySlotsLoading(true)
          const response = await fetch('/api/delivery-slots')
          if (response.ok) {
            const slots = await response.json()
            setDeliverySlots(slots)
          }
        } catch (error) {
          console.error('Error refreshing delivery slots:', error)
        } finally {
          setDeliverySlotsLoading(false)
        }
      } else {
        toast.error('Failed to create delivery slots')
      }
    } catch (error) {
      console.error('Error creating delivery slots:', error)
      toast.error('Failed to create delivery slots')
    } finally {
      setDeliverySlotsLoading(false)
    }
  }

  const handlePlaceOrder = async () => {
    // Validate required fields
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    if (!deliveryDate) {
      toast.error('Please select a delivery date')
      return
    }

    if (!deliveryTime) {
      toast.error('Please select a delivery time')
      return
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    if (paymentMethod === 'wallet' && walletBalance < finalTotal) {
      toast.error('Insufficient wallet balance')
      return
    }

    setLoading(true)
    try {
      // PAYMENT FIRST, then create order only after successful payment
      if (paymentMethod === 'wallet') {
        // For wallet payments, check balance and deduct immediately, then create order
        await createOrderAfterPayment()

      } else if (paymentMethod === 'paystack') {
        // For Paystack payments, initialize payment first (modal will open)
        // Order will be created in the success callback after payment verification
        await handlePaystackPayment(null, finalTotal)

      } else if (paymentMethod === 'card') {
        // For card payments, use Paystack payment gateway
        await handlePaystackPayment(null, finalTotal)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to place order')
      setLoading(false)
    }
  }

  const createOrderAfterPayment = async () => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token')

      // Create order data
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          variationId: null, // Cart doesn't support variations yet
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        deliveryAddress: addresses.find(addr => addr.id === selectedAddress) || null,
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
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      // Clear cart and show success
      clearCart()
      setStep(3)
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create order')
      throw error
    }
  }

  const handlePaystackPayment = async (orderId: string | null, amount: number) => {
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token')

      // Initialize payment with Paystack (orderId can be null - we'll create order after payment)
      const paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          orderId: orderId || undefined, // Don't send null, send undefined
          amount,
          paymentMethod: paymentMethod || 'paystack'
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
      // Get the auth token from localStorage
      const token = localStorage.getItem('token')

      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reference }),
      })

      const result = await response.json()

      if (result.success && result.paymentStatus === 'COMPLETED') {
        // Payment successful! Now create the order
        try {
          await createOrderAfterPayment()
          // setLoading(false) is handled in createOrderAfterPayment
        } catch (orderError) {
          console.error('Error creating order after payment:', orderError)
          toast.error('Payment successful but order creation failed. Please contact support.')
          setLoading(false)
        }
      } else {
        toast.error('Payment verification failed. Please contact support.')
        setLoading(false)
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
      {/* Modern Responsive Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout */}
          <div className="md:hidden py-4 space-y-4">
            <div className="flex items-center justify-between">
              <Link href="/cart" className="group flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <ArrowLeft className="h-4 w-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">Back to Cart</span>
              </Link>
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                <div className="text-xs font-semibold text-gray-800">
                  {totalItems} items
                </div>
                <div className="w-px h-3 bg-orange-200"></div>
                <div className="text-xs font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  ₦{subtotal.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Secure Checkout</h1>
              <div className="flex items-center justify-center space-x-4 mt-3">
                <div className={`flex flex-col items-center space-y-1 transition-all duration-300 ${step >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 ${
                    step >= 1 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                  }`}>
                    1
                  </div>
                  <span className="text-xs font-medium">Delivery</span>
                </div>
                <div className={`w-6 h-0.5 transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center space-y-1 transition-all duration-300 ${step >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 ${
                    step >= 2 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                  }`}>
                    2
                  </div>
                  <span className="text-xs font-medium">Payment</span>
                </div>
                <div className={`w-6 h-0.5 transition-all duration-300 ${step >= 3 ? 'bg-gradient-to-r from-orange-400 to-red-400' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center space-y-1 transition-all duration-300 ${step >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all duration-300 ${
                    step >= 3 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-200' : 'bg-gray-100 shadow-gray-200'
                  }`}>
                    3
                  </div>
                  <span className="text-xs font-medium">Confirm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between h-20">
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
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-3 sm:space-y-4">
                    {addresses.map(address => (
                      <div key={address.id} className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                        selectedAddress === address.id
                          ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}>
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <RadioGroupItem
                            value={address.id}
                            id={address.id}
                            className="mt-1 flex-shrink-0"
                          />
                          <Label htmlFor={address.id} className="flex-1 cursor-pointer min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 gap-2">
                                  <span className="font-bold text-base sm:text-lg text-gray-900 truncate">{address.name}</span>
                                  <div className="flex items-center space-x-2">
                                    {address.isDefault && (
                                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-sm text-xs">
                                        Default
                                      </Badge>
                                    )}
                                    <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                                      address.type === "home"
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-purple-100 text-purple-600'
                                    }`}>
                                      {address.type === "home" ? <Home className="h-3 w-3 sm:h-4 sm:w-4" /> : <Building className="h-3 w-3 sm:h-4 sm:w-4" />}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-700 font-medium mb-1 text-sm sm:text-base leading-tight">{address.address}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                  <p className="text-gray-600 text-xs sm:text-sm">{address.city}, {address.state}</p>
                                  <p className="text-gray-600 text-xs sm:text-sm font-medium">{address.phone}</p>
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                        {selectedAddress === address.id && (
                          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
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
                              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
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

              {/* Delivery Schedule - Responsive */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    <span className="text-sm sm:text-base">Schedule Your Delivery</span>
                  </h2>
                  <p className="text-orange-100 mt-1 text-sm sm:text-base">Choose when you'd like your order delivered</p>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {deliverySlots.length === 0 && !deliverySlotsLoading && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-yellow-800 mb-1">Delivery dates not available</h4>
                          <p className="text-xs text-yellow-700 mb-3">
                            No delivery slots have been configured yet. Configure delivery options to continue with your order.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={() => setShowCreateSlotsModal(true)}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 h-8"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Configure Slots
                            </Button>
                            {user?.role === 'ADMIN' && (
                              <Button
                                onClick={() => window.open('/dashboard?tab=deliveries', '_blank')}
                                variant="outline"
                                size="sm"
                                className="text-xs px-3 py-1 h-8 border-orange-300 text-orange-700 hover:bg-orange-50"
                              >
                                Advanced Setup
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                      Preferred Delivery Date
                    </Label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setShowDeliveryDateDropdown(!showDeliveryDateDropdown)}
                        disabled={deliverySlotsLoading || deliverySlots.length === 0}
                        className="w-full h-12 border-2 focus:border-orange-500 bg-white text-sm sm:text-base px-3 py-2 text-left rounded-md flex items-center justify-between hover:border-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className={deliveryDate ? "text-gray-900" : "text-gray-500"}>
                          {deliverySlotsLoading
                            ? "Loading delivery dates..."
                            : deliveryDate
                            ? `${new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long' })}, ${new Date(deliveryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                            : deliverySlots.length === 0
                            ? "No delivery dates available"
                            : "Select delivery date"
                          }
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </button>

                      {showDeliveryDateDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-md shadow-2xl z-[9999] max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
                          {deliverySlotsLoading ? (
                            <div className="px-3 py-4 text-center text-gray-500 text-sm">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto mb-2"></div>
                              Loading delivery dates...
                            </div>
                          ) : [...new Set(deliverySlots.map(slot => new Date(slot.date).toISOString().split('T')[0]))].length === 0 ? (
                            <div className="px-3 py-6 text-center">
                              <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 mb-2">No delivery dates available</p>
                              <p className="text-xs text-gray-400">Please contact support or try again later</p>
                            </div>
                          ) : (
                            [...new Set(deliverySlots.map(slot => new Date(slot.date).toISOString().split('T')[0]))].map(date => (
                              <button
                                key={`date-${date}`}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setDeliveryDate(date)
                                  setShowDeliveryDateDropdown(false)
                                }}
                                className="w-full h-12 sm:h-14 hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2 text-left border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="flex flex-col items-start">
                                  <span className="font-medium text-gray-900 text-sm sm:text-base">
                                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                                  </span>
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {deliveryDate && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-orange-600" />
                        Preferred Time Slot
                      </Label>
                      <RadioGroup value={deliveryTime} onValueChange={setDeliveryTime} className="space-y-2 sm:space-y-3">
                        {deliverySlots
                          .filter(slot => new Date(slot.date).toISOString().split('T')[0] === deliveryDate && slot.isAvailable && slot.currentOrders < slot.maxOrders)
                        .map(slot => (
                            <div key={slot.id} className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                              deliveryTime === slot.timeSlot
                                ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
                                : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                            }`}>
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <RadioGroupItem value={slot.timeSlot} id={slot.id} className="flex-shrink-0" />
                                <Label htmlFor={slot.id} className="flex-1 cursor-pointer min-w-0">
                                  <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="font-semibold text-gray-900 text-sm sm:text-base block truncate">{slot.timeSlot}</span>
                                      <p className="text-xs sm:text-sm text-gray-600">Fast & reliable delivery</p>
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
                      className="border-2 focus:border-orange-500 resize-none bg-white text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 sm:p-5">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="p-2 sm:p-3 bg-orange-100 rounded-xl flex-shrink-0">
                        <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-orange-900 mb-2 text-sm sm:text-base">🚚 Delivery Information</h3>
                        <ul className="text-xs sm:text-sm text-orange-800 space-y-1 sm:space-y-1.5">
                          <li className="flex items-center">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0" />
                            <span className="truncate">Orders delivered within 4 hours of scheduled time</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0" />
                            <span className="truncate">Place orders before 10 AM for same-day delivery</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0" />
                            <span className="truncate">Orders after 3 PM delivered next day</span>
                          </li>
                          <li className="flex items-center">
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-orange-600 flex-shrink-0" />
                            <span className="truncate">SMS & email updates on delivery status</span>
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
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      🛒 Order Summary
                    </h2>
                    <p className="text-orange-100 mt-1">{totalItems} items in your cart</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3 sm:space-y-4 mb-6">
                      {items.map(item => (
                        <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs sm:text-sm font-bold text-orange-600">{item.quantity}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600">₦{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 border-t border-orange-200 pt-4">
                      <div className="flex justify-between items-center bg-orange-50 p-3 rounded-lg">
                        <span className="text-gray-700 text-sm sm:text-base">Subtotal</span>
                        <span className="font-semibold text-orange-700 text-sm sm:text-base">₦{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-700 text-sm sm:text-base">Delivery Fee</span>
                        <span className={`font-semibold text-sm sm:text-base ${deliveryFee === 0 ? 'text-green-600' : 'text-orange-700'}`}>
                          {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="relative">
                        <div className="border-t border-orange-300 pt-3">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-4 rounded-lg">
                            <span className="text-base sm:text-lg font-bold">Total</span>
                            <span className="text-base sm:text-lg font-bold">
                              ₦{finalTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setStep(2)}
                      className="w-full h-12 sm:h-14 mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 text-sm sm:text-base"
                      disabled={!selectedAddress || !deliveryDate || !deliveryTime}
                    >
                      Continue to Payment →
                    </Button>

                    {!selectedAddress && (
                      <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center justify-center">
                        <span className="mr-1">⚠️</span> Please select a delivery address
                      </p>
                    )}
                    {selectedAddress && (!deliveryDate || !deliveryTime) && (
                      <p className="text-xs sm:text-sm text-red-600 mt-2 flex items-center justify-center">
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
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3 sm:space-y-4">
                    {/* Credit/Debit Card */}
                    <div className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "card"
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
                        : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                    }`}>
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <RadioGroupItem value="card" id="card" className="text-orange-600 mt-1" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl flex-shrink-0">
                              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-lg sm:text-xl text-gray-900 mb-1">Credit/Debit Card</div>
                              <div className="text-sm text-gray-600 mb-2">Visa, Mastercard, Verve accepted</div>
                              <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                  <div className="w-6 h-4 sm:w-8 sm:h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                                  <div className="w-6 h-4 sm:w-8 sm:h-5 bg-gradient-to-r from-red-600 to-red-700 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                                  <div className="w-6 h-4 sm:w-8 sm:h-5 bg-gradient-to-r from-purple-600 to-purple-700 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Label>
                        <div className="text-green-600 flex-shrink-0">
                          <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                      </div>
                      {paymentMethod === "card" && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Wallet Balance */}
                    <div className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "wallet"
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg'
                        : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                    }`}>
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <RadioGroupItem value="wallet" id="wallet" className="text-green-600 mt-1" />
                        <Label htmlFor="wallet" className="flex-1 cursor-pointer min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="p-3 sm:p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex-shrink-0">
                              <span className="text-2xl sm:text-3xl">💰</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-lg sm:text-xl text-gray-900 mb-1">Wallet Balance</div>
                              <div className="text-sm text-gray-600 mb-2">Instant payment from your wallet</div>
                              <div className="text-base sm:text-lg font-bold text-green-600">
                                ₦{walletBalance.toLocaleString()} available
                              </div>
                            </div>
                          </div>
                        </Label>
                        <div className="flex-shrink-0">
                          {walletBalance >= finalTotal ? (
                            <div className="text-green-600">
                              <Check className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                          ) : (
                            <div className="text-gray-400">
                              <X className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                          )}
                        </div>
                      </div>
                      {paymentMethod === "wallet" && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Bank Transfer (Paystack) */}
                    <div className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      paymentMethod === "paystack"
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}>
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <RadioGroupItem value="paystack" id="paystack" className="text-purple-600 mt-1" />
                        <Label htmlFor="paystack" className="flex-1 cursor-pointer min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex-shrink-0">
                              <span className="text-2xl sm:text-3xl">🏦</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-lg sm:text-xl text-gray-900 mb-1">Bank Transfer</div>
                              <div className="text-sm text-gray-600 mb-2">Paystack - secure bank transfers</div>
                              <div className="text-sm text-purple-600 font-medium">
                                Direct bank transfer or USSD
                              </div>
                            </div>
                          </div>
                        </Label>
                        <div className="text-purple-600 flex-shrink-0">
                          <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                      </div>
                      {paymentMethod === "paystack" && (
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
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
                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <div className="flex justify-between items-center py-3 px-3 sm:px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium text-sm sm:text-base">Subtotal</span>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">₦{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 px-3 sm:px-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700 font-medium text-sm sm:text-base">Delivery Fee</span>
                      <span className={`font-bold text-sm sm:text-base ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {deliveryFee === 0 ? 'Free' : `₦${deliveryFee.toLocaleString()}`}
                      </span>
                    </div>
                    {useWallet && (
                      <div className="flex justify-between items-center py-3 px-3 sm:px-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <span className="font-medium text-green-900 text-sm sm:text-base">Wallet Deduction</span>
                        <span className="font-bold text-green-600 text-sm sm:text-base">-₦{walletDeduction.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-gray-300 pt-4 mt-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-lg sm:text-xl font-bold text-gray-900">Total to Pay</span>
                        <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          ₦{finalTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-all duration-300"
                      >
                        ← Back
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        className="flex-1 h-12 sm:h-14 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            💳 Complete Order • ₦{finalTotal.toLocaleString()}
                          </>
                        )}
                      </Button>
                    </div>

                  {/* Order Summary Preview */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl">
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 mb-2">Payment Method</div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:space-x-2">
                        <div className="flex items-center justify-center space-x-2">
                          {paymentMethod === 'card' && <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />}
                          {paymentMethod === 'wallet' && <span className="text-base sm:text-lg">💰</span>}
                          {paymentMethod === 'paystack' && <span className="text-base sm:text-lg">🏦</span>}
                          <span className="text-sm font-medium text-gray-800">
                            {paymentMethod === 'card' ? 'Credit/Debit Card' :
                             paymentMethod === 'wallet' ? 'Wallet Balance' : 'Bank Transfer'}
                          </span>
                        </div>
                        {useWallet && paymentMethod === 'card' && (
                          <span className="text-xs text-green-600 font-medium">
                            (+₦{walletDeduction.toLocaleString()} from wallet)
                          </span>
                        )}
                      </div>
                    </div>
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
                      📋 Order Confirmed
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
                      <div className="flex justify-between items-center py-2 border-b border-blue-200">
                        <span className="text-blue-700 font-medium">Delivery Time:</span>
                        <span className="text-blue-900">{deliveryTime}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-blue-700 font-medium">Payment Method:</span>
                        <span className="text-blue-900 font-medium">
                          {paymentMethod === 'card' ? 'Credit/Debit Card' :
                           paymentMethod === 'wallet' ? 'Wallet Balance' : 'Bank Transfer'}
                        </span>
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold"
                >
                  📊 View Orders
                </Button>
                <Button
                  onClick={() => router.push('/marketplace')}
                  variant="outline"
                  className="flex-1 h-12 border-2 hover:bg-gray-50 font-semibold"
                >
                  🛒 Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Delivery Slots Modal */}
      <Dialog open={showCreateSlotsModal} onOpenChange={setShowCreateSlotsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-orange-700">
              <Calendar className="h-5 w-5 mr-2" />
              Configure Delivery Slots
            </DialogTitle>
            <DialogDescription>
              Customize delivery slots for your store. Choose which days and times to offer delivery.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Days Configuration */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">How many days ahead to create slots?</Label>
              <Select
                value={slotConfig.daysAhead.toString()}
                onValueChange={(value) => setSlotConfig(prev => ({ ...prev, daysAhead: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Slots Configuration */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Which time slots to offer?</Label>
              <div className="space-y-2">
                {slotConfig.timeSlots.map((slot, index) => (
                  <div key={slot.time} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`time-${index}`}
                      checked={slot.enabled}
                      onChange={(e) => {
                        const newTimeSlots = [...slotConfig.timeSlots]
                        newTimeSlots[index].enabled = e.target.checked
                        setSlotConfig(prev => ({ ...prev, timeSlots: newTimeSlots }))
                      }}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <Label htmlFor={`time-${index}`} className="text-sm text-gray-700 cursor-pointer">
                      {slot.time}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Capacity and Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Max Orders per Slot</Label>
                <Input
                  type="number"
                  value={slotConfig.maxOrders}
                  onChange={(e) => setSlotConfig(prev => ({ ...prev, maxOrders: parseInt(e.target.value) || 10 }))}
                  min="1"
                  max="50"
                  className="h-10"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">Extra Fee (₦) <span className="text-gray-500 text-xs">Optional</span></Label>
                <Input
                  type="number"
                  value={slotConfig.price}
                  onChange={(e) => setSlotConfig(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="h-10"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Summary:</h4>
              <p className="text-sm text-blue-800">
                This will create <strong>{slotConfig.daysAhead * slotConfig.timeSlots.filter(s => s.enabled).length}</strong> delivery slots
                ({slotConfig.daysAhead} days × {slotConfig.timeSlots.filter(s => s.enabled).length} time slots)
                starting tomorrow.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={createDeliverySlots}
                disabled={deliverySlotsLoading || slotConfig.timeSlots.filter(s => s.enabled).length === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                {deliverySlotsLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Slots...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create {slotConfig.daysAhead * slotConfig.timeSlots.filter(s => s.enabled).length} Slots
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowCreateSlotsModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
