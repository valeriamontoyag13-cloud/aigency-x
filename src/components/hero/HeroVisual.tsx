"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { Globe, CheckCircle2, FileCheck2, CalendarCheck, UserCheck, Bell } from "lucide-react";
import { AgentOrb } from "@/components/agent/AgentOrb";
import { AgentWelcome } from "@/components/agent/AgentWelcome";

const MAX_TILT = 5;
const SEQUENCE_MS = 2800;

type SequenceState = "message" | "reply" | "appointment" | "quote";
const sequence: SequenceState[] = ["message", "reply", "appointment", "quote"];

export function HeroVisual() {
  const t = useTranslations("hero.visual");
  const shouldReduceMotion = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [stateIndex, setStateIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [pulse, setPulse] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });
  const chipYSlow = useTransform(scrollYProgress, [0, 1], [-16, 16]);
  const chipYFast = useTransform(scrollYProgress, [0, 1], [-32, 32]);
  const orbRotate = useTransform(scrollYProgress, [0, 1], [-4, 4]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const timer = setInterval(() => {
      setStateIndex((i) => (i + 1) % sequence.length);
    }, SEQUENCE_MS);
    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion || !isDesktop) return;
    const scene = sceneRef.current;
    if (!scene) return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    let frame = 0;
    const handleMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = scene.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: relY * -MAX_TILT, y: relX * MAX_TILT });
      });
    };
    const reset = () => setTilt({ x: 0, y: 0 });
    window.addEventListener("pointermove", handleMove);
    scene.addEventListener("pointerleave", reset);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handleMove);
      scene.removeEventListener("pointerleave", reset);
    };
  }, [shouldReduceMotion, isDesktop]);

  function triggerPulse() {
    setPulse(true);
    setTimeout(() => setPulse(false), 650);
  }

  const active = shouldReduceMotion ? "appointment" : sequence[stateIndex];

  return (
    <div
      ref={sceneRef}
      className="relative mx-auto flex h-[440px] w-full max-w-[480px] items-center justify-center sm:h-[520px] lg:h-[560px]"
      style={{ perspective: shouldReduceMotion ? undefined : 1300 }}
    >
      <div className="absolute h-72 w-72 rounded-full bg-[var(--color-primary-soft)] blur-3xl" />

      <div
        className="relative h-full w-full"
        style={
          shouldReduceMotion
            ? undefined
            : {
                transformStyle: "preserve-3d",
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: "transform 300ms ease-out",
              }
        }
      >
        {/* Ambient: website thumbnail (always visible — the core "landing page" fragment) */}
        <div
          className="absolute left-[2%] top-[6%] w-[190px] overflow-hidden rounded-[var(--radius-floating)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-float)]"
          style={shouldReduceMotion ? undefined : { transform: "translateZ(-40px) rotate(-3deg)" }}
        >
          <div className="flex items-center gap-1.5 border-b border-[var(--color-border)] px-3 py-2">
            <Globe size={10} className="text-[var(--color-muted)]" />
            <span className="truncate text-[9px] font-medium text-[var(--color-muted)]">
              {t("websiteUrl")}
            </span>
          </div>
          <div className="space-y-1.5 p-3">
            <span className="block h-1.5 w-3/4 rounded-full bg-[var(--color-surface-alt)]" />
            <span className="block h-1.5 w-1/2 rounded-full bg-[var(--color-surface-alt)]" />
            <span className="mt-2 block h-6 w-2/3 rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>

        {/* Ambient: team notification (desktop only) */}
        <motion.div
          style={isDesktop && !shouldReduceMotion ? { y: chipYFast } : undefined}
          className="absolute right-[4%] top-[2%] hidden items-center gap-2 rounded-[var(--radius-floating)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-float)] lg:flex"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
            <Bell size={12} />
          </span>
          <span className="text-xs font-medium text-[var(--color-ink)]">
            {t("teamNotification")}
          </span>
        </motion.div>

        {/* Ambient: mini calendar (desktop only) */}
        <motion.div
          style={isDesktop && !shouldReduceMotion ? { y: chipYSlow } : undefined}
          className="absolute bottom-[20%] left-[-2%] hidden flex-col gap-1 rounded-[var(--radius-floating)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-float)] lg:flex"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--color-muted)]">
            <CalendarCheck size={12} className="text-[var(--color-primary)]" />
            {t("calendarLabel")}
          </span>
          <div className="flex gap-1">
            {[17, 18, 19, 20, 21].map((day) => (
              <span
                key={day}
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-medium ${
                  day === 19 ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-muted)]"
                }`}
              >
                {day}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Ambient: contact saved (desktop only) */}
        <motion.div
          style={isDesktop && !shouldReduceMotion ? { y: chipYSlow } : undefined}
          className="absolute bottom-[4%] right-[6%] hidden items-center gap-2 rounded-[var(--radius-floating)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 shadow-[var(--shadow-float)] lg:flex"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fff3de] text-[#8a5a08]">
            <UserCheck size={12} />
          </span>
          <span className="text-xs font-medium text-[var(--color-ink)]">
            {t("contactSaved")}
          </span>
        </motion.div>

        {/* The agent */}
        <motion.div
          className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2"
          style={
            !shouldReduceMotion
              ? { rotate: orbRotate, transform: "translateZ(20px)" }
              : undefined
          }
        >
          <AgentOrb size={168} pulse={pulse} label={t("agentLabel")} />
        </motion.div>

        {/* Agent welcome, anchored under the orb — part of the composition, not a modal */}
        <div className="absolute bottom-[2%] left-1/2 w-[86%] max-w-[280px] -translate-x-1/2 lg:bottom-[8%] lg:left-[6%] lg:translate-x-0">
          <AgentWelcome onActivity={triggerPulse} />
        </div>

        {/* Live sequence card: message -> reply -> appointment -> quote */}
        <div
          className="absolute right-[0%] top-[16%] w-[190px] overflow-hidden rounded-[var(--radius-floating)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-float)]"
          style={shouldReduceMotion ? undefined : { transform: "translateZ(60px)" }}
        >
          <div className="min-h-[104px] p-3.5">
            <AnimatePresence mode="wait">
              {active === "message" ? (
                <motion.div
                  key="message"
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    {t("whatsappNotice")}
                  </p>
                  <div className="rounded-2xl rounded-tl-sm bg-[var(--color-surface-alt)] px-3 py-2 text-xs text-[var(--color-ink)]">
                    {t("customerMsg")}
                  </div>
                  <p className="text-[10px] text-[var(--color-muted)]">{t("typing")}</p>
                </motion.div>
              ) : active === "reply" ? (
                <motion.div
                  key="reply"
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className="ml-6 rounded-2xl rounded-tr-sm bg-[var(--color-primary)] px-3 py-2 text-xs text-white">
                    {t("agentReply")}
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-full bg-[var(--color-surface-alt)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-ink)]">
                      {t("optionBook")}
                    </span>
                    <span className="rounded-full bg-[var(--color-surface-alt)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-ink)]">
                      {t("optionQuote")}
                    </span>
                  </div>
                </motion.div>
              ) : active === "appointment" ? (
                <motion.div
                  key="appointment"
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-start gap-2"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-[var(--color-success)]">
                    <CheckCircle2 size={18} />
                  </span>
                  <p className="text-xs font-semibold text-[var(--color-ink)]">
                    {t("appointmentConfirmed")}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted)]">{t("appointmentSlot")}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="quote"
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-start gap-2"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3de] text-[#8a5a08]">
                    <FileCheck2 size={18} />
                  </span>
                  <p className="text-xs font-semibold text-[var(--color-ink)]">
                    {t("quotePrepared")}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted)]">{t("quoteSent")}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
