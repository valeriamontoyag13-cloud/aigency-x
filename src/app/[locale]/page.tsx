import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { PersonalDemo } from "@/components/sections/PersonalDemo";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { SavingsCalculator } from "@/components/sections/SavingsCalculator";
import { ExitOffer } from "@/components/sections/ExitOffer";
import { ConversationalForm } from "@/components/form/ConversationalForm";
import { CurrencyProvider } from "@/lib/currency";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // See it (demo) → build it (pick tasks) → what not having it costs → one step away (form).
  return (
    <CurrencyProvider locale={locale}>
      <Hero />
      <PersonalDemo />
      <ServicesGrid />
      <SavingsCalculator />
      <ConversationalForm />
      <ExitOffer />
    </CurrencyProvider>
  );
}
