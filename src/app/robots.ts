import type { MetadataRoute } from "next";

const siteUrl = "https://aigency-x.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /conectar and /alta are private pages reached only through each client's own link.
      disallow: ["/api/", "/es/conectar", "/en/connect", "/es/alta", "/en/setup"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
