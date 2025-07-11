"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

const currencyMap: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  inr: "₹",
};

interface CurrencyContextType {
  currency: string;
  symbol: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("usd");

  useEffect(() => {
    const stored = localStorage.getItem("app-currency");
    if (stored && currencyMap[stored]) setCurrencyState(stored);
  }, []);

  const setCurrency = (cur: string) => {
    setCurrencyState(cur);
    localStorage.setItem("app-currency", cur);
  };

  const symbol = currencyMap[currency] || "$";

  return (
    <CurrencyContext.Provider value={{ currency, symbol, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
} 