
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount?: number, currency = 'USD') => {
  if (typeof amount !== 'number') {
    return 'N/A'; // Or some other placeholder for undefined/invalid amounts
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};
