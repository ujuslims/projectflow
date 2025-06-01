
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Currency } from '@/lib/currencies';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount?: number, currency?: Currency) => {
  if (typeof amount !== 'number') {
    return 'N/A'; 
  }
  // If no currency is provided, default to USD for basic fallback,
  // but ideally, currency should always be passed from context.
  const displayCurrencyCode = currency?.code || 'USD';
  
  try {
    return new Intl.NumberFormat(undefined, { // 'undefined' uses browser's default locale for formatting rules
      style: 'currency',
      currency: displayCurrencyCode,
    }).format(amount);
  } catch (e) {
    // Fallback for unsupported currency codes or environments
    console.warn(`Error formatting currency ${displayCurrencyCode}: ${e}. Falling back to code and amount.`);
    // Fallback to a simple display if Intl fails (e.g., for very new or uncommon currency codes)
    // Or use the symbol from our currency object if Intl fails to use its own.
    const symbol = currency?.symbol || displayCurrencyCode;
    return `${symbol}${amount.toFixed(2)}`;
  }
};

