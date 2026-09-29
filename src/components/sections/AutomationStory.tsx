"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { AgentOrb } from "@/components/agent/AgentOrb";
import { useFormPrefill } from "@/lib/FormPrefillContext";

const SCENE_COUNT = 4;
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Minimal scroll story about time: the same question over and over, the hours
 * it costs, an automation answering in seconds, and the owner's time coming
 * back. One short line per scene, each with a small animated visual.
 */
export function AutomationStory() {
  const t = useTranslations("story");
  const reduce = useReducedMotion();
  const { requestContact } = useFormPrefill();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  // Each scene owns an equal slice of the track; switching is discrete so only
  // one line is ever on screen.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(SCENE_COUNT - 1, Math.floor(v * SCENE_COUNT)));
  });

  const accent = (chunks: ReactNode) => (
    <span className="bg-gradient-to-r from-[#7c4dff] via-[#a57bff] to-[#ff8a65] bg-clip-text text-transparent">{chunks}</span>
  );
  const line = (i: number) => t.rich(`scenes.${i}`, { em: accent });

  const cta = (
    <button
      type="button"
      onClick={() => requestContact({ mainTask: t("cta") })}
      className="group mt-10 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[var(--color-primary)]"
    >
      {t("cta")}
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </button>
  );

  if (reduce) {
    return (
      <section id="automatizacion" className="py-24">
        <Container className="space-y-16 text-center">
          {Array.from({ length: SCENE_COUNT }).map((_, i) => (
            <p key={i} className="text-display mx-auto max-w-[820px] text-4xl font-medium leading-tight text-[var(--color-ink)] md:text-6xl">
              {line(i)}
            </p>
          ))}
          <div>{cta}</div>
        </Container>
      </section>
    );
  }

  return (
    <section id="automatizacion" ref={trackRef} className="relative h-[400vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <Container className="flex flex-col items-center text-center">
          <div className="flex h-[150px] items-end justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.45, ease }}
              >
                {active === 0 ? <RepeatedQuestion question={t("question")} /> : null}
                {active === 1 ? <SpinningClock /> : null}
                {active === 2 ? (
                  <InstantReply question={t("question")} reply={t("reply")} time={t("replyTime")} label={t("agentLabel")} />
                ) : null}
                {active === 3 ? <Hourglass /> : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 min-h-[190px] md:min-h-[230px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease }}
              >
                <p className="text-display mx-auto max-w-[900px] text-[2.3rem] font-medium leading-[1.08] text-[var(--color-ink)] md:text-6xl lg:text-7xl">
                  {line(active)}
                </p>
                {active === SCENE_COUNT - 1 ? cta : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress: a thin line per scene that fills as you scroll. */}
          <div className="mt-6 flex gap-2" aria-hidden="true">
            {Array.from({ length: SCENE_COUNT }).map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === active ? "w-10 bg-[var(--color-ink)]" : i < active ? "w-4 bg-[var(--color-ink)]/40" : "w-4 bg-black/10"
                }`}
              />
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}

/** The same message arriving again and again while a counter climbs. */
function RepeatedQuestion({ question }: { question: string }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => setCount((c) => (c >= 47 ? 47 : c + 1)), 70);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1 - i * 0.3, y: 0, scale: 1 - i * 0.06 }}
          transition={{ delay: 0.15 + i * 0.25, duration: 0.35 }}
          className="rounded-2xl rounded-bl-sm bg-[var(--color-mist)] px-4 py-2 text-[15px] text-[var(--color-ink)]"
          style={{ marginTop: i === 0 ? 0 : -6 }}
        >
          {question}
        </motion.div>
      ))}
      <span className="absolute -right-8 -top-3 flex h-8 min-w-8 items-center justify-center rounded-full bg-[#ff5a4f] px-2 text-sm font-semibold tabular-nums text-white shadow-[0_6px_16px_rgba(255,90,79,0.35)]">
        {count}
      </span>
    </div>
  );
}

/** An analog clock whose hands race forward: time slipping away. */
function SpinningClock() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" aria-hidden="true">
      <circle cx="65" cy="65" r="58" fill="white" stroke="var(--color-ink)" strokeWidth="4" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={65 + Math.cos(a) * 48}
            y1={65 + Math.sin(a) * 48}
            x2={65 + Math.cos(a) * 53}
            y2={65 + Math.sin(a) * 53}
            stroke="var(--color-ink)"
            strokeOpacity={0.35}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <motion.line
        x1="65"
        y1="65"
        x2="65"
        y2="32"
        stroke="var(--color-ink)"
        strokeWidth="5"
        strokeLinecap="round"
        style={{ originX: "65px", originY: "65px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <motion.line
        x1="65"
        y1="65"
        x2="65"
        y2="18"
        stroke="#ff5a4f"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ originX: "65px", originY: "65px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      <circle cx="65" cy="65" r="5" fill="var(--color-ink)" />
    </svg>
  );
}

/** A question answered by the agent within seconds. */
function InstantReply({ question, reply, time, label }: { question: string; reply: string; time: string; label: string }) {
  return (
    <div className="flex w-[300px] flex-col gap-2 text-[15px]">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-fit rounded-2xl rounded-bl-sm bg-[var(--color-mist)] px-4 py-2 text-[var(--color-ink)]"
      >
        {question}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2 self-end"
      >
        <span className="rounded-2xl rounded-br-sm bg-[var(--color-primary)] px-4 py-2 text-white">{reply}</span>
        <AgentOrb size={28} label={label} />
      </motion.div>
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="flex items-center gap-1 self-end text-xs font-medium text-[var(--color-success)]"
      >
        <Check size={12} strokeWidth={3} />
        {time}
      </motion.span>
    </div>
  );
}

/** An hourglass that flips over: time given back. */
function Hourglass() {
  return (
    <motion.div
      aria-hidden="true"
      className="text-[96px] leading-none"
      initial={{ rotate: 180 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 0.9, ease }}
    >
      ⏳
    </motion.div>
  );
}
