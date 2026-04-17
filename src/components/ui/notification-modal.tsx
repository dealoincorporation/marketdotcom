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
            className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`relative w-full max-w-md bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_40px_80px_-16px_rgba(0,0,0,0.2)] pointer-events-auto overflow-hidden p-8`}
            >
              {/* Content */}
              <div className="relative z-10">
                {/* Close button */}
                <button
                  onClick={onCancel}
                  className="absolute -top-2 -right-2 p-2.5 rounded-2xl text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-90"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Header Icon Section */}
                <div className="flex flex-col items-center text-center mb-8">
                  <div className={`p-5 rounded-[2rem] bg-gradient-to-br ${colorScheme.bg} backdrop-blur-md mb-6 shadow-xl border border-white/50`}>
                    <Icon className={`h-8 w-8 ${colorScheme.icon}`} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight uppercase">{title}</h3>
                  <p className="text-sm font-bold text-gray-500 tracking-tight leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  {type === "confirm" ? (
                    <>
                      <Button
                        onClick={onCancel}
                        variant="outline"
                        className="flex-1 h-14 border border-white/60 bg-white/40 backdrop-blur-sm hover:bg-white/80 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] transition-all"
                      >
                        {cancelText}
                      </Button>
                      <Button
                        onClick={onConfirm}
                        className={`flex-1 h-14 ${colorScheme.button} text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/20`}
                      >
                        {confirmText}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={onConfirm || onCancel}
                      className={`w-full h-14 ${colorScheme.button} text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/20`}
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
