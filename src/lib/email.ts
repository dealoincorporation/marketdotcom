// Re-export all email functions from modular structure
export * from './email/index'

// Explicit re-exports for better TypeScript resolution
export {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
  sendOrderStatusUpdateEmail,
} from './email/index'

export {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from './email/index'

export {
  sendAdminUserRegistrationNotification,
  sendAdminPaymentNotification,
  sendAdminWalletDepositNotification,
  sendAdminOrderStatusUpdateNotification,
} from './email/index'
