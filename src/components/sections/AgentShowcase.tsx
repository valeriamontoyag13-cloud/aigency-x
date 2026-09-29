"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { BellRing, Clock, MessageSquareHeart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { AgentOrb } from "@/components/agent/AgentOrb";

type Persona = { name: string; business: string; question: string; answer: string };
type Item = { title: string; text: string };

const avatarTints = ["bg-[#ffe4d6] text-[#8a3b1f]", "bg-[#e6f0ff] text-[#1d4fb8]", "bg-[#e2f6ec] text-[#14653f]"];
const featureIcons = [Clock, MessageSquareHeart, BellRing];

export function AgentShowcase() {
  const t = useTranslations("agentShowcase");
  const personas = t.raw("personas") as Persona[];
  const features = t.raw("features") as Item[];

  return (
    <section className="bg-[var(--color-fog)] py-20 md:py-28">
      <Container>
        <SectionHeading align="center" eyebrow={t("eyebrow")} title={t("title")} description={t("subtitle")} />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {personas.map((p, i) => (
            <PersonaCard key={p.name} persona={p} index={i} agentName={t("agentName")} />
          ))}
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = featureIcons[i];
            return (
              <Reveal key={f.title} delay={i * 0.08}>
                <Icon size={20} className="text-[var(--color-primary)]" />
                <p className="mt-4 text-xl font-medium text-[var(--color-ink)]">{f.title}</p>
                <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-muted)]">{f.text}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/** Customer question that, once on screen, gets a "typing…" beat and then the agent's reply. */
function PersonaCard({ persona, index, agentName }: { persona: Persona; index: number; agentName: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [stage, setStage] = useState<"question" | "typing" | "answer">(reduce ? "answer" : "question");

  useEffect(() => {
    if (!inView || reduce) return;
    const a = window.setTimeout(() => setStage("typing"), 700 + index * 500);
    const b = window.setTimeout(() => setStage("answer"), 2000 + index * 500);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [inView, index, reduce]);

  return (
    <motion.div
      ref={ref}
      initial={reduce ? undefined : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
      className="flex min-h-[260px] flex-col rounded-[24px] bg-white p-6 shadow-[0_0_0_1px_rgba(27,23,48,0.05)]"
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${avatarTints[index % 3]}`}>
          {persona.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <p className="text-[15px] font-medium text-[var(--color-ink)]">{persona.name}</p>
          <p className="text-sm text-[var(--color-muted)]">{persona.business}</p>
        </div>
      </div>
      <p className="mt-5 text-lg leading-snug text-[var(--color-ink)]">{persona.question}</p>

      <div className="mt-auto pt-6">
        <AnimatePresence mode="wait">
          {stage === "typing" ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex w-fit items-center gap-1 rounded-2xl bg-[var(--color-primary-soft)] px-4 py-3"
            >
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                />
              ))}
            </motion.div>
          ) : stage === "answer" ? (
            <motion.div
              key="answer"
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-[var(--color-primary-soft)] p-3.5"
            >
              <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--color-primary-hover)]">
                <AgentOrb size={18} label={agentName} />
                {agentName}
              </div>
              <p className="mt-1.5 text-[15px] text-[#2a1a6b]">{persona.answer}</p>
            </motion.div>
          ) : (
            <div className="h-11" />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
