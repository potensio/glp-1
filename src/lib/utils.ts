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

// Date formatting utility for calendar pickers
export function formatDateWithOrdinal(date: Date): string {
  return date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    .replace(/\b(\d+)\b/, (match) => {
      const day = parseInt(match);
      const suffix =
        day % 10 === 1 && day !== 11
          ? "st"
          : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
      return day + suffix;
    });
}
