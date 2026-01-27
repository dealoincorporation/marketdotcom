// Re-export all email functions and types
export * from './types'
export * from './senders/order-emails'
export * from './senders/auth-emails'
export * from './senders/admin-emails'

// Explicit exports for better TypeScript resolution
export {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
  sendOrderStatusUpdateEmail,
} from './senders/order-emails'

export {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from './senders/auth-emails'

export {
  sendAdminUserRegistrationNotification,
  sendAdminPaymentNotification,
  sendAdminWalletDepositNotification,
  sendAdminOrderStatusUpdateNotification,
} from './senders/admin-emails'
