import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useCartStore } from "@/lib/cart-store"
import { useAddressStore } from "@/lib/address-store"
import { toast } from "react-hot-toast"
import type { Address, DeliverySlot, NewAddress, SlotConfig } from "../types"

export function useCheckout() {
  const { user } = useAuth()
  const router = useRouter()
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore()
  const {
    addresses,
    fetchAddresses,
    addAddress,
    getDefaultAddress,
  } = useAddressStore()

  const [loading, setLoading] = useState(false)
  const [addressesLoaded, setAddressesLoaded] = useState(false)
  const [step, setStep] = useState(1)

  // Delivery Information
  const [selectedAddress, setSelectedAddress] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [deliveryTime, setDeliveryTime] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")

  // New Address Form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState<NewAddress>({
    type: "home",
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

  // Delivery Slots
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([])
  const [deliverySlotsLoading, setDeliverySlotsLoading] = useState(true)
  const [showDeliveryDateDropdown, setShowDeliveryDateDropdown] = useState(false)
  const [showCreateSlotsModal, setShowCreateSlotsModal] = useState(false)
  const [slotConfig, setSlotConfig] = useState<SlotConfig>({
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

  const dropdownRef = useRef<HTMLDivElement>(null)

  const totalItems = getTotalItems()
  const subtotal = getTotalPrice()
  const deliveryFee = subtotal > 10000 ? 0 : 1500
  const walletDeduction = useWallet ? Math.min(walletBalance, subtotal + deliveryFee) : 0
  const finalTotal = subtotal + deliveryFee - walletDeduction

  // Fetch delivery slots
  const fetchDeliverySlots = async () => {
    try {
      setDeliverySlotsLoading(true)
      const response = await fetch('/api/delivery-slots')
      if (response.ok) {
        const slots = await response.json()
        setDeliverySlots(slots)
      } else {
        // Fallback slots
        setDeliverySlots([
          { 
            id: "fallback-1", 
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            timeSlot: "10:00 AM - 2:00 PM", 
            isAvailable: true, 
            maxOrders: 10, 
            currentOrders: 0, 
            createdAt: new Date().toISOString(), 
            updatedAt: new Date().toISOString() 
          },
        ])
      }
    } catch (error) {
      console.error('Error fetching delivery slots:', error)
    } finally {
      setDeliverySlotsLoading(false)
    }
  }

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
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

  // Handle add new address
  const handleAddNewAddress = async () => {
    const addressData = {
      ...newAddress,
      userId: user?.id,
      isDefault: addresses.length === 0
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
      await fetchAddresses()
      const defaultAddr = getDefaultAddress()
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id)
      }
    }
  }

  // Create order after payment
  const createOrderAfterPayment = async () => {
    try {
      const token = localStorage.getItem('token')
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          variationId: null,
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

      clearCart()
      setStep(3)
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create order')
      throw error
    }
  }

  // Handle Paystack payment
  const handlePaystackPayment = async (orderId: string | null, amount: number) => {
    try {
      const token = localStorage.getItem('token')
      const paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          orderId: orderId || undefined,
          amount,
          paymentMethod: paymentMethod || 'paystack'
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error('Failed to initialize payment')
      }

      const paymentData = await paymentResponse.json()

      if (!window.PaystackPop) {
        await loadPaystackScript()
      }

      if (!window.PaystackPop) {
        throw new Error('Paystack script failed to load')
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_9071bb582b6486e980b86bce551587236426329a',
        email: user?.email || '',
        amount: amount * 100,
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
          verifyPayment(transaction.reference)
        }
      })

      handler.openIframe()
    } catch (error) {
      console.error('Error initializing Paystack payment:', error)
      toast.error('Failed to initialize payment. Please try again.')
    }
  }

  // Verify payment
  const verifyPayment = async (reference: string) => {
    try {
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
        try {
          await createOrderAfterPayment()
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

  // Load Paystack script
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

  // Handle place order
  const handlePlaceOrder = async () => {
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
      if (paymentMethod === 'wallet') {
        await createOrderAfterPayment()
      } else if (paymentMethod === 'paystack' || paymentMethod === 'card') {
        await handlePaystackPayment(null, finalTotal)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to place order')
      setLoading(false)
    }
  }

  // Initialize data
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }

    if (items.length === 0) {
      router.push('/cart')
      return
    }

    const loadData = async () => {
      await Promise.all([
        fetchAddresses(),
        fetchWalletBalance()
      ])
      setAddressesLoaded(true)

      const defaultAddr = getDefaultAddress()
      if (defaultAddr && !selectedAddress) {
        setSelectedAddress(defaultAddr.id)
      }
    }

    loadData()
  }, [user, items, router, fetchAddresses, getDefaultAddress])

  useEffect(() => {
    fetchDeliverySlots()
  }, [])

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

  // Create delivery slots
  const createDeliverySlots = async () => {
    try {
      setDeliverySlotsLoading(true)
      const token = localStorage.getItem('token')
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
        await fetchDeliverySlots()
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

  return {
    // State
    loading,
    step,
    setStep,
    selectedAddress,
    setSelectedAddress,
    deliveryDate,
    setDeliveryDate,
    deliveryTime,
    setDeliveryTime,
    deliveryNotes,
    setDeliveryNotes,
    showNewAddressForm,
    setShowNewAddressForm,
    newAddress,
    setNewAddress,
    paymentMethod,
    setPaymentMethod,
    useWallet,
    setUseWallet,
    walletBalance,
    deliverySlots,
    deliverySlotsLoading,
    showDeliveryDateDropdown,
    setShowDeliveryDateDropdown,
    showCreateSlotsModal,
    setShowCreateSlotsModal,
    slotConfig,
    setSlotConfig,
    dropdownRef,
    addresses,
    items,
    
    // Computed
    totalItems,
    subtotal,
    deliveryFee,
    walletDeduction,
    finalTotal,
    
    // Actions
    handleAddNewAddress,
    handlePlaceOrder,
    fetchDeliverySlots,
    createDeliverySlots,
  }
}
