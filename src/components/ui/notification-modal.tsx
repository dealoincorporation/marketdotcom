"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Trash2 } from "lucide-react"
import { Button } from "./button"

export type NotificationType = "success" | "error" | "warning" | "info" | "confirm"

export interface NotificationModalProps {
  isOpen: boolean
  type: NotificationType
  title: string
  message: string
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

export function NotificationModal({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
}: NotificationModalProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    confirm: AlertCircle,
  }

  const colors = {
    success: {
      icon: "text-green-500",
      bg: "from-green-500/20 to-emerald-500/20",
      border: "border-green-500/30",
      button: "bg-green-600 hover:bg-green-700",
    },
    error: {
      icon: "text-red-500",
      bg: "from-red-500/20 to-rose-500/20",
      border: "border-red-500/30",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: "text-yellow-500",
      bg: "from-yellow-500/20 to-amber-500/20",
      border: "border-yellow-500/30",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      icon: "text-blue-500",
      bg: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    confirm: {
      icon: "text-orange-500",
      bg: "from-orange-500/20 to-red-500/20",
      border: "border-orange-500/30",
      button: "bg-orange-600 hover:bg-orange-700",
    },
  }

  const Icon = icons[type]
  const colorScheme = colors[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className={`relative w-full max-w-md bg-gradient-to-br ${colorScheme.bg} backdrop-blur-xl rounded-2xl border-2 ${colorScheme.border} shadow-2xl pointer-events-auto overflow-hidden`}
            >
              {/* Glassmorphism effect */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md"></div>
              
              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Close button */}
                <button
                  onClick={onCancel}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

                {/* Icon and Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl bg-white/20 backdrop-blur-sm ${colorScheme.icon}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-700 leading-relaxed">{message}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  {type === "confirm" ? (
                    <>
                      <Button
                        onClick={onCancel}
                        variant="outline"
                        className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
                      >
                        {cancelText}
                      </Button>
                      <Button
                        onClick={onConfirm}
                        className={`flex-1 ${colorScheme.button} text-white`}
                      >
                        {confirmText}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={onConfirm || onCancel}
                      className={`w-full ${colorScheme.button} text-white`}
                    >
                      {confirmText}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
