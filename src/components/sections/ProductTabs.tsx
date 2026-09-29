"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { useFormPrefill, type SolutionInterest } from "@/lib/FormPrefillContext";
import { serviceIcons, themes, type ServiceKey } from "./ServicesSection";
import { AgentPreview, MenuPreview, QuotePreview, WebPreview } from "./ServicePreviews";

const tabs = [
  { key: "web", solutionInterest: "website" },
  { key: "agents", solutionInterest: "aiAgent" },
  { key: "automation", solutionInterest: "quotes" },
  { key: "menus", solutionInterest: "menu" },
] satisfies { key: ServiceKey; solutionInterest: SolutionInterest }[];

/** Tabbed product tour: pick a service, see it working on the left, read what it does on the right. */
export function ProductTabs() {
  const t = useTranslations("product");
  const s = useTranslations("services");
  const reduce = useReducedMotion();
  const { requestContact } = useFormPrefill();
  const [active, setActive] = useState<ServiceKey>("web");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<ServiceKey, HTMLButtonElement | null>>>({});

  function selectTab(key: ServiceKey) {
    setActive(key);
    // Center the chosen tab inside the scrollable row (horizontal only, so the
    // page itself doesn't jump).
    const scroller = scrollerRef.current;
    const tab = tabRefs.current[key];
    if (!scroller || !tab) return;
    const tabBox = tab.getBoundingClientRect();
    const scrollerBox = scroller.getBoundingClientRect();
    const left =
      scroller.scrollLeft + (tabBox.left - scrollerBox.left) - (scrollerBox.width - tabBox.width) / 2;
    scroller.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }

  const theme = themes[active];
  const current = tabs.find((tab) => tab.key === active)!;
  const benefits = s.raw(`items.${active}.benefits`) as string[];

  // Each preview loops a short story of the service in action.
  function renderVisual(key: ServiceKey) {
    if (key === "web") return <WebPreview t={s} />;
    if (key === "agents") return <AgentPreview t={s} />;
    if (key === "automation") return <QuotePreview t={s} />;
    return <MenuPreview t={s} />;
  }

  return (
    <section id="servicios" className="bg-[var(--color-fog)] py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />

        {/* Tabs with a sliding active pill. On narrow screens the row scrolls,
            its edges fade to hint at more tabs, and the chosen tab glides to
            the center so its neighbours stay visible. */}
        <Reveal className="mt-10">
          <div
            ref={scrollerRef}
            role="tablist"
            className="flex gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-[0_0_0_1px_rgba(27,23,48,0.06)] [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,black_28px,black_calc(100%-28px),transparent)] sm:w-fit sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map(({ key }) => {
              const Icon = serviceIcons[key];
              const selected = key === active;
              return (
                <button
                  key={key}
                  ref={(el) => {
                    tabRefs.current[key] = el;
                  }}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  onClick={() => selectTab(key)}
                  className={`relative flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-[15px] transition-colors ${
                    selected ? "text-white" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {selected ? (
                    <motion.span
                      layoutId="product-tab-pill"
                      className="absolute inset-0 rounded-full bg-[var(--color-ink)]"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  ) : null}
                  <Icon size={16} className="relative" />
                  <span className="relative">{t(`tabs.${key}`)}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile-only position dots: shows there are four services. */}
          <div className="mt-3 flex justify-center gap-1.5 sm:hidden" aria-hidden="true">
            {tabs.map(({ key }) => (
              <span
                key={key}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  key === active ? "w-5 bg-[var(--color-ink)]" : "w-1.5 bg-black/15"
                }`}
              />
            ))}
          </div>
        </Reveal>

        <div
          className="mt-8 grid overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(27,23,48,0.05)] lg:grid-cols-[1.15fr_1fr]"
          style={
            {
              "--svc-accent": theme.accent,
              "--svc-strong": theme.strong,
              "--svc-soft": theme.soft,
              "--svc-ink": theme.ink,
            } as CSSProperties
          }
        >
          {/* Live preview */}
          <div
            className="relative flex min-h-[320px] items-center justify-center overflow-hidden p-8 transition-[background] duration-500 md:min-h-[420px]"
            style={{
              background: `radial-gradient(90% 80% at 80% 10%, color-mix(in srgb, ${theme.accent} 30%, transparent), transparent 65%), ${theme.soft}`,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.96, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -16, scale: 0.98, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full justify-center"
              >
                {renderVisual(active)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Description */}
          <div className="p-7 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={reduce ? undefined : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex h-full flex-col"
              >
                <h3 className="text-display text-3xl font-medium text-[var(--color-ink)]">{s(`items.${active}.name`)}</h3>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--color-muted)]">{s(`items.${active}.description`)}</p>
                <p className="mt-5 flex items-start gap-2 text-sm text-[var(--color-ink)]">
                  <Users size={16} className="mt-0.5 shrink-0 text-[var(--svc-ink)]" />
                  <span>
                    <span className="font-semibold">{s("idealForLabel")}:</span> {s(`items.${active}.idealFor`)}
                  </span>
                </p>
                <ul className="mt-5 space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-[15px] text-[var(--color-ink)]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--svc-soft)] text-[var(--svc-ink)]">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contacto"
                  onClick={() =>
                    requestContact({ mainTask: s(`items.${active}.name`), solutionInterest: current.solutionInterest })
                  }
                  className="group mt-8 inline-flex w-fit items-center gap-2 text-[16px] font-medium text-[var(--color-ink)] md:mt-auto md:pt-8"
                >
                  <span className="border-b border-transparent transition-colors group-hover:border-[var(--color-ink)]">
                    {s(`items.${active}.cta`)}
                  </span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </a>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  );
}
