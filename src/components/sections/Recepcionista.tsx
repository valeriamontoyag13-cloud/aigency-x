"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  BellRing,
  CalendarCheck,
  Check,
  ChevronDown,
  HandCoins,
  MessageCircle,
  Scissors,
  Sparkles,
  Sunrise,
  UserRound,
  X,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { useFormPrefill } from "@/lib/FormPrefillContext";

// Demo pública por rubro (proyecto AIgencyX/demo-citas, publicada en Vercel).
export const DEMO_URL = "https://demo-citas-aigencyx.vercel.app";

type Item = { title: string; text: string };

const featureIcons = [MessageCircle, CalendarCheck, BellRing, HandCoins, UserRound, Sunrise];

/** Lo que hace el asistente: las seis funciones del plan, en tarjetas. */
export function FeaturesSection() {
  const t = useTranslations("recepcion.features");
  const items = t.raw("items") as Item[];

  return (
    <section id="servicios" className="py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = featureIcons[i % featureIcons.length];
            return (
              <Reveal key={item.title} delay={(i % 3) * 0.08}>
                <div className="h-full rounded-[20px] bg-[var(--color-mist)] p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[var(--color-primary)]">
                    <Icon size={18} />
                  </span>
                  <p className="mt-4 text-lg font-medium text-[var(--color-ink)]">{item.title}</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--color-muted)]">{item.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

const demoIcons = [Sparkles, Scissors];

/** Enlaces a la demo interactiva: salón de belleza y barbería de ejemplo. */
export function DemoSection() {
  const t = useTranslations("recepcion.demo");
  const cards = t.raw("cards") as (Item & { path: string; cta: string })[];

  return (
    <section id="demo" className="py-20 md:py-28">
      <Container>
        <div className="overflow-hidden rounded-[28px] bg-[var(--color-ink)] px-6 py-12 text-white md:px-12 md:py-16">
          <div className="max-w-[640px]">
            <p className="mb-4 text-sm font-medium text-[#b9a4ff]">{t("eyebrow")}</p>
            <h2 className="text-display text-[2rem] font-medium leading-[1.1] md:text-5xl">{t("title")}</h2>
            <p className="mt-5 text-base leading-relaxed text-white/70 md:text-lg">{t("subtitle")}</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {cards.map((card, i) => {
              const Icon = demoIcons[i % demoIcons.length];
              return (
                <a
                  key={card.path}
                  href={`${DEMO_URL}/${card.path}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-[20px] bg-white/[0.06] p-6 ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#d7caff]">
                    <Icon size={18} />
                  </span>
                  <p className="mt-4 text-xl font-medium">{card.title}</p>
                  <p className="mt-1.5 flex-1 text-[15px] leading-relaxed text-white/65">{card.text}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#d7caff] transition-[gap] group-hover:gap-2.5">
                    {card.cta} <ArrowUpRight size={15} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Cómo empezamos: los pasos desde la primera conversación hasta el lanzamiento. */
export function StepsSection() {
  const t = useTranslations("recepcion.steps");
  const steps = t.raw("items") as Item[];

  return (
    <section id="proceso" className="py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <li className="h-full rounded-[20px] border border-[var(--color-border)] bg-white p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-ink)] text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <p className="mt-4 text-lg font-medium text-[var(--color-ink)]">{step.title}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--color-muted)]">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/** Oferta de clientes fundadores (sin precio: se conversa en la llamada). */
export function FoundersSection() {
  const t = useTranslations("recepcion.founders");
  const perks = t.raw("perks") as string[];

  return (
    <section className="py-10 md:py-14">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] bg-[var(--color-surface-alt)] px-6 py-10 md:px-12 md:py-14">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(255,138,101,0.28), transparent)" }}
            />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="mb-4 text-sm font-medium text-[var(--color-primary)]">{t("eyebrow")}</p>
                <h2 className="text-display text-[2rem] font-medium leading-[1.1] text-[var(--color-ink)] md:text-[2.8rem]">
                  {t("title")}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-[var(--color-muted)] md:text-lg">{t("text")}</p>
                <div className="mt-8">
                  <Button href="#contacto" variant="primary">
                    {t("cta")}
                  </Button>
                </div>
              </div>
              <ul className="space-y-3">
                {perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-3 rounded-2xl bg-white/80 px-5 py-4 text-[15px] leading-relaxed text-[var(--color-ink)]"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/** Preguntas frecuentes de las dueñas y dueños (las objeciones típicas de la llamada). */
export function FaqSection() {
  const t = useTranslations("recepcion.faq");
  const reduce = useReducedMotion();
  const items = t.raw("items") as { q: string; a: string }[];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="preguntas" className="py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        <div className="mt-10 max-w-[820px] divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {items.map((item, i) => {
            const expanded = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : i)}
                  aria-expanded={expanded}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-lg font-medium text-[var(--color-ink)]">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-[var(--color-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      initial={reduce ? undefined : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-10 text-[15px] leading-relaxed text-[var(--color-muted)]">{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

type Slider = { key: "slow" | "conversion" | "ticket" | "noShows"; label: string; hint: string };

const sliderRanges: Record<Slider["key"], { min: number; max: number; step: number; initial: number }> = {
  slow: { min: 0, max: 80, step: 1, initial: 15 },
  conversion: { min: 1, max: 10, step: 1, initial: 3 },
  ticket: { min: 5000, max: 120000, step: 1000, initial: 18000 },
  noShows: { min: 0, max: 20, step: 1, initial: 3 },
};

// Semanas promedio por mes.
const WEEKS_PER_MONTH = 4.3;

/** Calculadora: cuánto se le escapa al mes al negocio por responder tarde y por las inasistencias. */
export function LossCalculator() {
  const t = useTranslations("recepcion.calculator");
  const { requestContact } = useFormPrefill();
  const sliders = t.raw("sliders") as Slider[];
  const [values, setValues] = useState(
    () => Object.fromEntries(Object.entries(sliderRanges).map(([k, r]) => [k, r.initial])) as Record<Slider["key"], number>,
  );

  const money = new Intl.NumberFormat(t("numberLocale"), { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
  const lostBookings = values.slow * WEEKS_PER_MONTH * (values.conversion / 10);
  const fromSlow = lostBookings * values.ticket;
  const fromNoShows = values.noShows * WEEKS_PER_MONTH * values.ticket;
  const total = fromSlow + fromNoShows;

  const format = (key: Slider["key"], value: number) => (key === "ticket" ? money.format(value) : key === "conversion" ? `${value} / 10` : String(value));

  return (
    <section id="calculadora" className="py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />
        <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-7 rounded-[24px] border border-[var(--color-border)] bg-white p-6 md:p-8">
            {sliders.map((s) => {
              const r = sliderRanges[s.key];
              return (
                <label key={s.key} className="block">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="text-[15px] font-medium text-[var(--color-ink)]">{s.label}</span>
                    <span className="shrink-0 text-lg font-semibold tabular-nums text-[var(--color-primary)]">
                      {format(s.key, values[s.key])}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={r.min}
                    max={r.max}
                    step={r.step}
                    value={values[s.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [s.key]: Number(e.target.value) }))}
                    className="mt-3 w-full cursor-pointer accent-[var(--color-primary)]"
                  />
                  <span className="mt-1 block text-sm text-[var(--color-muted)]">{s.hint}</span>
                </label>
              );
            })}
          </div>

          <div className="flex flex-col rounded-[24px] bg-[var(--color-ink)] p-6 text-white md:p-8">
            <p className="text-sm font-medium text-[#b9a4ff]">{t("resultLabel")}</p>
            <p className="text-display mt-3 text-[2.6rem] font-medium leading-none tabular-nums md:text-6xl">{money.format(total)}</p>
            <p className="mt-2 text-sm text-white/60">{t("perMonth")}</p>
            <dl className="mt-8 space-y-3 border-t border-white/10 pt-6 text-[15px]">
              <div className="flex justify-between gap-4">
                <dt className="text-white/70">{t("fromSlow", { count: Math.round(lostBookings) })}</dt>
                <dd className="tabular-nums">{money.format(fromSlow)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/70">{t("fromNoShows", { count: Math.round(values.noShows * WEEKS_PER_MONTH) })}</dt>
                <dd className="tabular-nums">{money.format(fromNoShows)}</dd>
              </div>
            </dl>
            <p className="mt-6 flex-1 text-[15px] leading-relaxed text-white/70">{t("pitch")}</p>
            <div className="mt-8">
              <Button
                href="#contacto"
                variant="secondary"
                className="border-white! bg-white! text-[var(--color-ink)]! hover:bg-[var(--color-primary-soft)]!"
                onClick={() => requestContact({ mainTask: t("cta") })}
              >
                {t("cta")}
              </Button>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-white/45">{t("assumptions")}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Por qué un servicio hecho para ti y no un software de recepcionista que configuras tú. */
export function ComparisonSection() {
  const t = useTranslations("recepcion.comparison");
  const rows = t.raw("rows") as { topic: string; them: string; us: string }[];

  return (
    <section id="por-que" className="py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />
        <Reveal>
          <div className="mt-12 overflow-hidden rounded-[24px] border border-[var(--color-border)] bg-white">
            <div className="hidden grid-cols-[0.8fr_1fr_1fr] bg-[var(--color-mist)] text-sm font-medium md:grid">
              <span className="px-6 py-4 text-[var(--color-muted)]" />
              <span className="px-6 py-4 text-[var(--color-muted)]">{t("them")}</span>
              <span className="px-6 py-4 text-[var(--color-primary)]">{t("us")}</span>
            </div>
            {rows.map((row) => (
              <div key={row.topic} className="grid gap-2 border-t border-[var(--color-border)] px-6 py-5 first:border-t-0 md:grid-cols-[0.8fr_1fr_1fr] md:gap-0 md:px-0 md:py-0 md:first:border-t">
                <p className="font-medium text-[var(--color-ink)] md:px-6 md:py-5">{row.topic}</p>
                <p className="flex items-start gap-2.5 text-[15px] text-[var(--color-muted)] md:px-6 md:py-5">
                  <X size={16} className="mt-1 shrink-0 text-[var(--color-muted)]/60" />
                  <span>
                    <span className="font-medium md:hidden">{t("them")}: </span>
                    {row.them}
                  </span>
                </p>
                <p className="flex items-start gap-2.5 text-[15px] text-[var(--color-ink)] md:bg-[var(--color-primary-soft)]/40 md:px-6 md:py-5">
                  <Check size={16} className="mt-1 shrink-0 text-[var(--color-primary)]" />
                  <span>
                    <span className="font-medium text-[var(--color-primary)] md:hidden">{t("us")}: </span>
                    {row.us}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
