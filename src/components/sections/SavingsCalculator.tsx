"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, CalendarCheck, ChevronDown, Clock, MessageCircle, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFormPrefill } from "@/lib/FormPrefillContext";
import { currencyLabel, formatMoney, fromUsd, useCurrency, type Currency } from "@/lib/currency";
import { CurrencySelect } from "@/components/ui/CurrencySelect";
import { DEMO_PICK_EVENT, type DemoPickDetail } from "@/lib/demoEvents";

type SliderKey = "slow" | "conversion" | "ticket" | "noShows" | "hours";
type Slider = { key: SliderKey; label: string };

// Starting numbers are those of a small business, so the result feels believable.
// Sensible ranges for the value of one appointment or sale: set by hand for
// Chile, Colombia and the US, converted from US dollars for other currencies.
type Range = { min: number; max: number; step: number; initial: number };
const handSet: Partial<Record<Currency, Range>> = {
  CLP: { min: 5000, max: 200000, step: 1000, initial: 20000 },
  COP: { min: 20000, max: 800000, step: 5000, initial: 80000 },
  USD: { min: 5, max: 300, step: 5, initial: 40 },
};
function ticketRange(currency: Currency): Range {
  const set = handSet[currency];
  if (set) return set;
  // A round step (1, 2 or 5 followed by zeros) near the value of 5 US dollars.
  const raw = fromUsd(5, currency);
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [5, 2, 1].map((n) => n * magnitude).find((n) => n <= raw) ?? magnitude;
  const snap = (usd: number) => Math.max(step, Math.round(fromUsd(usd, currency) / step) * step);
  return { min: step, max: snap(300), step, initial: snap(40) };
}

const ranges: Record<Exclude<SliderKey, "ticket">, { min: number; max: number; step: number; initial: number }> = {
  slow: { min: 0, max: 100, step: 1, initial: 6 },
  conversion: { min: 1, max: 10, step: 1, initial: 2 },
  noShows: { min: 0, max: 20, step: 1, initial: 1 },
  hours: { min: 0, max: 40, step: 1, initial: 6 },
};

const WEEKS_PER_MONTH = 4.3;
// Share of the time spent on WhatsApp, booking and quotes that the assistant takes over.
const AUTOMATED_SHARE = 0.7;

const reasonIcons = [MessageCircle, CalendarCheck, Clock, ShieldCheck];

/**
 * "Do the math": what slow replies and no-shows cost each month, how many
 * hours the owner would get back, and why it's worth deciding now. The result
 * stays in view while the sliders move (sticky card on desktop, bar on mobile).
 */
export function SavingsCalculator() {
  const t = useTranslations("savings");
  const reduce = useReducedMotion();
  const { requestContact } = useFormPrefill();
  const sliders = t.raw("sliders") as Slider[];
  const reasons = t.raw("reasons") as { title: string; text: string }[];

  // The visitor's currency (detected from their country, changeable in the drop-down).
  const { currency } = useCurrency();
  const [values, setValues] = useState<Record<Exclude<SliderKey, "ticket">, number>>({
    slow: ranges.slow.initial,
    conversion: ranges.conversion.initial,
    noShows: ranges.noShows.initial,
    hours: ranges.hours.initial,
  });
  // The average ticket is remembered per currency.
  const [tickets, setTickets] = useState<Partial<Record<Currency, number>>>({});
  // The bar that follows the sliders on phones steps aside once the full result is on screen.
  const [resultInView, setResultInView] = useState(false);
  useEffect(() => {
    const card = document.getElementById("ahorro-resultado");
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => setResultInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);
  const ticket = ticketRange(currency);
  const ticketValue = tickets[currency] ?? ticket.initial;

  // After the demo, the average ticket starts at the prices of the visitor's services.
  useEffect(() => {
    function onDemo(event: Event) {
      const { services, currency: demoCurrency } = (event as CustomEvent<DemoPickDetail>).detail;
      if (!services?.length || !demoCurrency) return;
      const range = ticketRange(demoCurrency);
      const average = services.reduce((sum, s) => sum + s.amount, 0) / services.length;
      const value = Math.min(range.max, Math.max(range.min, Math.round(average / range.step) * range.step));
      setTickets((list) => ({ ...list, [demoCurrency]: value }));
    }
    window.addEventListener(DEMO_PICK_EVENT, onDemo);
    return () => window.removeEventListener(DEMO_PICK_EVENT, onDemo);
  }, []);

  function setValue(key: SliderKey, value: number) {
    if (key === "ticket") setTickets((list) => ({ ...list, [currency]: value }));
    else setValues((v) => ({ ...v, [key]: value }));
  }

  // Every amount says its currency ("$602 SGD"), so a dollar or a peso is never ambiguous.
  const money = { format: (amount: number) => formatMoney(amount, currency, true) };
  const lang = useLocale() === "en" ? "en" : "es";

  function changeCurrency() {
    const select = document.getElementById("calc-currency");
    select?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    select?.focus({ preventScroll: true });
  }
  const lostClients = values.slow * WEEKS_PER_MONTH * (values.conversion / 10);
  const fromSlow = lostClients * ticketValue;
  const noShowsMonth = values.noShows * WEEKS_PER_MONTH;
  const fromNoShows = noShowsMonth * ticketValue;
  const total = fromSlow + fromNoShows;
  const hoursBack = Math.round(values.hours * WEEKS_PER_MONTH * AUTOMATED_SHARE);

  const rangeFor = (key: SliderKey) => (key === "ticket" ? ticket : ranges[key]);
  const display = (key: SliderKey) =>
    key === "ticket" ? money.format(ticketValue) : key === "conversion" ? `${values.conversion} / 10` : String(values[key]);
  const wantIt = () => requestContact({ mainTask: t("cta"), solutionInterest: "appointments" });

  return (
    <section id="ahorro" className="py-14 md:py-20">
      <Container>
        <SectionHeading size="compact" eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />

        <div className="mt-8 grid items-start gap-4 lg:grid-cols-[1.15fr_1fr]">
          {/* Inputs */}
          <div className="rounded-[24px] bg-[var(--color-fog)] p-5 shadow-[0_0_0_1px_rgba(27,23,48,0.05)] md:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--color-muted)]">{t("currency")}</p>
              <CurrencySelect id="calc-currency" label={t("currency")} />
            </div>

            <div className="mt-5 space-y-5">
              {sliders.map((s) => {
                const r = rangeFor(s.key);
                const value = s.key === "ticket" ? ticketValue : values[s.key];
                return (
                  <label key={s.key} className="block">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="text-[14px] font-medium leading-snug text-[var(--color-ink)]">{s.label}</span>
                      <span className="shrink-0 text-base font-semibold tabular-nums text-[var(--color-primary)]">{display(s.key)}</span>
                    </span>
                    <input
                      type="range"
                      min={r.min}
                      max={r.max}
                      step={r.step}
                      value={value}
                      onChange={(e) => setValue(s.key, Number(e.target.value))}
                      className="mt-2 w-full cursor-pointer accent-[var(--color-primary)]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Mobile: the total follows the visitor while they move the sliders */}
          <a
            href="#ahorro-resultado"
            aria-hidden={resultInView}
            tabIndex={resultInView ? -1 : undefined}
            className={`sticky bottom-3 z-10 -mt-1 flex items-center justify-between gap-3 rounded-2xl bg-[var(--color-ink)] px-4 py-3 text-white shadow-[0_12px_30px_-10px_rgba(27,23,48,0.6)] transition-opacity duration-300 lg:hidden ${
              resultInView ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <span className="text-[13px] text-white/70">{t("lostLabel")}</span>
            <span className="text-right">
              <span className="block text-lg font-semibold tabular-nums leading-tight">
                {money.format(total)} <span className="text-xs font-normal text-white/60">{t("monthShort")}</span>
              </span>
              <span className="block text-xs text-[#b9a4ff]">{t("hoursShort", { hours: hoursBack })}</span>
            </span>
          </a>

          {/* Result: stays in view on desktop */}
          <div
            id="ahorro-resultado"
            className="relative flex scroll-mt-24 flex-col overflow-hidden rounded-[24px] bg-[var(--color-ink)] p-5 text-white md:p-7"
          >
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full"
              style={{ background: "radial-gradient(closest-side, rgba(124,77,255,0.45), transparent)" }}
            />
            <p className="relative text-sm font-medium text-[#b9a4ff]">{t("lostLabel")}</p>
            <motion.p
              key={Math.round(total)}
              initial={reduce ? undefined : { opacity: 0.6, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-display relative mt-2 text-[2.4rem] font-medium leading-none tabular-nums md:text-5xl"
            >
              {formatMoney(total, currency)}
              <span className="ml-2 text-[1.1rem] font-semibold text-white/70 md:text-2xl">{currency}</span>
            </motion.p>
            <p className="relative mt-2 text-sm text-white/60">{t("perMonth", { year: money.format(total * 12) })}</p>
            <p className="relative mt-1 text-[13px] text-white/60">
              {t("currencyNote", { name: currencyLabel(currency, lang, lang === "en") })}{" "}
              <button type="button" onClick={changeCurrency} className="cursor-pointer font-semibold text-[#b9a4ff] underline-offset-2 hover:underline">
                {t("currencyChange")}
              </button>
            </p>

            <div className="relative mt-5 flex items-center gap-3 rounded-2xl bg-white/[0.08] p-3.5 ring-1 ring-white/10">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c4dff] to-[#ff8a65]">
                <Clock size={18} />
              </span>
              <p className="text-[14px] leading-snug text-white/80">
                {t.rich("hoursBack", {
                  hours: hoursBack,
                  b: (chunks) => <span className="text-lg font-semibold text-white">{chunks}</span>,
                })}
              </p>
            </div>

            <dl className="relative mt-5 space-y-2 border-t border-white/10 pt-4 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-white/70">{t("fromSlow", { count: Math.round(lostClients) })}</dt>
                <dd className="shrink-0 tabular-nums">{money.format(fromSlow)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-white/70">{t("fromNoShows", { count: Math.round(noShowsMonth) })}</dt>
                <dd className="shrink-0 tabular-nums">{money.format(fromNoShows)}</dd>
              </div>
            </dl>

            <a
              href="#contacto"
              onClick={wantIt}
              className="group relative mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-primary-soft)]"
            >
              {t("cta")}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <details className="group/how relative mt-4 text-xs text-white/50">
              <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-white/80 [&::-webkit-details-marker]:hidden">
                {t("howTitle")}
                <ChevronDown size={14} className="transition-transform group-open/how:rotate-180" />
              </summary>
              <p className="mt-2 leading-relaxed">{t("assumptions")}</p>
            </details>
          </div>
        </div>

        {/* Why decide now */}
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, i) => {
            const Icon = reasonIcons[i % reasonIcons.length];
            return (
              <li key={reason.title} className="flex items-start gap-3 rounded-2xl bg-[var(--color-surface-alt)] p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-primary)]">
                  <Icon size={15} />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold leading-snug text-[var(--color-ink)]">{reason.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-[var(--color-muted)]">{reason.text}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
