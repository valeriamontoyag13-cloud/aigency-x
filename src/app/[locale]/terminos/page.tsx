import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalContent } from "@/content/legal";
import { legalAlternates } from "@/content/legalPaths";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = legalContent[locale].terms;
  return {
    title: `${doc.title} | AIgency.x`,
    description: doc.description,
    alternates: legalAlternates("/terminos", locale),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage doc={legalContent[locale].terms} locale={locale} />;
}
