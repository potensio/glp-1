import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Toast deduplication for sonner
const recentSonnerToasts = new Map<string, number>();

export function deduplicatedToast(
  toastFn: (message: string, options?: any) => void,
  message: string,
  options?: any
) {
  const now = Date.now();
  const toastKey = `${message}-${JSON.stringify(options)}`;
  const lastShown = recentSonnerToasts.get(toastKey);

  // If this toast was shown in the last 3 seconds, don't show it again
  if (lastShown && now - lastShown < 3000) {
    return;
  }

  // Update the timestamp for this toast
  recentSonnerToasts.set(toastKey, now);

  // Clean up old entries (older than 10 seconds)
  for (const [key, timestamp] of recentSonnerToasts.entries()) {
    if (now - timestamp > 10000) {
      recentSonnerToasts.delete(key);
    }
  }

  // Show the toast
  toastFn(message, options);
}
