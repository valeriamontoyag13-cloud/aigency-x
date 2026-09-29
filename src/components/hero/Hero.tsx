"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Bell } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GradientBackdrop } from "@/components/ui/GradientBackdrop";
import { useFormPrefill } from "@/lib/FormPrefillContext";
import { HeroComposer } from "./HeroComposer";

type Word = { text: string; accent: boolean };

export function Hero() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const { requestContact } = useFormPrefill();

  const words: Word[] = [
    ...t("titleStart").split(" ").map((text) => ({ text, accent: false })),
    ...t("titleAccent").split(" ").map((text) => ({ text, accent: true })),
    ...t("titleEnd").split(" ").map((text) => ({ text, accent: false })),
  ];
  const tags = t.raw("tags") as string[];

  return (
    <section id="top" className="relative overflow-hidden">
      <GradientBackdrop />

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center pb-16 pt-32 md:pt-36">
        <Container className="relative flex flex-col items-center text-center">
          <motion.a
            href="#servicios"
            initial={reduce ? undefined : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="group inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 py-1.5 pl-2 pr-4 text-sm text-[var(--color-ink)] backdrop-blur-md transition-colors hover:bg-white"
          >
            <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <Bell size={13} />
              <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-[#ff7a59]" />
            </span>
            {t("announcement")}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </motion.a>

          <h1 className="text-display mt-8 max-w-[980px] text-[2.6rem] font-medium leading-[1.05] text-[var(--color-ink)] sm:text-6xl lg:text-[5rem]">
            {words.map((word, i) => (
              <motion.span
                key={`${word.text}-${i}`}
                className={`inline-block ${word.accent ? "bg-gradient-to-r from-[#7c4dff] via-[#a57bff] to-[#ff8a65] bg-clip-text pb-[0.08em] text-transparent" : ""}`}
                initial={reduce ? undefined : { opacity: 0, y: "0.35em", filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                {word.text}
                {i < words.length - 1 ? " " : ""}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 + words.length * 0.07, ease: "easeOut" }}
            className="mt-7 max-w-[620px] text-lg leading-relaxed text-[var(--color-muted)] md:text-xl"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + words.length * 0.07, ease: "easeOut" }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Button href="#contacto" variant="primary" onClick={() => requestContact({ mainTask: t("ctaPrimary") })}>
              {t("ctaPrimary")}
            </Button>
            <Button href="#servicios" variant="secondary">
              {t("ctaSecondary")}
            </Button>
          </motion.div>

          <motion.ul
            initial={reduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 + words.length * 0.07 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-[var(--color-muted)]"
          >
            {tags.map((tag, i) => (
              <li key={tag} className="flex items-center gap-3">
                {i > 0 ? <span className="h-1 w-1 rounded-full bg-[var(--color-primary)]" /> : null}
                {tag}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 + words.length * 0.07, ease: "easeOut" }}
            className="mt-12 w-full max-w-[460px]"
          >
            <HeroComposer />
          </motion.div>
        </Container>
      </div>
    </section>
  );
}
