import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { legalPaths, legalUrl } from "@/content/legalPaths";

const siteUrl = "https://aigency-x.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${siteUrl}/${l}`]),
      ),
    },
  }));

  const legal: MetadataRoute.Sitemap = legalPaths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: legalUrl(path, locale),
      changeFrequency: "yearly" as const,
      priority: 0.3,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, legalUrl(path, l)]),
        ),
      },
    })),
  );

  return [...home, ...legal];
}
