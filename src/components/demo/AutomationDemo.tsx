"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  User,
  FileCheck2,
  UserCheck,
  HelpCircle,
  Bell,
  Check,
  ArrowRight,
  ArrowDown,
  BatteryFull,
  CheckCheck,
  ChevronLeft,
  Mic,
  Phone,
  Signal,
  Wifi,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { AgentOrb } from "@/components/agent/AgentOrb";
import { useFormPrefill } from "@/lib/FormPrefillContext";

type Mode = "book" | "quote" | "ask" | "contact";
const modes: Mode[] = ["book", "quote", "ask", "contact"];

const serviceKeys = ["consult", "facial", "massage", "eyebrows"] as const;
const timeSlots = ["10:00", "12:30", "15:00", "17:30"] as const;
const questionKeys = ["hours", "location", "payment"] as const;

function getUpcomingDays(locale: string, count: number) {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const days: { iso: string; label: string }[] = [];
  const today = new Date();
  let added = 0;
  let offset = 1;
  while (added < count) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    offset += 1;
    if (date.getDay() === 0) continue;
    days.push({ iso: date.toISOString(), label: formatter.format(date) });
    added += 1;
  }
  return days;
}

export function AutomationDemo() {
  const t = useTranslations("demo");
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const { requestContact } = useFormPrefill();

  const [mode, setMode] = useState<Mode>("book");

  // book mode
  const [bookStep, setBookStep] = useState<"service" | "date" | "time" | "confirmed">("service");
  const [service, setService] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  // quote mode
  const [quoteStep, setQuoteStep] = useState<"need" | "details" | "sent">("need");
  const [quoteNeed, setQuoteNeed] = useState<string | null>(null);

  // ask mode
  const [question, setQuestion] = useState<string | null>(null);

  // contact mode
  const [contactStep, setContactStep] = useState<"form" | "saved">("form");
  const [contactName, setContactName] = useState("");

  const upcomingDays = useMemo(() => getUpcomingDays(locale, 4), [locale]);
  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }),
    [locale],
  );
  function formatTime(hhmm: string) {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return timeFormatter.format(d);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setBookStep("service");
    setService(null);
    setDate(null);
    setTime(null);
    setQuoteStep("need");
    setQuoteNeed(null);
    setQuestion(null);
    setContactStep("form");
    setContactName("");
  }

  const isComplete =
    (mode === "book" && bookStep === "confirmed") ||
    (mode === "quote" && quoteStep === "sent") ||
    (mode === "ask" && question !== null) ||
    (mode === "contact" && contactStep === "saved");

  // How many of the agent's tasks are finished at the current step, so the
  // checklist in the middle panel shows what the agent is doing as the user plays.
  const tasks = t.raw(`panorama.tasks.${mode}`) as string[];
  const doneCount = isComplete
    ? tasks.length
    : mode === "book"
      ? { service: 0, date: 1, time: 2, confirmed: 4 }[bookStep]
      : mode === "quote"
        ? { need: 0, details: 2, sent: 4 }[quoteStep]
        : mode === "contact" && contactName.trim().length > 0
          ? 1
          : 0;
  const isIdle = doneCount === 0;

  const statusLabel = isIdle
    ? t("panorama.idle")
    : t(`panorama.status.${mode}.${isComplete ? "done" : "working"}`);

  function goToForm() {
    requestContact({ solutionInterest: "aiAgent" });
  }

  return (
    <section id="demo" className="py-16 md:py-24">
      <Container>
        <SectionHeading align="center" title={t("title")} description={t("subtitle")} />

        <Reveal className="mt-10 flex flex-wrap justify-center gap-2">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              aria-pressed={mode === m}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                mode === m
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-primary)]"
              }`}
            >
              {t(`panorama.modes.${m}`)}
            </button>
          ))}
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="mx-auto grid max-w-[1080px] items-stretch gap-2 rounded-[var(--radius-card-lg)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4 lg:grid-cols-[320px_auto_1fr_auto_1fr] md:p-6">
            {/* Conversation panel, shown as a phone chat so visitors see exactly
                what their customers would see in their messaging app. */}
            <div className="mx-auto flex w-full max-w-[340px] flex-col">
              <StepLabel number={1} text={t("panorama.step1")} />
              <AnimatePresence>
                {isIdle && mode !== "contact" ? (
                  <motion.p
                    initial={shouldReduceMotion ? undefined : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-3 rounded-xl bg-[#fff3de] px-3 py-2 text-xs font-medium text-[#8a5a08]"
                  >
                    {t("panorama.hint")}
                  </motion.p>
                ) : null}
              </AnimatePresence>
              <PhoneFrame t={t} scrollKey={`${mode}-${bookStep}-${quoteStep}-${question}-${contactStep}`}>
                <AnimatePresence mode="wait">
                  {mode === "book" && (
                    <BookConversation
                      key="book"
                      t={t}
                      step={bookStep}
                      service={service}
                      date={date}
                      upcomingDays={upcomingDays}
                      formatTime={formatTime}
                      shouldReduceMotion={!!shouldReduceMotion}
                      onService={(key) => {
                        setService(key);
                        setBookStep("date");
                      }}
                      onDate={(iso) => {
                        setDate(iso);
                        setBookStep("time");
                      }}
                      onTime={(slot) => {
                        setTime(slot);
                        setBookStep("confirmed");
                      }}
                    />
                  )}
                  {mode === "quote" && (
                    <QuoteConversation
                      key="quote"
                      t={t}
                      step={quoteStep}
                      need={quoteNeed}
                      shouldReduceMotion={!!shouldReduceMotion}
                      onNeed={(key) => {
                        setQuoteNeed(key);
                        setQuoteStep("details");
                      }}
                      onDetails={() => setQuoteStep("sent")}
                    />
                  )}
                  {mode === "ask" && (
                    <AskConversation
                      key="ask"
                      t={t}
                      question={question}
                      shouldReduceMotion={!!shouldReduceMotion}
                      onQuestion={setQuestion}
                    />
                  )}
                  {mode === "contact" && (
                    <ContactConversation
                      key="contact"
                      t={t}
                      step={contactStep}
                      name={contactName}
                      shouldReduceMotion={!!shouldReduceMotion}
                      onNameChange={setContactName}
                      onSave={() => setContactStep("saved")}
                    />
                  )}
                </AnimatePresence>
              </PhoneFrame>
            </div>

            <FlowArrow />

            {/* Agent panel: introduces the orb as the business's AI assistant and
                ticks off each task it performs as the conversation advances. */}
            <div className="flex flex-col gap-3 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
              <StepLabel number={2} text={t("panorama.step2")} />
              <div className="flex flex-col items-center gap-2 text-center">
                <AgentOrb size={64} pulse={!isIdle} label={t("panorama.agentLabel")} />
                <p className="text-sm font-semibold text-[var(--color-ink)]">{t("panorama.agentTitle")}</p>
                <p className="text-xs leading-relaxed text-[var(--color-muted)]">{t("panorama.agentExplainer")}</p>
              </div>
              <div className="rounded-xl bg-[var(--color-surface-alt)] p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  {t("panorama.tasksLabel")}
                </p>
                <ul className="space-y-1.5">
                  {tasks.map((task, i) => {
                    const done = i < doneCount;
                    const current = i === doneCount && !isIdle;
                    return (
                      <li
                        key={task}
                        className={`flex items-start gap-2 text-xs transition-colors duration-300 ${
                          done ? "text-[var(--color-ink)]" : current ? "font-medium text-[var(--color-primary-hover)]" : "text-[var(--color-muted)]"
                        }`}
                      >
                        <span
                          className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                            done
                              ? "bg-[var(--color-success)] text-white"
                              : current
                                ? "border-2 border-[var(--color-primary)] border-t-transparent motion-safe:animate-spin"
                                : "border border-[var(--color-border)] bg-white"
                          }`}
                        >
                          {done ? <Check size={10} strokeWidth={3} /> : null}
                        </span>
                        {task}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <p className="text-center text-[11px] font-medium text-[var(--color-muted)]">{statusLabel}</p>
            </div>

            <FlowArrow />

            {/* Outcome panel */}
            <div className="flex min-h-[300px] flex-col justify-between rounded-[var(--radius-card)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)]">
              <StepLabel number={3} text={t("panorama.step3")} />
              <div className="flex-1">
                {mode === "book" && (
                  <OutcomeCalendar t={t} date={date} time={time} confirmed={bookStep === "confirmed"} />
                )}
                {mode === "quote" && <OutcomeQuote t={t} sent={quoteStep === "sent"} />}
                {mode === "ask" && <OutcomeAnswer t={t} question={question} />}
                {mode === "contact" && (
                  <OutcomeContact t={t} name={contactName} saved={contactStep === "saved"} />
                )}
              </div>

              <AnimatePresence>
                {isComplete ? (
                  <motion.div
                    initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 rounded-[var(--radius-input)] bg-[#fff3de] px-3 py-2 text-xs font-medium text-[#8a5a08]"
                  >
                    <Bell size={14} />
                    {t("panorama.teamNotified")}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence>
            {isComplete ? (
              <motion.div
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex flex-col items-center gap-3 text-center"
              >
                <p className="text-sm text-[var(--color-muted)]">{t("closingNote")}</p>
                <Button variant="primary" onClick={goToForm}>
                  {t("ctaAfter")}
                </Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </Reveal>
      </Container>
    </section>
  );
}

type TFn = (key: string, values?: Record<string, string | number>) => string;

function BookConversation({
  t,
  step,
  service,
  date,
  upcomingDays,
  formatTime,
  shouldReduceMotion,
  onService,
  onDate,
  onTime,
}: {
  t: TFn;
  step: "service" | "date" | "time" | "confirmed";
  service: string | null;
  date: string | null;
  upcomingDays: { iso: string; label: string }[];
  formatTime: (v: string) => string;
  shouldReduceMotion: boolean;
  onService: (key: string) => void;
  onDate: (iso: string) => void;
  onTime: (slot: string) => void;
}) {
  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2.5"
    >
      <BotBubble text={t("panorama.book.intro")} />
      {step === "service" && (
        <div className="flex flex-wrap gap-1.5">
          {serviceKeys.map((key) => (
            <Chip key={key} onClick={() => onService(key)}>
              {t(`booking.services.${key}`)}
            </Chip>
          ))}
        </div>
      )}
      {service && step !== "service" ? <UserBubble text={t(`booking.services.${service}`)} /> : null}
      {step === "date" && (
        <>
          <BotBubble text={t("booking.datePrompt")} />
          <div className="flex flex-wrap gap-1.5">
            {upcomingDays.map((day) => (
              <Chip key={day.iso} onClick={() => onDate(day.iso)}>
                <CalendarDays size={11} className="mr-1 inline" />
                {day.label}
              </Chip>
            ))}
          </div>
        </>
      )}
      {date && (step === "time" || step === "confirmed") ? (
        <UserBubble
          text={new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(date))}
        />
      ) : null}
      {step === "time" && (
        <>
          <BotBubble text={t("booking.timePrompt")} />
          <div className="flex flex-wrap gap-1.5">
            {timeSlots.map((slot) => (
              <Chip key={slot} onClick={() => onTime(slot)}>
                <Clock size={11} className="mr-1 inline" />
                {formatTime(slot)}
              </Chip>
            ))}
          </div>
        </>
      )}
      {step === "confirmed" ? <BotBubble text={t("booking.confirmation")} /> : null}
    </motion.div>
  );
}

function QuoteConversation({
  t,
  step,
  need,
  shouldReduceMotion,
  onNeed,
  onDetails,
}: {
  t: TFn;
  step: "need" | "details" | "sent";
  need: string | null;
  shouldReduceMotion: boolean;
  onNeed: (key: string) => void;
  onDetails: () => void;
}) {
  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2.5"
    >
      <BotBubble text={t("quoteFlow.needPrompt")} />
      {step === "need" && (
        <div className="flex flex-wrap gap-1.5">
          {serviceKeys.map((key) => (
            <Chip key={key} onClick={() => onNeed(key)}>
              {t(`booking.services.${key}`)}
            </Chip>
          ))}
        </div>
      )}
      {step !== "need" && need ? (
        <>
          <UserBubble text={t(`booking.services.${need}`)} />
          <BotBubble text={t("quoteFlow.detailsPrompt")} />
        </>
      ) : null}
      {step === "details" ? (
        <Chip onClick={onDetails}>{t("quoteFlow.submit")}</Chip>
      ) : null}
      {step === "sent" ? <BotBubble text={t("quoteFlow.sentTitle")} /> : null}
    </motion.div>
  );
}

function AskConversation({
  t,
  question,
  shouldReduceMotion,
  onQuestion,
}: {
  t: TFn;
  question: string | null;
  shouldReduceMotion: boolean;
  onQuestion: (key: string) => void;
}) {
  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2.5"
    >
      <BotBubble text={t("panorama.ask.intro")} />
      {!question ? (
        <div className="flex flex-wrap gap-1.5">
          {questionKeys.map((key) => (
            <Chip key={key} onClick={() => onQuestion(key)}>
              {t(`panorama.ask.questions.${key}`)}
            </Chip>
          ))}
        </div>
      ) : (
        <>
          <UserBubble text={t(`panorama.ask.questions.${question}`)} />
          <BotBubble text={t(`panorama.ask.answers.${question}`)} />
        </>
      )}
    </motion.div>
  );
}

function ContactConversation({
  t,
  step,
  name,
  shouldReduceMotion,
  onNameChange,
  onSave,
}: {
  t: TFn;
  step: "form" | "saved";
  name: string;
  shouldReduceMotion: boolean;
  onNameChange: (v: string) => void;
  onSave: () => void;
}) {
  return (
    <motion.div
      initial={shouldReduceMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2.5"
    >
      <BotBubble text={t("panorama.contact.intro")} />
      {step === "form" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 bg-white px-3 py-2">
            <User size={13} className="text-[var(--color-muted)]" />
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("booking.namePlaceholder")}
              className="w-full bg-transparent text-xs text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
            />
          </div>
          <Chip onClick={onSave} disabled={name.trim().length === 0}>
            {t("panorama.contact.save")}
          </Chip>
        </div>
      ) : (
        <>
          <UserBubble text={name} />
          <BotBubble text={t("panorama.contact.saved")} />
        </>
      )}
    </motion.div>
  );
}

function OutcomeCalendar({
  t,
  date,
  time,
  confirmed,
}: {
  t: TFn;
  date: string | null;
  time: string | null;
  confirmed: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${
          confirmed ? "bg-[var(--color-surface-alt)] text-[var(--color-success)]" : "bg-[var(--color-surface-alt)] text-[var(--color-muted)]"
        }`}
      >
        {confirmed ? <CheckCircle2 size={20} /> : <CalendarDays size={20} />}
      </span>
      <p className="text-xs font-semibold text-[var(--color-ink)]">
        {confirmed ? t("booking.confirmation") : t("panorama.awaiting")}
      </p>
      {date && time ? (
        <p className="text-[11px] text-[var(--color-muted)]">
          {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(date))} ·{" "}
          {time}
        </p>
      ) : null}
    </div>
  );
}

function OutcomeQuote({ t, sent }: { t: TFn; sent: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${
          sent ? "bg-[#fff3de] text-[#8a5a08]" : "bg-[var(--color-surface-alt)] text-[var(--color-muted)]"
        }`}
      >
        <FileCheck2 size={20} />
      </span>
      <p className="text-xs font-semibold text-[var(--color-ink)]">
        {sent ? t("quoteFlow.sentTitle") : t("panorama.awaiting")}
      </p>
      {sent ? <p className="text-[11px] text-[var(--color-muted)]">{t("quoteFlow.sentNote")}</p> : null}
    </div>
  );
}

function OutcomeAnswer({ t, question }: { t: TFn; question: string | null }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${
          question ? "bg-[#fff3de] text-[#8a5a08]" : "bg-[var(--color-surface-alt)] text-[var(--color-muted)]"
        }`}
      >
        <HelpCircle size={20} />
      </span>
      <p className="text-xs font-semibold text-[var(--color-ink)]">
        {question ? t("panorama.ask.resolved") : t("panorama.awaiting")}
      </p>
    </div>
  );
}

function OutcomeContact({ t, name, saved }: { t: TFn; name: string; saved: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full ${
          saved ? "bg-[#fff3de] text-[#8a5a08]" : "bg-[var(--color-surface-alt)] text-[var(--color-muted)]"
        }`}
      >
        <UserCheck size={20} />
      </span>
      <p className="text-xs font-semibold text-[var(--color-ink)]">
        {saved ? t("panorama.contact.saved") : t("panorama.awaiting")}
      </p>
      {saved ? <p className="text-[11px] text-[var(--color-muted)]">{name}</p> : null}
    </div>
  );
}

function StepLabel({ number, text }: { number: number; text: string }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
        {number}
      </span>
      {text}
    </p>
  );
}

// Points right between panels on desktop and down when they stack on mobile.
function FlowArrow() {
  return (
    <div aria-hidden="true" className="flex items-center justify-center py-1 text-[var(--color-primary)] lg:py-0">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        <ArrowDown size={16} className="lg:hidden" />
        <ArrowRight size={16} className="hidden lg:block" />
      </span>
    </div>
  );
}

// Fixed demo clock; a live time would differ between server and client render.
const CHAT_TIME = "9:41";

function PhoneFrame({ t, scrollKey, children }: { t: TFn; scrollKey: string; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the conversation grows, like a real chat.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const id = window.setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }), 80);
    return () => window.clearTimeout(id);
  }, [scrollKey]);

  return (
    <div className="relative mx-auto flex h-[520px] w-full flex-col overflow-hidden rounded-[40px] border-[8px] border-[#1b1730] bg-[#1b1730] shadow-[var(--shadow-float)]">
      {/* Status bar with notch */}
      <div className="relative flex items-center justify-between bg-white px-5 pb-1 pt-2 text-[11px] font-semibold text-[var(--color-ink)]">
        <span>{CHAT_TIME}</span>
        <span aria-hidden="true" className="absolute left-1/2 top-1.5 h-5 w-20 -translate-x-1/2 rounded-full bg-[#1b1730]" />
        <span className="flex items-center gap-1">
          <Signal size={11} />
          <Wifi size={11} />
          <BatteryFull size={13} />
        </span>
      </div>

      {/* Chat header */}
      <div className="flex items-center gap-2.5 border-b border-black/5 bg-white px-3 py-2">
        <ChevronLeft size={18} className="text-[var(--color-primary)]" />
        <AgentOrb size={32} label={t("panorama.agentLabel")} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{t("panorama.phone.businessName")}</p>
          <p className="flex items-center gap-1 text-[11px] text-[var(--color-success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
            {t("panorama.phone.online")}
          </p>
        </div>
        <Phone size={16} className="text-[var(--color-primary)]" />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-[#efeae2] px-3 py-3"
        style={{
          backgroundImage: "radial-gradient(rgba(27,23,48,0.05) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      >
        {children}
      </div>

      {/* Composer (decorative) */}
      <div aria-hidden="true" className="flex items-center gap-2 bg-[#f6f5f3] px-3 py-2.5">
        <span className="flex-1 rounded-full bg-white px-3 py-2 text-xs text-[var(--color-muted)]">
          {t("panorama.phone.typeMessage")}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
          <Mic size={14} />
        </span>
      </div>
    </div>
  );
}

function BotBubble({ text }: { text: string }) {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[13px] leading-snug text-[var(--color-ink)] shadow-[0_1px_1px_rgba(0,0,0,0.08)]">
      {text}
      <span className="ml-2 inline-block translate-y-0.5 text-[10px] text-[var(--color-muted)]">{CHAT_TIME}</span>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-3 py-2 text-[13px] leading-snug text-[var(--color-ink)] shadow-[0_1px_1px_rgba(0,0,0,0.08)]">
      {text}
      <span className="ml-2 inline-flex translate-y-0.5 items-center gap-0.5 text-[10px] text-[var(--color-muted)]">
        {CHAT_TIME}
        <CheckCheck size={12} className="text-[#34b7f1]" />
      </span>
    </div>
  );
}

function Chip({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-[var(--color-primary)]/30 bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-primary-hover)] shadow-[0_1px_1px_rgba(0,0,0,0.06)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
    >
      {children}
    </button>
  );
}
