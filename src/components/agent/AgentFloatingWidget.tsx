"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ArrowRight } from "lucide-react";
import { AgentOrb } from "./AgentOrb";
import { buildWhatsAppLink } from "@/config/contact";
import { useFormPrefill, type SolutionInterest } from "@/lib/FormPrefillContext";

const options = [
  { key: "customerService", solutionInterest: "chatbot" },
  { key: "appointments", solutionInterest: "appointments" },
  { key: "quotes", solutionInterest: "quotes" },
  { key: "website", solutionInterest: "website" },
  { key: "notSure", solutionInterest: "notSure" },
] satisfies { key: string; solutionInterest: SolutionInterest }[];

export function AgentFloatingWidget() {
  const t = useTranslations("agentFloating");
  const shouldReduceMotion = useReducedMotion();
  const { requestContact } = useFormPrefill();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [selected, setSelected] = useState<(typeof options)[number] | null>(null);

  function toggle() {
    setOpen((v) => {
      const next = !v;
      if (next) {
        setPulse(true);
        setTimeout(() => setPulse(false), 650);
      } else {
        setSelected(null);
      }
      return next;
    });
  }

  function goToDemo() {
    document.querySelector("#servicios")?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
    setOpen(false);
  }

  function goToForm() {
    if (selected) {
      requestContact({
        mainTask: t(`options.${selected.key}`),
        solutionInterest: selected.solutionInterest,
      });
    }
    setOpen(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="w-[300px] max-w-[86vw] rounded-[var(--radius-floating)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-float)]"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                {selected ? t(`options.${selected.key}`) : t("title")}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {selected ? (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  {t(`responses.${selected.key}`)}
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={goToDemo}
                    className="flex items-center justify-between rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] cursor-pointer"
                  >
                    {t("actions.demo")}
                    <ArrowRight size={13} />
                  </button>
                  <a
                    href={buildWhatsAppLink(t(`responses.${selected.key}`))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] cursor-pointer"
                  >
                    {t("actions.whatsapp")}
                    <ArrowRight size={13} />
                  </a>
                  <button
                    type="button"
                    onClick={goToForm}
                    className="flex items-center justify-between rounded-[var(--radius-input)] bg-[var(--color-primary)] px-3 py-2 text-xs font-medium text-white cursor-pointer"
                  >
                    {t("actions.form")}
                    <ArrowRight size={13} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer"
                >
                  {t("back")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {options.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelected(option)}
                    className="rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-2 text-left text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] cursor-pointer"
                  >
                    {t(`options.${option.key}`)}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggle}
        aria-label={t("ariaLabel")}
        aria-expanded={open}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-float)] transition-transform hover:scale-105 cursor-pointer"
      >
        {open ? (
          <X size={20} className="text-[var(--color-ink)]" />
        ) : (
          <AgentOrb size={44} pulse={pulse} label={t("agentLabel")} />
        )}
      </button>
    </div>
  );
}
