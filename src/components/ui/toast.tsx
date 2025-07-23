"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  action?: React.ReactNode
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function ToastViewport() {
  const context = React.useContext(ToastContext)
  if (!context) return null

  const { toasts, removeToast } = context

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

interface ToastProps {
  toast: Toast
  onClose: () => void
}

function Toast({ toast, onClose }: ToastProps) {
  const baseClasses = "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all mb-2"
  const variantClasses = {
    default: "border bg-white text-gray-900",
    destructive: "border-red-500 bg-red-500 text-white"
  }

  return (
    <div className={cn(baseClasses, variantClasses[toast.variant || 'default'])}>
      <div className="grid gap-1">
        {toast.title && (
          <div className="text-sm font-semibold">{toast.title}</div>
        )}
        {toast.description && (
          <div className="text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      {toast.action}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-70 transition-opacity hover:text-gray-700 hover:opacity-100"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ToastAction({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
    >
      {children}
    </button>
  )
}

export function ToastClose({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-70 transition-opacity hover:text-gray-700 hover:opacity-100"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}

export function ToastTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-semibold">{children}</div>
}

export function ToastDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm opacity-90">{children}</div>
}

export type ToastActionElement = React.ReactElement<typeof ToastAction>
export type { Toast as ToastProps }