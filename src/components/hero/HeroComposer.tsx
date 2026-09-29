"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUp, AtSign, MousePointer2, Paperclip } from "lucide-react";

type Phase = "typing" | "sending" | "sent";

/**
 * "Ask your agent" input that types example requests on its own. A small
 * cursor avatar glides to the send button after each prompt, hinting that the
 * business owner just asks and the agent does the work.
 */
export function HeroComposer() {
  const t = useTranslations("hero.cards.composer");
  const reduce = useReducedMotion();
  const prompts = t.raw("prompts") as string[];

  const [index, setIndex] = useState(0);
  const [chars, setChars] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const prompt = prompts[index % prompts.length];

  useEffect(() => {
    if (reduce) return;
    let id: number;
    if (phase === "typing") {
      if (chars < prompt.length) {
        id = window.setTimeout(() => setChars((c) => c + 1), 45);
      } else {
        id = window.setTimeout(() => setPhase("sending"), 700);
      }
    } else if (phase === "sending") {
      id = window.setTimeout(() => setPhase("sent"), 900);
    } else {
      id = window.setTimeout(() => {
        setIndex((i) => i + 1);
        setChars(0);
        setPhase("typing");
      }, 600);
    }
    return () => window.clearTimeout(id);
  }, [chars, phase, prompt.length, reduce]);

  const text = reduce ? prompts[0] : prompt.slice(0, chars);

  return (
    <div className="relative rounded-2xl border border-black/5 bg-white/90 p-4 text-left shadow-[var(--shadow-artifact)] backdrop-blur-md">
      <p className="min-h-[1.5rem] text-[15px] text-[var(--color-ink)]">
        {text ? (
          <>
            {text}
            {phase === "typing" && !reduce ? (
              <span className="ml-px inline-block h-4 w-px translate-y-0.5 animate-pulse bg-[var(--color-ink)]" />
            ) : null}
          </>
        ) : (
          <span className="text-[var(--color-muted)]">{t("placeholder")}</span>
        )}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[var(--color-muted)]">
          <AtSign size={16} />
          <Paperclip size={16} />
        </div>
        <motion.span
          animate={phase === "sent" && !reduce ? { scale: [1, 0.85, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors ${
            phase === "typing" ? "bg-[var(--color-ink)]" : "bg-[var(--color-primary)]"
          }`}
        >
          <ArrowUp size={16} />
        </motion.span>
      </div>

      {/* Cursor avatar that "clicks" send. */}
      {!reduce ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute flex items-start"
          initial={false}
          animate={phase === "typing" ? { left: "40%", top: 64 } : { left: "86%", top: 56 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <MousePointer2 size={18} className="fill-[var(--color-ink)] text-white" />
          <span className="mt-3 -ml-1 rounded-full border-2 border-white bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary-hover)] shadow-[var(--shadow-card)]">
            {t("you")}
          </span>
        </motion.div>
      ) : null}
    </div>
  );
}
