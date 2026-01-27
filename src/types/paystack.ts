declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string
        email: string
        amount: number
        currency?: string
        ref?: string
        reference?: string
        callback?: (response: any) => void
        onClose?: () => void
        onSuccess?: (transaction: any) => void
      }) => { openIframe: () => void }
    }
  }
}

export {}