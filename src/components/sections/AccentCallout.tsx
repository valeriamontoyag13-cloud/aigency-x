"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Stethoscope } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { useFormPrefill } from "@/lib/FormPrefillContext";

/** The page's single warm accent card: a free diagnosis offer for undecided visitors. */
export function AccentCallout() {
  const t = useTranslations("accent");
  const { requestContact } = useFormPrefill();

  return (
    <section className="bg-[var(--color-fog)] pb-20 md:pb-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] bg-[#fbe7da] p-8 md:p-12">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#ffb48f]/50 blur-3xl"
            />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="flex items-center gap-2 text-sm text-[#8a3b1f]">
                  <Stethoscope size={16} />
                  {t("tag")}
                </p>
                <h2 className="text-display mt-3 text-3xl font-medium text-[#5d2a1a] md:text-[2.6rem] md:leading-[1.1]">
                  {t("title")}
                </h2>
                <p className="mt-4 max-w-[560px] text-[17px] leading-relaxed text-[#7a3a24]">{t("text")}</p>
              </div>
              <a
                href="#contacto"
                onClick={() => requestContact({ mainTask: t("cta") })}
                className="group inline-flex w-fit items-center gap-2 rounded-full bg-[#5d2a1a] px-6 py-3.5 text-[15px] font-medium text-white transition-transform hover:scale-[1.02]"
              >
                {t("cta")}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
