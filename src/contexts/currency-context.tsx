
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Currency, supportedCurrencies, defaultCurrency as appDefaultCurrency } from '@/lib/currencies';

interface CurrencyContextType {
  selectedCurrency: Currency;
  setSelectedCurrency: (currencyCode: string) => void;
  availableCurrencies: Currency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [storedCurrencyCode, setStoredCurrencyCode] = useLocalStorage<string>('selectedCurrencyCode', appDefaultCurrency.code);
  
  // Initialize selectedCurrencyState based on storedCurrencyCode or appDefaultCurrency
  const findInitialCurrency = () => supportedCurrencies.find(c => c.code === storedCurrencyCode) || appDefaultCurrency;
  const [selectedCurrencyState, setSelectedCurrencyState] = useState<Currency>(findInitialCurrency());

  useEffect(() => {
    const newSelected = supportedCurrencies.find(c => c.code === storedCurrencyCode) || appDefaultCurrency;
    if (newSelected.code !== selectedCurrencyState.code) { // Only update if it actually changed
        setSelectedCurrencyState(newSelected);
    }
  }, [storedCurrencyCode, selectedCurrencyState.code]); // Added selectedCurrencyState.code to deps to avoid loop if findInitialCurrency changes reference but not value

  const setSelectedCurrency = (currencyCode: string) => {
    const newCurrency = supportedCurrencies.find(c => c.code === currencyCode);
    if (newCurrency) {
      setStoredCurrencyCode(currencyCode); // This will trigger the useEffect above
    }
  };

  return (
    <CurrencyContext.Provider value={{ selectedCurrency: selectedCurrencyState, setSelectedCurrency, availableCurrencies: supportedCurrencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
