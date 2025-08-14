"use client";

import * as React from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

export function useToast() {
  const context = React.useContext(ToastContext);

  // Keep track of recently shown toasts to prevent duplicates
  const recentToasts = React.useRef<Map<string, number>>(new Map());

  const toast = React.useCallback(
    ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
      if (context) {
        // Create a unique key for this toast
        const toastKey = `${title}-${description}-${variant}`;
        const now = Date.now();
        const lastShown = recentToasts.current.get(toastKey);

        // If this toast was shown in the last 3 seconds, don't show it again
        if (lastShown && now - lastShown < 3000) {
          return;
        }

        // Update the timestamp for this toast
        recentToasts.current.set(toastKey, now);

        // Clean up old entries (older than 10 seconds)
        for (const [key, timestamp] of recentToasts.current.entries()) {
          if (now - timestamp > 10000) {
            recentToasts.current.delete(key);
          }
        }

        context.addToast({ title, description, variant });
      } else {
        console.log("Toast:", { title, description, variant });
      }
    },
    [context]
  );

  const dismiss = React.useCallback(
    (id?: string) => {
      if (context && id) {
        context.removeToast(id);
      }
    },
    [context]
  );

  return {
    toast,
    toasts: context?.toasts || [],
    dismiss,
  };
}

export type { Toast };
