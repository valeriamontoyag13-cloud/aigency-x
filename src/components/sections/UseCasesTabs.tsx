"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { UtensilsCrossed, Sparkles, Briefcase, Hotel, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useFormPrefill, type SolutionInterest } from "@/lib/FormPrefillContext";

const tabs = [
  { key: "restaurant", Icon: UtensilsCrossed, solutionInterest: "menu" },
  { key: "clinic", Icon: Sparkles, solutionInterest: "appointments" },
  { key: "servicesCompany", Icon: Briefcase, solutionInterest: "quotes" },
  { key: "hotel", Icon: Hotel, solutionInterest: "aiAgent" },
] satisfies { key: string; Icon: typeof UtensilsCrossed; solutionInterest: SolutionInterest }[];

export function UseCasesTabs() {
  const t = useTranslations("useCases");
  const { requestContact } = useFormPrefill();
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("restaurant");

  const features = t.raw(`tabs.${active}.features`) as string[];
  const activeTab = tabs.find((tab) => tab.key === active)!;

  return (
    <section className="bg-[var(--color-surface-alt)] py-16 md:py-24">
      <Container>
        <SectionHeading align="center" title={t("title")} />

        <Reveal className="mt-9 flex flex-wrap justify-center gap-2">
          {tabs.map(({ key, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              aria-pressed={active === key}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                active === key
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-primary)]"
              }`}
            >
              <Icon size={16} />
              {t(`tabs.${key}.label`)}
            </button>
          ))}
        </Reveal>

        <AnimatedCard active={active}>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-[var(--color-ink)]">
                <Check size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            href="#contacto"
            variant="primary"
            className="w-fit"
            onClick={() =>
              requestContact({
                businessType: t(`tabs.${active}.label`),
                solutionInterest: activeTab.solutionInterest,
              })
            }
          >
            {t("cta")}
          </Button>
        </AnimatedCard>
      </Container>
    </section>
  );
}

function AnimatedCard({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal key={active} className="mt-8">
      <div className="mx-auto flex max-w-[560px] flex-col items-start gap-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        {children}
      </div>
    </Reveal>
  );
}
