"use client";

import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { GradientBackdrop } from "@/components/ui/GradientBackdrop";
import { buildWhatsAppLink } from "@/config/contact";

export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="py-20 md:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-[var(--color-fog)] px-6 py-20 text-center md:py-28">
            <GradientBackdrop />
            <div className="relative mx-auto max-w-[720px]">
              <h2 className="text-display text-4xl font-medium leading-[1.08] text-[var(--color-ink)] md:text-6xl">
                {t("title")}
              </h2>
              <p className="mx-auto mt-5 max-w-[520px] text-lg text-[var(--color-muted)]">{t("text")}</p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Button href="#contacto" variant="primary">
                  {t("primary")}
                </Button>
                <a
                  href={buildWhatsAppLink(t("title"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[15px] font-medium text-[var(--color-ink)]"
                >
                  <span className="border-b border-transparent group-hover:border-[var(--color-ink)]">{t("secondary")}</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
