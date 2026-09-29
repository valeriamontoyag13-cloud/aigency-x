"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CalendarCheck, Headphones, MessageCircle, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { AgentOrb } from "@/components/agent/AgentOrb";

const featureIcons = [MessageCircle, CalendarCheck, Search, Headphones];

type Item = { title: string; text: string };

export function ProcessSection() {
  const t = useTranslations("process");
  const reduce = useReducedMotion();
  const steps = t.raw("steps") as Item[];
  const features = t.raw("features") as Item[];
  const [active, setActive] = useState(0);

  return (
    <section id="proceso" className="py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Steps list: hover or tap to focus one. */}
          <ol className="space-y-2">
            {steps.map((step, i) => {
              const selected = i === active;
              return (
                <li key={step.title}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-pressed={selected}
                    className={`flex w-full cursor-pointer items-start gap-4 rounded-[20px] p-5 text-left transition-colors ${
                      selected ? "bg-[var(--color-mist)]" : "hover:bg-[var(--color-fog)]"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        selected ? "bg-[var(--color-ink)] text-white" : "bg-[var(--color-mist)] text-[var(--color-muted)]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span>
                      <span className="block text-xl font-medium text-[var(--color-ink)]">{step.title}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-[var(--color-muted)]">{step.text}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Visual that follows the active step. */}
          <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-[24px] bg-[var(--color-mist)]">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(124,77,255,0.18), transparent 70%)",
              }}
            />
            <AgentOrb size={120} pulse label="AIgency" className="relative" />
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={reduce ? undefined : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white p-4 shadow-[var(--shadow-artifact)]"
              >
                <p className="text-xs font-medium text-[var(--color-primary)]">
                  {active + 1} / {steps.length}
                </p>
                <p className="mt-1 text-lg font-medium text-[var(--color-ink)]">{steps[active].title}</p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--color-mist)]">
                  <motion.div
                    className="h-full rounded-full bg-[var(--color-primary)]"
                    initial={false}
                    animate={{ width: `${((active + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = featureIcons[i];
            return (
              <Reveal key={feature.title} delay={i * 0.08}>
                <div className="h-full rounded-[20px] bg-[var(--color-mist)] p-6">
                  <Icon size={20} className="text-[var(--color-primary)]" />
                  <p className="mt-4 text-lg font-medium text-[var(--color-ink)]">{feature.title}</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--color-muted)]">{feature.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
