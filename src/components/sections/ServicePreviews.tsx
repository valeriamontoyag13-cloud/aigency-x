"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CalendarCheck,
  Check,
  ChefHat,
  ChevronLeft,
  Clock,
  FileCheck2,
  Globe,
  Loader2,
  MousePointer2,
  Plus,
  QrCode,
  Send,
  ShoppingBag,
} from "lucide-react";

type TFn = {
  (key: string): string;
  raw: (key: string) => unknown;
};

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Advances through `durations.length` steps and loops. Each step lasts its
 * duration in ms. With reduced motion it stays on the last (finished) step.
 */
function useSequence(durations: number[]) {
  const reduce = useReducedMotion();
  const last = durations.length - 1;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % durations.length), durations[step]);
    return () => window.clearTimeout(id);
  }, [step, durations, reduce]);

  return reduce ? last : step;
}

/** Pointer that appears over a target and "clicks" it. Place inside a `relative` element. */
function TapCursor({ show, className = "-bottom-3 right-2" }: { show: boolean; className?: string }) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.span
          aria-hidden="true"
          className={`pointer-events-none absolute z-10 ${className}`}
          initial={{ opacity: 0, x: 18, y: 18 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: [1, 1, 0.8, 1] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease, scale: { duration: 0.7, times: [0, 0.6, 0.8, 1] } }}
        >
          <MousePointer2 size={20} className="fill-[var(--color-ink)] text-white drop-shadow" />
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

/** Shared frame: the animated mockup plus a caption that narrates the current step. */
function Stage({ children, caption, step, total }: { children: ReactNode; caption: string; step: number; total: number }) {
  return (
    <div className="flex w-full max-w-[340px] flex-col items-center gap-5">
      <div className="relative flex h-[300px] w-full items-center justify-center">{children}</div>
      <div className="flex flex-col items-center gap-2" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={caption}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="rounded-full bg-white/80 px-4 py-1.5 text-center text-sm font-medium text-[var(--svc-ink)] shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur"
          >
            {caption}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === step ? "w-5 bg-[var(--svc-strong)]" : "w-1.5 bg-[var(--svc-strong)]/25"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Website: visitor books an appointment from the page.               */
/* ------------------------------------------------------------------ */

const webDurations = [1300, 1100, 1200, 1100, 1000, 2600];

export function WebPreview({ t }: { t: TFn }) {
  const step = useSequence(webDurations);
  const steps = t.raw("items.web.anim.steps") as string[];
  const slots = t.raw("items.web.anim.slots") as string[];
  const showSlots = step >= 2 && step <= 4;
  const booked = step === 5;

  return (
    <Stage caption={steps[step]} step={step} total={steps.length}>
      <div className="relative w-full">
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-float)]">
          <div className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <span className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-2 flex items-center gap-1 rounded-full bg-[var(--color-mist)] px-2 py-0.5 text-[11px] text-[var(--color-muted)]">
              <Globe size={10} />
              {t("items.web.visual.url")}
            </span>
          </div>
          <div className="h-12 bg-gradient-to-r from-[var(--svc-soft)] to-[#ffe4d6]" />
          <div className="p-4">
            <p className="text-base font-semibold text-[var(--color-ink)]">{t("items.web.visual.business")}</p>
            <p className="text-xs text-[var(--color-muted)]">{t("items.web.visual.tagline")}</p>

            <div className="relative mt-3 w-fit">
              <motion.span
                animate={step === 1 ? { scale: [1, 0.94, 1] } : { scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition-colors ${
                  booked ? "bg-[var(--color-success)]" : "bg-[var(--svc-strong)]"
                }`}
              >
                {booked ? <Check size={13} strokeWidth={3} /> : <CalendarCheck size={13} />}
                {booked ? t("items.web.anim.booked") : t("items.web.visual.button")}
              </motion.span>
              <TapCursor show={step === 1} />
            </div>

            <AnimatePresence initial={false}>
              {showSlots ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 text-[11px] font-medium text-[var(--color-muted)]">{t("items.web.anim.slotsTitle")}</p>
                  <div className="mt-2 flex gap-1.5">
                    {slots.map((slot, i) => {
                      const picked = i === 1 && step >= 3;
                      return (
                        <span key={slot} className="relative">
                          <span
                            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                              picked
                                ? "border-[var(--svc-strong)] bg-[var(--svc-strong)] text-white"
                                : "border-black/10 text-[var(--color-ink)]"
                            }`}
                          >
                            <Clock size={10} />
                            {slot}
                          </span>
                          {i === 1 ? <TapCursor show={step === 3} className="-bottom-4 right-0" /> : null}
                        </span>
                      );
                    })}
                  </div>
                  <div className="relative mt-3 w-fit">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        step >= 4 ? "bg-[var(--color-ink)] text-white" : "bg-[var(--color-mist)] text-[var(--color-muted)]"
                      }`}
                    >
                      {t("items.web.anim.confirm")}
                    </span>
                    <TapCursor show={step === 4} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {booked ? (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, ease }}
              className="absolute -bottom-5 -right-2 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] shadow-[var(--shadow-float)]"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
                <Check size={10} strokeWidth={3} />
              </span>
              {t("items.web.visual.badge")}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/* AI agent: answers a WhatsApp message and books the slot.           */
/* ------------------------------------------------------------------ */

const agentDurations = [600, 1100, 1200, 1500, 1200, 1000, 2600];

function Bubble({ from, children }: { from: "customer" | "agent"; children: ReactNode }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease }}
      className={
        from === "customer"
          ? "w-fit max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[13px] text-[var(--color-ink)] shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
          : "ml-auto w-fit max-w-[88%] rounded-2xl rounded-tr-sm bg-[var(--svc-strong)] px-3 py-2 text-[13px] text-white"
      }
    >
      {children}
    </motion.div>
  );
}

function TypingDots({ align }: { align: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex w-fit gap-1 rounded-2xl bg-white px-3 py-2.5 ${align === "right" ? "ml-auto" : ""}`}
    >
      {[0, 1, 2].map((d) => (
        <motion.span
          key={d}
          className="h-1.5 w-1.5 rounded-full bg-[var(--svc-strong)]"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
        />
      ))}
    </motion.div>
  );
}

export function AgentPreview({ t }: { t: TFn }) {
  const step = useSequence(agentDurations);
  const steps = t.raw("items.agents.anim.steps") as string[];
  const slots = t.raw("items.agents.visual.slots") as string[];
  const pick = t("items.agents.anim.pick");

  return (
    <Stage caption={steps[step]} step={step} total={steps.length}>
      <div className="flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-black/5 bg-[#efeae2] shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-2 bg-white px-3 py-2.5">
          <ChevronLeft size={16} className="text-[var(--svc-strong)]" />
          <span className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--svc-soft)] to-[var(--svc-strong)]" />
          <div>
            <p className="text-[13px] font-semibold leading-tight text-[var(--color-ink)]">{t("items.agents.anim.header")}</p>
            <p className="text-[10px] text-[var(--color-success)]">
              {step === 2 || step === 5 ? "…" : t("items.agents.anim.online")}
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-2 p-3">
          {step >= 1 ? <Bubble from="customer">{t("items.agents.visual.question")}</Bubble> : null}
          {step === 2 ? <TypingDots align="right" /> : null}
          {step >= 3 ? (
            <Bubble from="agent">
              <p>{t("items.agents.visual.answer")}</p>
              <div className="mt-1.5 flex gap-1.5">
                {slots.map((slot) => (
                  <span
                    key={slot}
                    className={`relative rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
                      slot === pick && step >= 4 ? "bg-white text-[var(--svc-strong)]" : "bg-white/20"
                    }`}
                  >
                    {slot}
                    {slot === pick ? <TapCursor show={step === 4} className="-bottom-4 -right-2" /> : null}
                  </span>
                ))}
              </div>
            </Bubble>
          ) : null}
          {step >= 4 ? <Bubble from="customer">{pick}</Bubble> : null}
          {step === 5 ? <TypingDots align="right" /> : null}
          {step >= 6 ? <Bubble from="agent">{t("items.agents.anim.confirm")}</Bubble> : null}
        </div>
        <AnimatePresence>
          {step >= 6 ? (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center gap-1.5 bg-[var(--svc-soft)] py-2 text-[11px] font-semibold text-[var(--svc-ink)]"
            >
              <CalendarCheck size={12} />
              {t("items.agents.anim.status")}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/* Quotes: a request form fills in and becomes a ready quote.         */
/* ------------------------------------------------------------------ */

const quoteDurations = [900, 800, 800, 800, 1000, 1400, 2800];

export function QuotePreview({ t }: { t: TFn }) {
  const step = useSequence(quoteDurations);
  const steps = t.raw("items.automation.anim.steps") as string[];
  const rows = t.raw("items.automation.visual.rows") as { label: string; value: string }[];

  return (
    <Stage caption={steps[step]} step={step} total={steps.length}>
      <div className="w-full rounded-2xl bg-white p-4 shadow-[var(--shadow-float)]">
        <AnimatePresence mode="wait">
          {step <= 4 ? (
            <motion.div key="form" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <p className="text-sm font-semibold text-[var(--color-ink)]">{t("items.automation.anim.formTitle")}</p>
              <div className="mt-3 space-y-2">
                {rows.map((row, i) => {
                  const filled = step >= i + 1;
                  return (
                    <div
                      key={row.label}
                      className={`rounded-lg border px-3 py-1.5 transition-colors ${
                        step === i + 1 ? "border-[var(--svc-strong)]" : "border-black/10"
                      }`}
                    >
                      <p className="text-[10px] text-[var(--color-muted)]">{row.label}</p>
                      <p className="h-4 text-[13px] font-medium text-[var(--color-ink)]">
                        {filled ? (
                          <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}>
                            {row.value}
                          </motion.span>
                        ) : null}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="relative mt-3 w-fit">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    step >= 4 ? "bg-[var(--svc-strong)] text-white" : "bg-[var(--color-mist)] text-[var(--color-muted)]"
                  }`}
                >
                  <Send size={11} />
                  {t("items.automation.anim.send")}
                </span>
                <TapCursor show={step === 4} />
              </div>
            </motion.div>
          ) : step === 5 ? (
            <motion.div
              key="preparing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-[220px] flex-col items-center justify-center gap-3 text-center"
            >
              <Loader2 size={28} className="animate-spin text-[var(--svc-strong)]" />
              <p className="text-sm font-medium text-[var(--color-ink)]">{t("items.automation.anim.preparing")}</p>
            </motion.div>
          ) : (
            <motion.div key="quote" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--svc-soft)] text-[var(--svc-ink)]">
                  <FileCheck2 size={14} />
                </span>
                <p className="text-sm font-semibold text-[var(--color-ink)]">{t("items.automation.visual.title")}</p>
              </div>
              <dl className="space-y-1.5 text-[13px]">
                {rows.map((row, i) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex justify-between gap-3 border-b border-dashed border-black/10 pb-1.5"
                  >
                    <dt className="text-[var(--color-muted)]">{row.label}</dt>
                    <dd className="font-medium text-[var(--color-ink)]">{row.value}</dd>
                  </motion.div>
                ))}
              </dl>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--svc-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--svc-ink)]"
              >
                <Check size={11} strokeWidth={3} />
                {t("items.automation.visual.status")}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/* QR menu: scan, browse, add to order, send to kitchen.              */
/* ------------------------------------------------------------------ */

const menuDurations = [1600, 1000, 900, 900, 1000, 2600];

export function MenuPreview({ t }: { t: TFn }) {
  const step = useSequence(menuDurations);
  const steps = t.raw("items.menus.anim.steps") as string[];
  const items = t.raw("items.menus.visual.items") as string[];
  const count = step >= 3 ? 2 : step >= 2 ? 1 : 0;
  const added = (i: number) => (i === 0 && step >= 2) || (i === 2 && step >= 3);

  return (
    <Stage caption={steps[step]} step={step} total={steps.length}>
      <div className="relative flex h-full w-[210px] flex-col overflow-hidden rounded-[28px] border-[6px] border-[var(--color-ink)] bg-white shadow-[var(--shadow-float)]">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="scan"
              exit={{ opacity: 0 }}
              className="flex flex-1 flex-col items-center justify-center gap-3 bg-[var(--color-ink)] text-white"
            >
              <div className="relative rounded-xl bg-white p-2">
                <QrCode size={72} className="text-[var(--color-ink)]" />
                <motion.span
                  className="absolute inset-x-1 h-0.5 rounded-full bg-[var(--svc-accent)] shadow-[0_0_8px_2px_var(--svc-accent)]"
                  animate={{ top: ["10%", "88%", "10%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <p className="text-[11px]">{t("items.menus.anim.scanning")}</p>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease }}
              className="flex flex-1 flex-col"
            >
              <div className="h-14 bg-gradient-to-br from-[var(--svc-soft)] to-[#ffe4d6] px-3 pt-3">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{t("items.menus.anim.menuTitle")}</p>
              </div>
              <div className="flex-1 space-y-1.5 p-2">
                {items.map((item, i) => (
                  <div key={item} className="flex items-center justify-between gap-1 rounded-lg bg-[var(--color-mist)] px-2 py-1.5">
                    <span className="text-[11px] font-medium text-[var(--color-ink)]">{item}</span>
                    <span className="relative">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-white transition-colors ${
                          added(i) ? "bg-[var(--color-success)]" : "bg-[var(--svc-strong)]"
                        }`}
                      >
                        {added(i) ? <Check size={11} strokeWidth={3} /> : <Plus size={11} strokeWidth={3} />}
                      </span>
                      {i === 0 ? <TapCursor show={step === 2} className="-bottom-4 -right-2" /> : null}
                      {i === 2 ? <TapCursor show={step === 3} className="-bottom-4 -right-2" /> : null}
                    </span>
                  </div>
                ))}
              </div>
              <AnimatePresence>
                {count > 0 && step < 5 ? (
                  <motion.div
                    initial={{ y: 40 }}
                    animate={{ y: 0 }}
                    exit={{ y: 40 }}
                    className="relative m-2 flex items-center justify-between rounded-xl bg-[var(--color-ink)] px-2.5 py-2 text-[11px] text-white"
                  >
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <ShoppingBag size={12} />
                      {t("items.menus.anim.cart")} ({count})
                    </span>
                    <span className="whitespace-nowrap font-semibold">{t("items.menus.anim.send")}</span>
                    <TapCursor show={step === 4} className="-bottom-3 right-3" />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === 5 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/95 px-4 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--svc-soft)] text-[var(--svc-ink)]">
                <ChefHat size={22} />
              </span>
              <p className="text-[13px] font-semibold text-[var(--color-ink)]">{t("items.menus.anim.sent")}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Stage>
  );
}
