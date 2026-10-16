"use client";

import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { currencyCodes, currencyLabel, useCurrency, type Currency } from "@/lib/currency";

/** Drop-down to switch the currency used for prices on the page. */
export function CurrencySelect({ label, className = "", id }: { label: string; className?: string; id?: string }) {
  const locale = useLocale() === "en" ? "en" : "es";
  const { currency, setCurrency } = useCurrency();

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">{label}</span>
      <select
        id={id}
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="h-9 cursor-pointer appearance-none rounded-full border border-[var(--color-border)] bg-white py-0 pl-3 pr-8 text-[13px] font-medium text-[var(--color-ink)] outline-none transition-colors hover:border-[var(--color-primary)]/50 focus:border-[var(--color-primary)]"
      >
        {[...currencyCodes]
          .map((code) => ({ code, label: currencyLabel(code, locale) }))
          .sort((a, b) => a.label.localeCompare(b.label, locale))
          .map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 text-[var(--color-muted)]" />
    </label>
  );
}
