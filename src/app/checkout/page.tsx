"use client"

import { Suspense } from "react"
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
import { NotificationModal } from "@/components/ui/notification-modal"
import { useNotification } from "@/hooks/useNotification"
import { useCheckout } from "./hooks/useCheckout"
import { Loader2 } from "lucide-react"

function CheckoutContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { notification, showConfirm, closeNotification } = useNotification()

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
    handleDeleteAddress,
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
    totalWeight,
    deliveryFee,
    walletDeduction,
    finalTotal,
    moqNotMet,
    moqQuantityNotMet,
    moqAmountNotMet,
    minimumOrderQuantity,
    minimumOrderAmount,
    handleAddNewAddress,
    handlePlaceOrder,
    createDeliverySlots,
    orderId,
    deliverySlotDescription,
    showSlotFullModal,
    setShowSlotFullModal,
    deliveryInfoPoints,
  } = useCheckout()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden w-full max-w-full">
      <CheckoutHeader step={step} totalItems={totalItems} subtotal={subtotal} />

      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 overflow-x-hidden box-border pb-[env(safe-area-inset-bottom)]">
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 min-w-0">
            {/* Delivery Information */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0 overflow-hidden">
              <DeliveryAddressSection
                addresses={addresses}
                selectedAddress={selectedAddress}
                onAddressSelect={setSelectedAddress}
                onDeleteAddress={handleDeleteAddress}
                showConfirm={showConfirm}
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
                deliveryInfoPoints={deliveryInfoPoints}
              />
            </div>

            {/* Order Summary */}
            <OrderSummary
              items={items}
              totalItems={totalItems}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              totalWeight={totalWeight}
              finalTotal={finalTotal}
              selectedAddress={selectedAddress}
              deliveryDate={deliveryDate}
              deliveryTime={deliveryTime}
              deliverySlotDescription={deliverySlotDescription}
              moqNotMet={moqNotMet}
              moqQuantityNotMet={moqQuantityNotMet}
              moqAmountNotMet={moqAmountNotMet}
              minimumOrderQuantity={minimumOrderQuantity}
              minimumOrderAmount={minimumOrderAmount}
              onContinue={() => setStep(2)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 min-w-0">
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
              moqNotMet={moqNotMet}
              moqQuantityNotMet={moqQuantityNotMet}
              moqAmountNotMet={moqAmountNotMet}
              minimumOrderQuantity={minimumOrderQuantity}
              minimumOrderAmount={minimumOrderAmount}
              totalItems={totalItems}
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
            deliverySlotDescription={deliverySlotDescription}
            paymentMethod={paymentMethod}
            selectedAddress={selectedAddress}
            addresses={addresses}
            orderId={orderId || undefined}
          />
        )}
      </div>

      {/* Address delete / confirm modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        onCancel={notification.onCancel}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
      />

      {/* Create Delivery Slots Modal (admin only) */}
      <CreateDeliverySlotsModal
        open={showCreateSlotsModal && user?.role === 'ADMIN'}
        onOpenChange={setShowCreateSlotsModal}
        slotConfig={slotConfig}
        onSlotConfigChange={setSlotConfig}
        loading={deliverySlotsLoading}
        onCreateSlots={createDeliverySlots}
      />

      {/* Slot full – deliveries exceeded for the day */}
      {showSlotFullModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Deliveries exceeded for this day</h3>
            <p className="text-gray-600">
              The number of orders we can deliver today has been reached. If you place your order now, <strong>your products will be delivered the next available day</strong>. You will get a notification when your delivery is scheduled.
            </p>
            <p className="text-sm text-gray-500">
              You can choose another slot below if one is still available, or continue to place your order for delivery on the next day.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSlotFullModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Choose another slot
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSlotFullModal(false)
                  handlePlaceOrder(true)
                }}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
              >
                Place order (next day delivery)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
