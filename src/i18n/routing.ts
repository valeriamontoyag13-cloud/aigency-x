import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/privacidad": { es: "/privacidad", en: "/privacy" },
    "/terminos": { es: "/terminos", en: "/terms" },
    "/conectar": { es: "/conectar", en: "/connect" },
    "/alta": { es: "/alta", en: "/setup" },
  },
});

export type AppLocale = (typeof routing.locales)[number];
