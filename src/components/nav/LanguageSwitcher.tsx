"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  function switchTo(next: "es" | "en") {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className={`flex items-center gap-1 rounded-full border border-[var(--color-border)] p-1 ${compact ? "text-xs" : "text-sm"}`}
      role="group"
      aria-label={t("languageLabel")}
    >
      <button
        type="button"
        onClick={() => switchTo("es")}
        aria-pressed={locale === "es"}
        className={`rounded-full px-3 py-1 font-medium transition-colors cursor-pointer ${
          locale === "es"
            ? "bg-[var(--color-primary)] text-white"
            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        }`}
      >
        {t("langEs")}
      </button>
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        className={`rounded-full px-3 py-1 font-medium transition-colors cursor-pointer ${
          locale === "en"
            ? "bg-[var(--color-primary)] text-white"
            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
        }`}
      >
        {t("langEn")}
      </button>
    </div>
  );
}
