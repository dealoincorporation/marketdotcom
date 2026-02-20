import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useCartStore, roundCurrency } from "@/lib/cart-store"
import { useAddressStore } from "@/lib/address-store"
import { toast } from "react-hot-toast"
import type { Address, DeliverySlot, NewAddress, SlotConfig } from "../types"

export function useCheckout() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, getTotalItems, getTotalPrice, getTotalWeight: getCartTotalWeight, clearCart } = useCartStore()
  const {
    addresses,
    fetchAddresses,
    addAddress,
    deleteAddress,
    getDefaultAddress,
  } = useAddressStore()

  const [loading, setLoading] = useState(false)
  const [addressesLoaded, setAddressesLoaded] = useState(false)
  const [step, setStep] = useState(1)
  const [orderId, setOrderId] = useState<string | null>(null)

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
    state: "Lagos",
    postalCode: "",
    phone: ""
  })

  // Payment Information
  const [paymentMethod, setPaymentMethod] = useState("paystack")
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
  const [showSlotFullModal, setShowSlotFullModal] = useState(false)

  // Delivery & MOQ settings (fetched from API)
  const [deliverySettings, setDeliverySettings] = useState<{
    baseFee: number
    feePerKg: number
    feeTier1: number
    feeTier2: number
    feeTier3: number
    minimumOrderQuantity: number
    minimumOrderAmount: number
    deliveryInfoPoints: string[]
  } | null>(null)

  const totalItems = getTotalItems()
  const subtotal = getTotalPrice()
  const totalWeight = getCartTotalWeight()

  // Weight-tier delivery fee: 1-50kg, 51-100kg, 100kg+
  const feeTier1 = deliverySettings?.feeTier1 ?? 2000
  const feeTier2 = deliverySettings?.feeTier2 ?? 3500
  const feeTier3 = deliverySettings?.feeTier3 ?? 5000
  const minimumOrderQuantity = deliverySettings?.minimumOrderQuantity ?? 1
  const minimumOrderAmount = deliverySettings?.minimumOrderAmount ?? 0

  const calculatedDeliveryFee = items.length === 0
    ? 0
    : totalWeight <= 0
      ? feeTier1
      : totalWeight <= 50
        ? feeTier1
        : totalWeight <= 100
          ? feeTier2
          : feeTier3

  const deliveryFee = calculatedDeliveryFee
  const moqQuantityNotMet = totalItems < minimumOrderQuantity
  const moqAmountNotMet = minimumOrderAmount > 0 && subtotal < minimumOrderAmount
  const moqNotMet = moqQuantityNotMet || moqAmountNotMet
  const grossTotal = roundCurrency(subtotal + deliveryFee)
  const walletDeduction = useWallet ? roundCurrency(Math.min(walletBalance, grossTotal)) : 0
  const finalTotal = Math.max(0, roundCurrency(grossTotal - walletDeduction))

  const selectedSlot = deliveryDate && deliveryTime
    ? deliverySlots.find(
        s => new Date(s.date).toISOString().split('T')[0] === deliveryDate && s.timeSlot === deliveryTime
      )
    : null
  const deliverySlotDescription = selectedSlot?.description?.trim() ?? ''
  const selectedSlotAtCapacity = selectedSlot != null && selectedSlot.currentOrders >= selectedSlot.maxOrders

  // Fetch delivery & MOQ settings
  const fetchDeliverySettings = async () => {
    try {
      const res = await fetch("/api/delivery-settings", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setDeliverySettings({
          baseFee: data.baseFee ?? 500,
          feePerKg: data.feePerKg ?? 50,
          feeTier1: data.feeTier1 ?? 2000,
          feeTier2: data.feeTier2 ?? 3500,
          feeTier3: data.feeTier3 ?? 5000,
          minimumOrderQuantity: data.minimumOrderQuantity ?? 1,
          minimumOrderAmount: data.minimumOrderAmount ?? 0,
          deliveryInfoPoints: Array.isArray(data.deliveryInfoPoints) ? data.deliveryInfoPoints : [],
        })
      }
    } catch {
      setDeliverySettings({
        baseFee: 500,
        feePerKg: 50,
        feeTier1: 2000,
        feeTier2: 3500,
        feeTier3: 5000,
        minimumOrderQuantity: 1,
        minimumOrderAmount: 0,
        deliveryInfoPoints: [],
      })
    }
  }

  // Fetch delivery slots
  const fetchDeliverySlots = async () => {
    try {
      setDeliverySlotsLoading(true)
      const response = await fetch('/api/delivery-slots', {
        cache: 'no-store'
      })
      if (response.ok) {
        const slots = await response.json()
        setDeliverySlots(Array.isArray(slots) ? slots : [])
      } else {
        console.error('Failed to fetch delivery slots:', response.status, response.statusText)
        setDeliverySlots([])
      }
    } catch (error) {
      console.error('Error fetching delivery slots:', error)
      setDeliverySlots([])
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
        state: "Lagos",
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

  // Handle delete address
  const handleDeleteAddress = async (id: string) => {
    const wasSelected = selectedAddress === id
    const success = await deleteAddress(id)
    if (success && wasSelected) {
      const remaining = addresses.filter((a) => a.id !== id)
      setSelectedAddress(remaining.length > 0 ? remaining[0].id : '')
    }
  }

  // Create order after payment (for wallet payments)
  const createOrderAfterPayment = async () => {
    try {
      const token = localStorage.getItem('token')
      const fullAmount = roundCurrency(subtotal + deliveryFee)
      // When paying 100% with wallet, ensure we deduct the full amount (useWallet checkbox is only for Paystack)
      const isFullWalletPayment = paymentMethod === 'wallet'
      const walletDed = isFullWalletPayment
        ? roundCurrency(Math.min(walletBalance, fullAmount))
        : walletDeduction
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          variationId: item.variationId || null,
          name: item.name,
          quantity: item.quantity,
          unitPrice: roundCurrency(item.price),
          totalPrice: roundCurrency(item.price * item.quantity),
          unit: item.unit
        })),
        deliveryAddress: addresses.find(addr => addr.id === selectedAddress) || null,
        deliveryDate,
        deliveryTime,
        deliveryNotes,
        paymentMethod,
        useWallet: isFullWalletPayment ? true : useWallet,
        subtotal,
        deliveryFee,
        walletDeduction: walletDed,
        finalTotal: Math.max(0, roundCurrency(fullAmount - walletDed)),
        skipEmails: false,
        slotAtCapacity: selectedSlotAtCapacity
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

      const result = await response.json()
      setOrderId(result.orderId) // Store orderId for confirmation page
      clearCart()
      setStep(3)
      toast.success(
        selectedSlotAtCapacity
          ? "🎉 Order placed! Delivery will be the next available day (today's limit was reached). We'll notify you when it's scheduled."
          : '🎉 Order placed successfully! Your order is being processed.',
        { duration: 5000, icon: '✅' }
      )
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create order')
      throw error
    }
  }

  // Handle Paystack payment. Order is created only after successful payment (no orderId; pass orderData).
  const handlePaystackPayment = async (amount: number, options: { orderData?: object; orderId?: string | null }) => {
    try {
      const { orderData, orderId } = options
      if (!orderData && !orderId) {
        throw new Error('Order data or order ID is required for payment')
      }

      console.log('Initializing Paystack payment...', { amount, hasOrderData: !!orderData })
      const token = localStorage.getItem('token')
      const body: Record<string, unknown> = {
        amount,
        paymentMethod: paymentMethod || 'paystack'
      }
      if (orderData) {
        body.orderData = orderData
      } else if (orderId) {
        body.orderId = orderId
      }
      const paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body),
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json().catch(() => ({ error: 'Failed to initialize payment' }))
        console.error('Payment initialization failed:', errorData)
        throw new Error(errorData.error || 'Failed to initialize payment')
      }

      const paymentData = await paymentResponse.json()
      console.log('Payment initialized:', paymentData.reference)

      if (!window.PaystackPop) {
        await loadPaystackScript()
      }

      if (!window.PaystackPop) {
        throw new Error('Paystack script failed to load')
      }

      let paymentVerified = false
      
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_9071bb582b6486e980b86bce551587236426329a',
        email: user?.email || '',
        amount: amount * 100,
        reference: paymentData.reference,
        callback: function(response: any) {
          console.log('Paystack callback triggered:', response)
          if (response.status === 'success' && response.reference) {
            paymentVerified = true
            verifyPayment(response.reference)
          }
        },
        onClose: function() {
          console.log('Payment popup closed')
          // If payment wasn't verified yet, check if it succeeded
          // This handles cases where Paystack callback might not fire properly
          if (!paymentVerified) {
            setTimeout(async () => {
              console.log('Checking payment status after popup close...', paymentData.reference)
              try {
                await verifyPayment(paymentData.reference)
              } catch (error) {
                // If verification fails, user likely cancelled
                console.log('Payment verification failed (user may have cancelled)')
                setLoading(false)
              }
            }, 2000) // Wait 2 seconds for Paystack to process
          } else {
            // Payment was already verified, just reset loading if needed
            setLoading(false)
          }
        }
      })

      handler.openIframe()
    } catch (error) {
      console.error('Error initializing Paystack payment:', error)
      setLoading(false)
      toast.error(error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.')
    }
  }

  // Verify payment
  const verifyPayment = async (reference: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ reference }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to verify payment' }))
        throw new Error(errorData.error || 'Payment verification failed')
      }

      const result = await response.json()
      console.log('Payment verification response:', result)

      // Check if payment was successful - handle both 'COMPLETED' and 'success' status
      const isPaymentSuccessful = result.success && (
        result.paymentStatus === 'COMPLETED' || 
        result.transactionData?.status === 'success' ||
        result.orderStatus === 'CONFIRMED'
      )

      if (isPaymentSuccessful) {
        console.log('Payment verified successfully, redirecting to confirmation...')
        
        // Payment successful - order already exists and is now CONFIRMED
        // Store orderId and redirect to confirmation page
        if (result.orderId) {
          setOrderId(result.orderId)
          console.log('Order ID set:', result.orderId)
        }
        
        // Clear cart first
        clearCart()
        console.log('Cart cleared')
        
        // Set loading to false and redirect immediately
        setLoading(false)
        setStep(3)
        console.log('Redirected to step 3 (confirmation page)')
        
        // Show success toast (mention next-day delivery when slot was at capacity)
        const slotFull = result.slotAtCapacity === true
        toast.success(
          slotFull
            ? "🎉 Payment successful! Your order is confirmed. Delivery will be the next available day (today's limit was reached). We'll notify you when it's scheduled."
            : '🎉 Payment successful! Your order has been confirmed and is being processed.',
          {
            duration: 6000,
            icon: '✅',
            style: {
              background: 'rgba(34, 197, 94, 0.95)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            },
          }
        )
      } else {
        // Payment failed or pending
        console.error('Payment verification failed:', result)
        setLoading(false)
        const errorMessage = result.error || 'Payment verification failed. Please contact support.'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setLoading(false)
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed. Please contact support.'
      toast.error(errorMessage)
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

  // Handle place order (forcePlaceOrder: true when user confirms after slot-full modal)
  const handlePlaceOrder = async (forcePlaceOrder?: boolean) => {
    if (moqNotMet) {
      toast.error(
        moqQuantityNotMet && moqAmountNotMet
          ? `Minimum: ${minimumOrderQuantity} items and ₦${minimumOrderAmount.toLocaleString()} required to checkout`
          : moqQuantityNotMet
            ? `Add ${minimumOrderQuantity - totalItems} more items to meet minimum order (${minimumOrderQuantity} required)`
            : `Add ₦${(minimumOrderAmount - subtotal).toLocaleString()} more to meet minimum order amount`
      )
      return
    }

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

    if (selectedSlotAtCapacity && !forcePlaceOrder) {
      setShowSlotFullModal(true)
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
        // For wallet payment, create order immediately
        await createOrderAfterPayment()
      } else if (paymentMethod === 'paystack') {
        // For Paystack: no order until payment succeeds. Initialize with orderData, then open Paystack.
        const orderData = {
          items: items.map(item => ({
            productId: item.productId,
            variationId: item.variationId || null,
            name: item.name,
            quantity: item.quantity,
            unitPrice: roundCurrency(item.price),
            totalPrice: roundCurrency(item.price * item.quantity),
            unit: item.unit
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
          finalTotal,
          skipEmails: true,
          slotAtCapacity: selectedSlotAtCapacity
        }
        await handlePaystackPayment(finalTotal, { orderData })
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
      router.push('/dashboard?tab=marketplace')
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

  // When Paystack redirects to /checkout?reference=xxx, verify payment and show confirmation
  const verifiedRef = useRef<string | null>(null)
  useEffect(() => {
    const reference = searchParams.get('reference')
    if (!reference || verifiedRef.current === reference) return
    verifiedRef.current = reference
    verifyPayment(reference).finally(() => {
      router.replace('/checkout', { scroll: false })
    })
  }, [searchParams])

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
      // Start from today (i = 0) so users can get delivery as soon as they order
      for (let i = 0; i < slotConfig.daysAhead; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        const dateString = `${y}-${m}-${d}`

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
    orderId,
    
    // Computed
    totalItems,
    subtotal,
    totalWeight,
    deliveryFee,
    walletDeduction,
    finalTotal,
    moqNotMet,
    moqQuantityNotMet,
    moqAmountNotMet,
    minimumOrderQuantity,
    minimumOrderAmount,
    deliverySlotDescription,
    selectedSlotAtCapacity,
    showSlotFullModal,
    setShowSlotFullModal,
    deliveryInfoPoints: deliverySettings?.deliveryInfoPoints ?? [],

    // Actions
    handleAddNewAddress,
    handleDeleteAddress,
    handlePlaceOrder,
    fetchDeliverySlots,
    createDeliverySlots,
  }
}
