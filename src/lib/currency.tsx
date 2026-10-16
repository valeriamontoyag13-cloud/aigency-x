"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { detectCurrency, isCurrency, type Currency } from "@/lib/money";

// Plain helpers live in lib/money so server code can use them too.
export { currencyCodes, currencyInfo, currencyLabel, formatMoney, fromUsd, isCurrency, type Currency } from "@/lib/money";

/** Where the visitor is, from their device: no permission prompt and no request needed. */
function detectFromBrowser(): Currency | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    return detectCurrency(zone, navigator.languages ?? [navigator.language]);
  } catch {
    // Old browsers: keep the default for the page language.
    return null;
  }
}

// Only a currency the visitor picked by hand is remembered (new key, so earlier automatic guesses don't stick).
const STORAGE_KEY = "aigency:currency-choice";

type ContextValue = { currency: Currency; setCurrency: (next: Currency) => void };
const CurrencyContext = createContext<ContextValue | null>(null);

/**
 * Shares the visitor's currency between the demo and the savings calculator.
 * Starts from the page language (so the server render matches), then switches
 * to what the visitor picked before or to their detected country.
 */
export function CurrencyProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(locale === "en" ? "USD" : "CLP");

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage blocked: fall back to detection.
    }
    const next = isCurrency(saved) ? saved : detectFromBrowser();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the browser once after hydration
    if (next) setCurrencyState(next);
  }, []);

  function setCurrency(next: Currency) {
    setCurrencyState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not saved; it still applies for this visit.
    }
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("useCurrency must be used within a CurrencyProvider");
  return value;
}
