"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Minus, X, MessageCircle } from "lucide-react";
import { useFormPrefill, type SolutionInterest } from "@/lib/FormPrefillContext";

const STORAGE_KEY = "aigencyx_agent_welcome_closed";

const options = [
  { key: "respondClients", solutionInterest: "chatbot" },
  { key: "bookAppointments", solutionInterest: "appointments" },
  { key: "prepareQuotes", solutionInterest: "quotes" },
  { key: "createWebsite", solutionInterest: "website" },
  { key: "notSure", solutionInterest: "notSure" },
] satisfies { key: string; solutionInterest: SolutionInterest }[];

type Stage = "closed" | "minimized" | "greeting" | "question";

export function AgentWelcome({ onActivity }: { onActivity?: () => void }) {
  const t = useTranslations("agentWelcome");
  const { requestContact } = useFormPrefill();
  const shouldReduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("closed");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const t1 = setTimeout(() => setStage("greeting"), 700);
    const t2 = setTimeout(() => {
      setStage("question");
      onActivity?.();
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    setStage("closed");
    sessionStorage.setItem(STORAGE_KEY, "1");
  }

  function minimize() {
    setStage("minimized");
  }

  function reopen() {
    setStage("question");
    onActivity?.();
  }

  function selectOption(key: string, solutionInterest: SolutionInterest) {
    onActivity?.();
    requestContact({ mainTask: t(`options.${key}`), solutionInterest });
    close();
  }

  if (stage === "closed") return null;

  if (stage === "minimized") {
    return (
      <motion.button
        type="button"
        onClick={reopen}
        initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] shadow-[var(--shadow-float)] cursor-pointer"
      >
        <MessageCircle size={14} />
        {t("reopen")}
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-[300px] rounded-[var(--radius-floating)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-float)]"
      >
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
          <button
            type="button"
            onClick={minimize}
            aria-label={t("minimize")}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)] cursor-pointer"
          >
            <Minus size={13} />
          </button>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)] cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>

        <p className="pr-12 text-sm leading-relaxed text-[var(--color-ink)]">{t("greeting")}</p>

        {stage === "question" ? (
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-3"
          >
            <p className="mb-3 text-sm text-[var(--color-muted)]">{t("question")}</p>
            <div className="flex flex-col gap-1.5">
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => selectOption(option.key, option.solutionInterest)}
                  className="rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 py-2 text-left text-xs font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] cursor-pointer"
                >
                  {t(`options.${option.key}`)}
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
