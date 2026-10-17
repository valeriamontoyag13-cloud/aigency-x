import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ConnectWhatsApp } from "@/components/connect/ConnectWhatsApp";
import { connectContent } from "@/content/connect";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Private page: each client reaches it only through their own link.
  return { title: connectContent[locale].metaTitle, robots: { index: false, follow: false } };
}

export default async function ConnectPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: AppLocale }>;
  searchParams: Promise<{ n?: string | string[]; c?: string | string[] }>;
}) {
  const { locale } = await params;
  const { n, c } = await searchParams;
  const negocio = typeof n === "string" ? n : "";
  const codigo = typeof c === "string" ? c : "";
  const link = /^[a-z0-9-]{2,60}$/.test(negocio) && /^[a-f0-9]{24,64}$/.test(codigo) ? { negocio, codigo } : null;
  setRequestLocale(locale);
  const copy = connectContent[locale];
  return (
    <section className="pb-24 pt-32 sm:pt-36">
      <Container className="max-w-[760px]">
        <h1 className="font-[family-name:var(--font-jakarta)] text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--color-muted)]">{copy.intro}</p>
        <div className="mt-10">
          <ConnectWhatsApp copy={copy} initialLink={link} />
        </div>
      </Container>
    </section>
  );
}
