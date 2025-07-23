"use client"

import * as React from "react"

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  action?: React.ReactNode
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  
  const toast = React.useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    if (context) {
      context.addToast({ title, description, variant })
    } else {
      console.log('Toast:', { title, description, variant })
    }
  }, [context])

  const dismiss = React.useCallback((id?: string) => {
    if (context && id) {
      context.removeToast(id)
    }
  }, [context])

  return {
    toast,
    toasts: context?.toasts || [],
    dismiss
  }
}

export type { Toast }