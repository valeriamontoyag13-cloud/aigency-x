import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";
import { AutomationStory } from "@/components/sections/AutomationStory";
import { ProductTabs } from "@/components/sections/ProductTabs";
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
      <AutomationStory />
      <ProductTabs />
      <ConversationalForm />
    </>
  );
}
