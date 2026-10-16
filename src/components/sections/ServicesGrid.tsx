"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, CalendarClock, Check, FileText, Globe, MessageCircle, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AgentOrb } from "@/components/agent/AgentOrb";
import { useFormPrefill, type SolutionInterest } from "@/lib/FormPrefillContext";
import { announceServicesPick, DEMO_PICK_EVENT, type DemoPickDetail, type ServiceKey } from "@/lib/demoEvents";
import type { PainKey } from "@/content/demoBusinesses";

const services = [
  { key: "assistant", icon: MessageCircle, interest: "aiAgent" },
  { key: "agenda", icon: CalendarClock, interest: "appointments" },
  { key: "quotes", icon: FileText, interest: "quotes" },
  { key: "website", icon: Globe, interest: "website" },
] satisfies { key: ServiceKey; icon: typeof Globe; interest: SolutionInterest }[];

// What each answer in the demo ("what takes most of your time") needs.
const servicesForPain: Record<PainKey, ServiceKey[]> = {
  responder: ["assistant"],
  agendar: ["assistant", "agenda"],
  reprogramar: ["assistant", "agenda"],
  cotizar: ["assistant", "quotes"],
};

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * "Your assistant, made for your business": a configurator. On the left, one
 * row per service with a switch; on the right, the visitor's assistant builds
 * itself with what they switch on, next to the button to ask for a quote.
 * The demo already showed how it talks, so there are no example chats here.
 * What the visitor picked in the demo comes switched on.
 */
export function ServicesGrid() {
  const t = useTranslations("services2");
  const reduce = useReducedMotion();
  const { requestContact } = useFormPrefill();
  const [selected, setSelected] = useState<ServiceKey[]>(["assistant", "agenda"]);
  const [businessName, setBusinessName] = useState("");
  // Only what the visitor actually chose (here or in the demo) goes to the contact form.
  const chosen = useRef(false);

  useEffect(() => {
    if (chosen.current) announceServicesPick({ services: selected });
  }, [selected]);

  useEffect(() => {
    function onPick(event: Event) {
      const { pains, name } = (event as CustomEvent<DemoPickDetail>).detail;
      const keys = new Set<ServiceKey>(pains.flatMap((p) => servicesForPain[p]));
      chosen.current = true;
      setSelected(services.map((s) => s.key).filter((key) => keys.has(key)));
      if (name) setBusinessName(name);
    }
    window.addEventListener(DEMO_PICK_EVENT, onPick);
    return () => window.removeEventListener(DEMO_PICK_EVENT, onPick);
  }, []);

  function toggle(key: ServiceKey) {
    chosen.current = true;
    setSelected((list) => (list.includes(key) ? list.filter((k) => k !== key) : services.map((s) => s.key).filter((k) => k === key || list.includes(k))));
  }

  function wantIt() {
    const names = selected.map((key) => t(`items.${key}.name`)).join(", ");
    const first = services.find((s) => selected.includes(s.key));
    requestContact({ mainTask: names, solutionInterest: first?.interest ?? "notSure" });
  }

  const title = businessName ? t("titleFor", { name: businessName }) : t("title");

  return (
    <section id="servicios" className="py-14 md:py-20">
      <Container>
        <SectionHeading size="compact" eyebrow={t("eyebrow")} title={title} description={t("subtitle")} />

        <div className="mt-8 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-6">
          {/* One row per service, switched on or off */}
          <div className="space-y-2.5">
            {services.map(({ key, icon: Icon }) => {
              const on = selected.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => toggle(key)}
                  className={`group flex w-full cursor-pointer items-center gap-4 rounded-[22px] border-2 p-4 text-left transition-colors md:p-5 ${
                    on
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/60"
                      : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                      on ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-mist)] text-[var(--color-primary)]"
                    }`}
                  >
                    <Icon size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[17px] font-semibold text-[var(--color-ink)]">{t(`items.${key}.name`)}</span>
                    <span className="mt-0.5 block text-[14.5px] leading-snug text-[var(--color-muted)]">{t(`items.${key}.benefit`)}</span>
                  </span>
                  {/* The switch */}
                  <span
                    aria-hidden="true"
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-[var(--color-primary)]" : "bg-[#d9d4e8]"}`}
                  >
                    <span
                      className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-transform duration-200 ${
                        on ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* The visitor's assistant, built with what they switched on */}
          <aside className="overflow-hidden rounded-[26px] bg-[var(--color-ink)] text-white shadow-[0_30px_60px_-30px_rgba(27,23,48,0.6)] lg:sticky lg:top-24">
            <div className="relative p-5 md:p-6">
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "radial-gradient(80% 100% at 90% 0%, rgba(124,77,255,0.5), transparent 70%)" }}
              />
              <div className="relative flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                  <AgentOrb size={38} label="AIgency" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-semibold">
                    {businessName ? t("previewNameFor", { name: businessName }) : t("previewName")}
                  </p>
                  <p className="flex items-center gap-1.5 text-[12.5px] text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                    {t("previewStatus")}
                  </p>
                </div>
              </div>

              <p className="relative mt-5 text-[12px] font-semibold uppercase tracking-wider text-white/50">{t("summaryLabel")}</p>
              <ul className="relative mt-2 min-h-[120px] space-y-2">
                <AnimatePresence initial={false}>
                  {services
                    .filter((s) => selected.includes(s.key))
                    .map(({ key, icon: Icon }) => (
                      <motion.li
                        key={key}
                        layout={!reduce}
                        initial={reduce ? undefined : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={reduce ? undefined : { opacity: 0, x: 10 }}
                        transition={{ duration: 0.3, ease }}
                        className="flex items-center gap-3 rounded-2xl bg-white/[0.07] px-3.5 py-2.5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#b9a4ff]">
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1 text-[14.5px] font-medium">{t(`items.${key}.name`)}</span>
                        <Check size={16} strokeWidth={3} className="shrink-0 text-[#4ade80]" />
                      </motion.li>
                    ))}
                </AnimatePresence>
                {selected.length === 0 ? <li className="px-1 pt-2 text-[13.5px] text-white/60">{t("previewEmpty")}</li> : null}
              </ul>

              <a
                href="#contacto"
                onClick={wantIt}
                className="group relative mt-5 flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-[15.5px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-primary-soft)]"
              >
                {t("summaryCta")}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              {/* Founding-client offer */}
              <p className="relative mt-3.5 flex items-start gap-2 text-[12.5px] leading-snug text-white/60">
                <Sparkles size={14} className="mt-0.5 shrink-0 text-[#ff8a65]" />
                <span>
                  <span className="font-semibold text-white">{t("founders.title")}.</span> {t("founders.text")}
                </span>
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
