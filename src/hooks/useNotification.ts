import { useState, useCallback } from "react"
import { NotificationType } from "@/components/ui/notification-modal"

export interface NotificationState {
  isOpen: boolean
  type: NotificationType
  title: string
  message: string
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  })

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void
      onCancel?: () => void
      confirmText?: string
      cancelText?: string
    }
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel || (() => setNotification(prev => ({ ...prev, isOpen: false }))),
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
    })
  }, [])

  const showSuccess = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showNotification("success", title, message, {
      onConfirm: onConfirm || (() => setNotification(prev => ({ ...prev, isOpen: false }))),
      confirmText: "OK",
    })
  }, [showNotification])

  const showError = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showNotification("error", title, message, {
      onConfirm: onConfirm || (() => setNotification(prev => ({ ...prev, isOpen: false }))),
      confirmText: "OK",
    })
  }, [showNotification])

  const showWarning = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showNotification("warning", title, message, {
      onConfirm: onConfirm || (() => setNotification(prev => ({ ...prev, isOpen: false }))),
      confirmText: "OK",
    })
  }, [showNotification])

  const showInfo = useCallback((title: string, message: string, onConfirm?: () => void) => {
    showNotification("info", title, message, {
      onConfirm: onConfirm || (() => setNotification(prev => ({ ...prev, isOpen: false }))),
      confirmText: "OK",
    })
  }, [showNotification])

  const showConfirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showNotification("confirm", title, message, {
      onConfirm: () => {
        onConfirm()
        setNotification(prev => ({ ...prev, isOpen: false }))
      },
      onCancel: () => {
        onCancel?.()
        setNotification(prev => ({ ...prev, isOpen: false }))
      },
      confirmText: "Confirm",
      cancelText: "Cancel",
    })
  }, [showNotification])

  const showConfirmPromise = useCallback((
    title: string,
    message: string
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      showNotification("confirm", title, message, {
        onConfirm: () => {
          setNotification(prev => ({ ...prev, isOpen: false }))
          resolve(true)
        },
        onCancel: () => {
          setNotification(prev => ({ ...prev, isOpen: false }))
          resolve(false)
        },
        confirmText: "Confirm",
        cancelText: "Cancel",
      })
    })
  }, [showNotification])

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showConfirmPromise,
    closeNotification,
  }
}
