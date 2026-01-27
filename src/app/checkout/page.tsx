"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { CheckoutHeader } from "./components/CheckoutHeader"
import { DeliveryAddressSection } from "./components/DeliveryAddressSection"
import { DeliveryScheduleSection } from "./components/DeliveryScheduleSection"
import { PaymentMethodSection } from "./components/PaymentMethodSection"
import { OrderSummary } from "./components/OrderSummary"
import { PaymentSummary } from "./components/PaymentSummary"
import { CheckoutConfirmation } from "./components/CheckoutConfirmation"
import { CreateDeliverySlotsModal } from "./components/CreateDeliverySlotsModal"
import { useCheckout } from "./hooks/useCheckout"
import { toast } from "react-hot-toast"

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()

  const {
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
    totalItems,
    subtotal,
    deliveryFee,
    walletDeduction,
    finalTotal,
    handleAddNewAddress,
    handlePlaceOrder,
    createDeliverySlots,
  } = useCheckout()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden">
      <CheckoutHeader step={step} totalItems={totalItems} subtotal={subtotal} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 overflow-x-hidden">
        {step === 1 && (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Delivery Information */}
            <div className="lg:col-span-2 space-y-8">
              <DeliveryAddressSection
                addresses={addresses}
                selectedAddress={selectedAddress}
                onAddressSelect={setSelectedAddress}
                showNewAddressForm={showNewAddressForm}
                onShowNewAddressForm={setShowNewAddressForm}
                newAddress={newAddress}
                onNewAddressChange={setNewAddress}
                onAddAddress={handleAddNewAddress}
              />

              <DeliveryScheduleSection
                deliverySlots={deliverySlots}
                deliverySlotsLoading={deliverySlotsLoading}
                deliveryDate={deliveryDate}
                deliveryTime={deliveryTime}
                deliveryNotes={deliveryNotes}
                onDeliveryDateChange={setDeliveryDate}
                onDeliveryTimeChange={setDeliveryTime}
                onDeliveryNotesChange={setDeliveryNotes}
                showDeliveryDateDropdown={showDeliveryDateDropdown}
                onShowDeliveryDateDropdown={setShowDeliveryDateDropdown}
                dropdownRef={dropdownRef}
                onShowCreateSlotsModal={() => setShowCreateSlotsModal(true)}
              />
            </div>

            {/* Order Summary */}
            <OrderSummary
              items={items}
              totalItems={totalItems}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              finalTotal={finalTotal}
              selectedAddress={selectedAddress}
              deliveryDate={deliveryDate}
              deliveryTime={deliveryTime}
              onContinue={() => setStep(2)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Payment Information */}
            <div className="lg:col-span-2 space-y-8">
              <PaymentMethodSection
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                walletBalance={walletBalance}
                finalTotal={finalTotal}
                useWallet={useWallet}
                onUseWalletChange={setUseWallet}
              />
            </div>

            {/* Payment Summary */}
            <PaymentSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              walletDeduction={walletDeduction}
              finalTotal={finalTotal}
              paymentMethod={paymentMethod}
              useWallet={useWallet}
              loading={loading}
              onBack={() => setStep(1)}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>
        )}

        {step === 3 && (
          <CheckoutConfirmation
            finalTotal={finalTotal}
            deliveryDate={deliveryDate}
            deliveryTime={deliveryTime}
            paymentMethod={paymentMethod}
            selectedAddress={selectedAddress}
            addresses={addresses}
          />
        )}
      </div>

      {/* Create Delivery Slots Modal */}
      <CreateDeliverySlotsModal
        open={showCreateSlotsModal}
        onOpenChange={setShowCreateSlotsModal}
        slotConfig={slotConfig}
        onSlotConfigChange={setSlotConfig}
        loading={deliverySlotsLoading}
        onCreateSlots={createDeliverySlots}
      />
    </div>
  )
}
