import { routing, type AppLocale } from "@/i18n/routing";

const siteUrl = "https://aigency-x.com";

export type LegalPath = "/privacidad" | "/terminos";
export const legalPaths: LegalPath[] = ["/privacidad", "/terminos"];

/** Public URL of a legal page in a locale ("/privacidad" → "https://aigency-x.com/en/privacy"). */
export function legalUrl(path: LegalPath, locale: AppLocale) {
  const localized = routing.pathnames[path][locale];
  return `${siteUrl}/${locale}${localized}`;
}

export function legalAlternates(path: LegalPath, locale: AppLocale) {
  return {
    canonical: legalUrl(path, locale),
    languages: {
      es: legalUrl(path, "es"),
      en: legalUrl(path, "en"),
      "x-default": legalUrl(path, "es"),
    },
  };
}
