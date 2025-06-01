
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const supportedCurrencies: Currency[] = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  // Add more as needed
];

export const defaultCurrency: Currency = supportedCurrencies.find(c => c.code === 'NGN')!;
