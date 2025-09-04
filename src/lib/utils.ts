import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * cn (class names) utility:
 * - Combines conditional classes (like clsx)
 * - Merges Tailwind classes intelligently (like twMerge)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
