"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Bell, CalendarCheck, CalendarDays, Check, FileText, Globe, MessageCircle, MousePointer2 } from "lucide-react";

type ChatLine = { from: "client" | "bot"; text: string };
type Slot = [string, string];

// The scene is drawn at this size and scaled to fit its column.
const WIDTH = 680;
const HEIGHT = 500;
// Phones get a simpler scene: just the chat, big enough to read.
const COMPACT_WIDTH = 320;
const COMPACT_HEIGHT = 556;

// One loop of the story: the WhatsApp chat drives the calendar, the reminder
// and the quote; then a booking comes in from the website. Paced so each
// message can be read (about 150 words a minute).
const timeline = [
  [900, "m0"],
  [3600, "typing"],
  [5000, "m1"],
  [9500, "m2"],
  [10500, "typing"],
  [12000, "m3"],
  [17800, "m4"],
  [20200, "typing"],
  [21600, "m5"],
  [25000, "cursor"],
  [26000, "web"],
  [32000, "reset"],
] as const;
type Beat = (typeof timeline)[number][1];

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Animated hero scene with what AIgency builds, working together for one
 * business: the WhatsApp assistant chats with a client, the calendar fills
 * itself, a reminder gets scheduled, a quote is built and sent, and a booking
 * arrives from the website.
 */
export function HeroPanel() {
  const t = useTranslations("hero.panel");
  const reduce = useReducedMotion();
  const chat = t.raw("chat") as ChatLine[];
  const slots = t.raw("calendar.slots") as Slot[];
  const quoteLines = t.raw("quote.lines") as [string, string][];
  const [step, setStep] = useState(0);
  const [answered, setAnswered] = useState(231);
  const [frameWidth, setFrameWidth] = useState(WIDTH);
  const frameRef = useRef<HTMLDivElement>(null);

  // Scale the drawing to the width it gets.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => setFrameWidth(entry.contentRect.width));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  // Play the story, then start again.
  useEffect(() => {
    if (reduce) return;
    let timers: number[] = [];
    function play() {
      timers = timeline.map(([at, beat], i) =>
        window.setTimeout(() => {
          if (beat === "reset") {
            setStep(0);
            play();
            return;
          }
          setStep(i + 1);
          if (beat.startsWith("m") && Number(beat.slice(1)) % 2 === 1) setAnswered((n) => n + 1);
        }, at),
      );
    }
    play();
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [reduce]);

  const fired: Beat[] = (reduce ? timeline.slice(0, -1) : timeline.slice(0, step)).map(([, beat]) => beat);
  const has = (beat: Beat) => fired.includes(beat);
  const messages = chat.slice(0, fired.filter((beat) => beat.startsWith("m")).length);
  const typing = fired.at(-1) === "typing";
  const booked = [true, has("m3"), has("web")];
  const compact = frameWidth < 440;
  const width = compact ? COMPACT_WIDTH : WIDTH;
  const height = compact ? COMPACT_HEIGHT : HEIGHT;
  const scale = Math.min(1, frameWidth / width);

  const phone = (
    <>
      <span className="absolute -top-3.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-[var(--color-ink)] px-2.5 py-1 text-[10px] font-semibold text-white shadow-md">
        <MessageCircle size={11} />
        {t("labels.assistant")}
      </span>
      <div className="flex h-[462px] flex-col overflow-hidden rounded-[34px] border-[7px] border-[var(--color-ink)] bg-[#efeae2] shadow-[0_40px_70px_-35px_rgba(27,23,48,0.6)]">
        <div className="flex items-center gap-2 bg-white px-3 pb-2.5 pt-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#a57bff] to-[#7c4dff] text-sm">💅</span>
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-semibold leading-tight text-[var(--color-ink)]">{t("business")}</p>
            <p className="text-[10px] text-[var(--color-success)]">{typing ? t("typing") : t("online")}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden px-2.5 py-3">
          <AnimatePresence initial={false}>
            {messages.map((line, i) => (
              <motion.p
                key={`${i}-${line.text}`}
                layout="position"
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                className={`max-w-[86%] rounded-2xl px-3 py-1.5 text-[11.5px] leading-snug ${
                  line.from === "bot"
                    ? "rounded-tl-sm bg-white text-[var(--color-ink)] shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
                    : "ml-auto rounded-tr-sm bg-[var(--color-primary)] text-white"
                }`}
              >
                {line.text}
              </motion.p>
            ))}
            {typing ? (
              <motion.div
                key="typing"
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex w-fit gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-2.5"
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
            ) : null}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-2 bg-[#f6f3ee] px-2.5 py-2">
          <span className="flex-1 rounded-full bg-white px-3 py-1.5 text-[10px] text-[var(--color-muted)]">…</span>
          <span className="h-7 w-7 rounded-full bg-[var(--color-primary)]" />
        </div>
      </div>
    </>
  );

  if (compact) {
    // What the owner gets while the chat goes on, one line at a time.
    const event = has("web")
      ? { key: "web", icon: Globe, text: t("toasts.web") }
      : has("m5")
        ? { key: "quote", icon: FileText, text: `${t("quote.title")} · ${t("quote.total")} ✓` }
        : has("m3")
          ? { key: "booked", icon: CalendarCheck, text: `${slots[1][0]} · ${slots[1][1]} ✓` }
          : null;
    return (
      <div ref={frameRef} className="relative w-full min-w-0" style={{ height: height * scale }} aria-hidden="true">
        <div
          className="absolute left-1/2 top-0 origin-top"
          style={{ width, height, transform: `translateX(-50%) scale(${scale})` }}
        >
          <div className="absolute left-[34px] top-[14px] w-[252px]">{phone}</div>
          <div className="absolute inset-x-0 top-[500px] flex justify-center">
            <AnimatePresence mode="wait">
              {event ? <Toast key={event.key} icon={event.icon} text={event.text} /> : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // The card next to the phone follows the story: calendar, then quote, then website.
  const focus: "agenda" | "quote" | "web" = has("cursor") || has("web") ? "web" : has("m4") ? "quote" : "agenda";
  const tabs = [
    { key: "agenda", icon: CalendarDays, label: t("tabs.agenda") },
    { key: "quote", icon: FileText, label: t("tabs.quotes") },
    { key: "web", icon: Globe, label: t("tabs.web") },
  ] as const;

  return (
    <div ref={frameRef} className="relative w-full min-w-0" style={{ height: HEIGHT * scale }} aria-hidden="true">
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: WIDTH, height: HEIGHT, transform: `scale(${scale})` }}>
        {/* Soft glow behind the scene */}
        <div
          className="absolute inset-x-10 inset-y-6 rounded-[60px]"
          style={{ background: "radial-gradient(60% 60% at 50% 45%, rgba(124,77,255,0.2), transparent 70%)" }}
        />

        {/* WhatsApp assistant */}
        <div className="absolute left-[70px] top-[26px] w-[252px]">{phone}</div>

        {/* What the chat just did, one card at a time */}
        <div className="absolute left-[352px] top-[112px] w-[258px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={focus}
              initial={reduce ? undefined : { opacity: 0, x: 18, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, x: -12, scale: 0.97 }}
              transition={{ duration: 0.45, ease }}
            >
              {focus === "agenda" ? (
                <Card label={t("labels.agenda")} icon={CalendarDays}>
                  <p className="text-[12px] font-semibold text-[var(--color-ink)]">{t("calendar.title")}</p>
                  <ul className="mt-2 space-y-1.5">
                    {slots.map(([time, who], i) => (
                      <li key={time} className="flex items-center gap-2">
                        <span className="w-[42px] shrink-0 text-[10.5px] font-medium tabular-nums text-[var(--color-muted)]">{time}</span>
                        <motion.span
                          className={`flex flex-1 items-center gap-1 truncate rounded-lg px-2 py-1.5 text-[10.5px] font-medium ${
                            booked[i]
                              ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                              : "border border-dashed border-[var(--color-border)] text-[var(--color-muted)]"
                          }`}
                          animate={booked[i] && i > 0 && !reduce ? { scale: [0.94, 1.04, 1] } : { scale: 1 }}
                          transition={{ duration: 0.45 }}
                        >
                          {booked[i] ? <CalendarCheck size={10} className="shrink-0" /> : null}
                          <span className="truncate">{booked[i] ? who : t("calendar.free")}</span>
                        </motion.span>
                      </li>
                    ))}
                  </ul>
                  <AnimatePresence>
                    {has("m3") ? <Note key="reminder" icon={Bell} text={t("toasts.reminder")} /> : null}
                  </AnimatePresence>
                </Card>
              ) : focus === "quote" ? (
                <Card label={t("labels.quotes")} icon={FileText}>
                  <p className="text-[12px] font-semibold text-[var(--color-ink)]">{t("quote.title")}</p>
                  <ul className="mt-2 space-y-1">
                    {quoteLines.map(([item, price], i) => (
                      <motion.li
                        key={item}
                        initial={reduce ? undefined : { opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.35 + 0.3 }}
                        className="flex items-center justify-between gap-2 text-[10.5px]"
                      >
                        <span className="truncate text-[var(--color-muted)]">{item}</span>
                        <span className="font-semibold tabular-nums text-[var(--color-ink)]">{price}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border)] pt-1.5 text-[11.5px] font-semibold text-[var(--color-ink)]">
                    <span>Total</span>
                    <span className="tabular-nums">{t("quote.total")}</span>
                  </div>
                  <AnimatePresence>
                    {has("m5") ? (
                      <motion.span
                        initial={reduce ? undefined : { opacity: 0, scale: 1.6, rotate: -14 }}
                        animate={{ opacity: 1, scale: 1, rotate: -8 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        className="absolute right-3 top-3 flex items-center gap-1 rounded-md border-2 border-[var(--color-success)] bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--color-success)]"
                      >
                        <Check size={10} strokeWidth={3} />
                        {t("quote.sent")}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </Card>
              ) : (
                <Card label={t("labels.web")} icon={Globe}>
                  <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                    <div className="flex items-center gap-1 bg-[var(--color-fog)] px-2 py-1.5">
                      {["#ff8a65", "#ffb020", "#4ade80"].map((c) => (
                        <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
                      ))}
                      <span className="ml-1.5 flex-1 truncate rounded-md bg-white px-1.5 py-0.5 text-[9px] text-[var(--color-muted)]">{t("site.url")}</span>
                    </div>
                    <div className="relative bg-gradient-to-br from-[#f3f0fc] via-[#ede7ff] to-[#ffe9df] px-3 pb-3 pt-4">
                      <p className="text-display text-[15px] font-semibold text-[var(--color-ink)]">{t("site.title")}</p>
                      <p className="text-[10px] text-[var(--color-muted)]">{t("site.tagline")}</p>
                      <motion.span
                        animate={has("web") && !reduce ? { scale: [1, 0.92, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2.5 inline-flex rounded-full bg-[var(--color-primary)] px-3 py-1 text-[10px] font-semibold text-white"
                      >
                        {t("site.button")}
                      </motion.span>
                      {has("cursor") && !has("web") ? (
                        <motion.span
                          className="absolute text-[var(--color-ink)]"
                          initial={{ left: 170, top: 70, opacity: 0 }}
                          animate={{ left: 52, top: 62, opacity: 1 }}
                          transition={{ duration: 0.7, ease }}
                        >
                          <MousePointer2 size={16} fill="white" />
                        </motion.span>
                      ) : null}
                    </div>
                  </div>
                  <AnimatePresence>
                    {has("web") ? <Note key="web" icon={Globe} text={t("toasts.web")} /> : null}
                  </AnimatePresence>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Everything the assistant does, and which one is on screen */}
          <div className="-mx-6 mt-4 flex items-center justify-center gap-1.5">
            {tabs.map(({ key, icon: Icon, label }) => (
              <span
                key={key}
                className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors duration-500 ${
                  focus === key ? "bg-[var(--color-primary)] text-white" : "bg-white/70 text-[var(--color-muted)]"
                }`}
              >
                <Icon size={11} />
                {label}
              </span>
            ))}
          </div>

          {/* Replies counter */}
          <div className="mt-3 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--color-success)] shadow-[0_12px_24px_-12px_rgba(27,23,48,0.4)]">
              <Check size={12} strokeWidth={3} />
              <motion.span key={answered} initial={reduce ? undefined : { y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="tabular-nums">
                {answered}
              </motion.span>
              {t("counter")}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function Card({ label, icon: Icon, children }: { label: string; icon: typeof Globe; children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-[var(--color-border)] bg-white p-3.5 shadow-[0_24px_44px_-26px_rgba(27,23,48,0.45)]">
      <p className="mb-2 flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
        <Icon size={11} />
        {label}
      </p>
      {children}
    </div>
  );
}

/** A line inside a card: what happened by itself (a reminder, a booking from the website). */
function Note({ icon: Icon, text }: { icon: typeof Bell; text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease }}
      className="overflow-hidden"
    >
      <span className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-[#e8f7ef] px-2 py-1.5 text-[10.5px] font-medium leading-snug text-[#15803d]">
        <Icon size={11} className="shrink-0" />
        {text}
      </span>
    </motion.p>
  );
}

function Toast({ icon: Icon, text }: { icon: typeof Bell; text: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.4, ease }}
      className="flex items-center gap-2 rounded-2xl bg-white p-2.5 shadow-[0_20px_36px_-22px_rgba(27,23,48,0.5)] ring-1 ring-[var(--color-border)]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
        <Icon size={13} />
      </span>
      <span className="text-[10.5px] font-medium leading-snug text-[var(--color-ink)]">{text}</span>
    </motion.div>
  );
}
