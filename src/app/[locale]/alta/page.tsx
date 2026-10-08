import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { BusinessForm } from "@/components/onboarding/BusinessForm";
import { altaContent } from "@/content/alta";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Private page: each client reaches it only through their own link.
  return { title: altaContent[locale].metaTitle, robots: { index: false, follow: false } };
}

export default async function AltaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ n?: string | string[]; c?: string | string[] }>;
}) {
  const { locale } = await params;
  const { n, c } = await searchParams;
  setRequestLocale(locale);
  const negocio = typeof n === "string" ? n : "";
  const codigo = typeof c === "string" ? c : "";
  const link = /^[a-z0-9-]{2,60}$/.test(negocio) && /^[a-f0-9]{24,64}$/.test(codigo) ? { negocio, codigo } : null;
  const copy = altaContent[locale];
  return (
    <section className="pb-24 pt-32 sm:pt-36">
      <Container className="max-w-[860px]">
        <h1 className="font-[family-name:var(--font-jakarta)] text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--color-muted)]">{copy.intro}</p>
        <div className="mt-12">
          <BusinessForm copy={copy} link={link} locale={locale} />
        </div>
      </Container>
    </section>
  );
}
