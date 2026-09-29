"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  ArrowUp,
  AtSign,
  Bot,
  CalendarDays,
  ChevronLeft,
  FileText,
  Globe,
  Home,
  MessagesSquare,
  MousePointer2,
  Pencil,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

const navIcons = [Home, Bot, MessagesSquare, CalendarDays, FileText, Globe, Users];
const bars = [38, 52, 44, 66, 58, 30, 26, 48, 62, 55, 78, 70, 40, 88];

type Stat = { title: string; value: string; delta: string };
type Channel = { label: string; value: string };

/**
 * Product shot of the AIgency.x panel. It rises and straightens (a 3D tilt
 * that flattens) as it scrolls into view, then its charts grow in.
 */
export function HeroDashboard() {
  const t = useTranslations("dashboard");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.2"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [60, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.3, 1]);

  const navItems = t.raw("nav") as string[];
  const recent = t.raw("recent") as string[];
  const days = t.raw("days") as string[];
  const channels = t.raw("channels.items") as Channel[];
  const stats = t.raw("stats") as Stat[];

  return (
    <Container className="relative pb-24 md:pb-32">
      <div ref={ref} style={{ perspective: 1600 }}>
        <motion.div
          style={reduce ? undefined : { rotateX, scale, y, opacity, transformOrigin: "50% 0%" }}
          className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-[0_40px_80px_-20px_rgba(27,23,48,0.25),0_0_0_1px_rgba(27,23,48,0.04)]"
        >
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 border-b border-black/5 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] md:grid-cols-[210px_minmax(0,1fr)]">
            {/* Sidebar */}
            <aside className="hidden border-r border-black/5 p-4 md:block">
              <div className="flex items-center justify-between">
                <Logo className="text-sm" />
                <Search size={14} className="text-[var(--color-muted)]" />
              </div>
              <p className="mt-4 rounded-lg bg-[var(--color-mist)] px-2.5 py-1.5 text-xs text-[var(--color-muted)]">
                {t("workspace")}
              </p>
              <ul className="mt-4 space-y-0.5">
                {navItems.map((item, i) => {
                  const Icon = navIcons[i];
                  return (
                    <li
                      key={item}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] ${
                        i === 0 ? "bg-[var(--color-mist)] font-medium text-[var(--color-ink)]" : "text-[var(--color-muted)]"
                      }`}
                    >
                      <Icon size={14} />
                      {item}
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Main */}
            <div className="min-w-0 p-4 md:p-7">
              <div className="flex items-center justify-between text-[13px] text-[var(--color-muted)]">
                <span className="flex items-center gap-2 font-medium text-[var(--color-ink)]">
                  <ChevronLeft size={14} className="text-[var(--color-muted)]" />
                  {navItems[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Pencil size={12} />
                </span>
              </div>

              <h3 className="mt-5 text-xl font-medium text-[var(--color-ink)] md:text-2xl">{t("greeting")} ☀️</h3>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                <div className="relative rounded-2xl border border-black/5 p-4 shadow-[0_8px_24px_-12px_rgba(27,23,48,0.2)]">
                  <p className="text-[13px] text-[var(--color-ink)]">{t("composer")}</p>
                  <div className="mt-4 flex items-center justify-between text-[var(--color-muted)]">
                    <AtSign size={14} />
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-ink)] text-white">
                      <ArrowUp size={13} />
                    </span>
                  </div>
                  <span aria-hidden="true" className="absolute bottom-1 right-12 hidden items-start sm:flex">
                    <MousePointer2 size={16} className="fill-[var(--color-ink)] text-white" />
                    <span className="mt-2.5 -ml-1 rounded-full border-2 border-white bg-[var(--color-primary-soft)] px-1.5 text-[10px] font-semibold text-[var(--color-primary-hover)]">
                      LR
                    </span>
                  </span>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[var(--color-ink)]">{t("recentTitle")}</p>
                  <ul className="mt-2 space-y-2">
                    {recent.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[12px] text-[var(--color-muted)]">
                        <Sparkles size={12} className="shrink-0 text-[var(--color-primary)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                {/* Conversations + channels */}
                <div className="grid gap-4 rounded-2xl bg-[var(--color-primary-soft)] p-5 sm:grid-cols-[1.4fr_1fr]">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium text-[var(--color-primary-hover)]">{t("conversations.title")}</p>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-[#2a1a6b]">{t("conversations.value")}</p>
                        <p className="text-[11px] text-[var(--color-primary-hover)]">{t("conversations.delta")}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex h-28 items-end gap-1.5">
                      {bars.map((h, i) => (
                        <motion.span
                          key={i}
                          className="flex-1 origin-bottom rounded-full bg-[var(--color-primary)]"
                          style={{ height: `${h}%` }}
                          initial={reduce ? undefined : { scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true, margin: "-80px" }}
                          transition={{ duration: 0.6, delay: 0.2 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                        />
                      ))}
                    </div>
                    <div className="mt-1.5 flex gap-1.5">
                      {days.map((d, i) => (
                        <span key={i} className="flex-1 text-center text-[9px] text-[var(--color-primary-hover)]/70">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="sm:border-l sm:border-[var(--color-primary)]/15 sm:pl-4">
                    <p className="text-[13px] font-medium text-[var(--color-primary-hover)]">{t("channels.title")}</p>
                    <ul className="mt-2 divide-y divide-[var(--color-primary)]/10">
                      {channels.map((ch) => (
                        <li key={ch.label} className="flex justify-between py-2 text-[12px]">
                          <span className="text-[var(--color-primary-hover)]/80">{ch.label}</span>
                          <span className="font-medium text-[#2a1a6b]">{ch.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bookings ring */}
                <div className="flex flex-col justify-between rounded-2xl bg-[#fff1e8] p-5">
                  <p className="text-[13px] font-medium text-[#8a3b1f]">{t("bookings.title")}</p>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-2xl font-semibold text-[#5d2a1a]">{t("bookings.sub")}</p>
                      <p className="text-[11px] text-[#8a3b1f]">{t("bookings.delta")}</p>
                    </div>
                    <BookingRing value={t("bookings.value")} note={t("bookings.note")} reduce={!!reduce} />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                  <div key={s.title} className="rounded-2xl bg-[var(--color-mist)] p-5 text-center">
                    <p className="text-[13px] text-[var(--color-muted)]">{s.title}</p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{s.value}</p>
                    <p className="mt-1 text-[11px] text-[var(--color-muted)]">{s.delta}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <p className="mt-5 text-center text-sm text-[var(--color-muted)]">{t("caption")}</p>
    </Container>
  );
}

function BookingRing({ value, note, reduce }: { value: string; note: string; reduce: boolean }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-[108px] w-[108px] shrink-0">
      <svg viewBox="0 0 108 108" className="h-full w-full -rotate-90">
        <circle cx="54" cy="54" r={r} fill="none" stroke="#fbd9c6" strokeWidth="8" />
        <motion.circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="#5d2a1a"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? { strokeDashoffset: c * 0.14 } : { strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * 0.14 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold text-[#5d2a1a]">{value}</span>
        <span className="text-[10px] text-[#8a3b1f]">{note}</span>
      </div>
    </div>
  );
}
