"use client";

import { Fragment, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Bell, Check, Wand2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { GradientBackdrop } from "@/components/ui/GradientBackdrop";
import { startDemo } from "@/lib/demoEvents";
import { HeroPanel } from "./HeroPanel";

type Word = { text: string; accent: boolean };

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();

  const words: Word[] = [
    ...t("titleStart").split(" ").map((text) => ({ text, accent: false })),
    ...t("titleAccent").split(" ").map((text) => ({ text, accent: true })),
    ...t("titleEnd").split(" ").map((text) => ({ text, accent: false })),
  ];
  const badges = t.raw("badges") as string[];
  const after = (step: number) => ({
    initial: reduce ? undefined : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.2 + words.length * 0.06 + step * 0.12, ease: "easeOut" as const },
  });

  function tryIt(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    startDemo({});
    // Scroll the window itself: scrollIntoView would be cancelled by the demo chat scrolling.
    const demo = document.querySelector<HTMLElement>("#prueba");
    if (demo) window.scrollTo({ top: demo.getBoundingClientRect().top + window.scrollY, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <section id="top" className="relative overflow-hidden">
      <GradientBackdrop />

      <Container className="relative grid min-h-[100svh] items-center gap-10 pb-14 pt-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:pt-24">
        <div>
          <motion.a
            href="#prueba"
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

          <h1 className="text-display mt-6 text-[2.4rem] font-semibold leading-[1.06] text-[var(--color-ink)] sm:text-[3rem] xl:text-[3.3rem]">
            {words.map((word, i) => (
              <Fragment key={`${word.text}-${i}`}>
                <motion.span
                  className={`inline-block ${word.accent ? "bg-gradient-to-r from-[#7c4dff] via-[#a57bff] to-[#ff8a65] bg-clip-text pb-[0.08em] text-transparent" : ""}`}
                  initial={reduce ? undefined : { opacity: 0, y: "0.35em", filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.06, ease }}
                >
                  {word.text}
                </motion.span>
                {i < words.length - 1 ? " " : null}
              </Fragment>
            ))}
          </h1>

          <motion.p {...after(0)} className="mt-5 max-w-[540px] text-lg leading-relaxed text-[var(--color-muted)]">
            {t("subtitle")}
          </motion.p>

          <motion.ul {...after(1)} className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
            {badges.map((badge) => (
              <li key={badge} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-ink)]/80">
                <Check size={15} strokeWidth={2.5} className="text-[var(--color-primary)]" />
                {badge}
              </li>
            ))}
          </motion.ul>

          {/* One clear next step: create the demo */}
          <motion.div {...after(2)} className="mt-7 flex flex-col items-start gap-2.5">
            <a
              href="#prueba"
              onClick={tryIt}
              className="group inline-flex h-14 items-center gap-2.5 rounded-2xl bg-[var(--color-primary)] px-7 text-[16px] font-semibold text-white shadow-[0_18px_36px_-16px_rgba(124,77,255,0.8)] transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              <Wand2 size={18} />
              {t("ctaDemo")}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </a>
            <p className="text-[13px] text-[var(--color-muted)]">{t("ctaNote")}</p>
          </motion.div>
        </div>

        <motion.div
          className="min-w-0"
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease }}
        >
          <HeroPanel />
        </motion.div>
      </Container>
    </section>
  );
}
