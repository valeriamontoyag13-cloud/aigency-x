import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import {
  ComparisonSection,
  DemoSection,
  FaqSection,
  FeaturesSection,
  FoundersSection,
  LossCalculator,
  StepsSection,
} from "@/components/sections/Recepcionista";
import { ConversationalForm } from "@/components/form/ConversationalForm";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <FeaturesSection />
      <DemoSection />
      <LossCalculator />
      <StepsSection />
      <ComparisonSection />
      <FoundersSection />
      <FaqSection />
      <ConversationalForm />
    </>
  );
}
