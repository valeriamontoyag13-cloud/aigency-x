"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  Check,
  Clock,
  Coffee,
  CreditCard,
  Hand,
  Info,
  MessageCircle,
  Moon,
  Pencil,
  RefreshCcw,
  RotateCcw,
  Send,
  Smartphone,
  Timer,
  Trophy,
} from "lucide-react";
import { demoBusinesses } from "@/content/demoBusinesses";
import { buildMoments, type AssistantState, type MomentsInput, type Step } from "@/content/demoMoments";
import { formatMoney } from "@/lib/currency";

/**
 * The demo in Spanish, in the guided design: the moments of demo-citas
 * (content/demoMoments.ts) told step by step, with the phone on the left and
 * the guide on the right. The chat is always open: whatever the visitor
 * writes goes to the real assistant in n8n (api/demo-chat → "Demo web ·
 * Asistente"), which knows the business and the booking of the moment.
 */

type Message = {
  /** "me": whoever holds the phone (right side); "biz": the business (assistant or owner). */
  from: "me" | "biz" | "sys" | "time" | "receipt";
  text: string;
  by?: string;
  live?: boolean;
};

const momentIcons = [MessageCircle, Moon, CreditCard, RefreshCcw, BellRing, Hand, Coffee];
const ease = [0.22, 1, 0.36, 1] as const;
const MS_PER_WORD = 400;
const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const typingTime = (text: string) => clamp(1200 + text.length * 10, 1500, 3200);

/** Starts counting: the returned function says how many whole seconds went by (at least 1). */
function stopwatch() {
  const start = performance.now();
  return () => Math.max(1, Math.round((performance.now() - start) / 1000));
}

/** A chat id for the real assistant; each moment adds its number, so every client has their own chat. */
function newSession() {
  return `demo-${Math.random().toString(36).slice(2, 12).padEnd(8, "0")}`;
}

/** The visitor's business as the real assistant in n8n reads it. */
function assistantBusiness(demo: MomentsInput) {
  const { assistant, texts } = demoBusinesses[demo.key];
  return {
    nombre: demo.name.slice(0, 40),
    rubro: (demo.custom || assistant.kind).slice(0, 40),
    duena: (demo.owner || assistant.owner).slice(0, 20),
    direccion: demo.address ?? "",
    a_domicilio: false,
    profesional: assistant.pro,
    profesionales: assistant.team,
    horario: texts.es.hours,
    horas: assistant.hours,
    zona: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Santiago",
    moneda: demo.currency,
    servicios: demo.services.map((s) => ({ nombre: s.name, precio: s.amount })),
    necesidades: demo.pains,
    por_evento: false,
  };
}

/** The steps the story takes when the visitor always picks the suggested answer. */
function defaultPath(queue: Step[]) {
  const path: Step[] = [];
  const rest = [...queue];
  while (rest.length) {
    const step = rest.shift() as Step;
    path.push(step);
    if (step.k === "choose") rest.unshift(...step.options[0].then);
  }
  return path;
}
const isTap = (step: Step) => step.k === "send" || step.k === "choose" || step.k === "next";

/** The chat after playing the rest of the moment with the suggested answers. */
function playOut(queue: Step[], log: Message[], owner: boolean) {
  let current = [...log];
  let view = owner;
  let state: AssistantState | null | undefined;
  for (const step of defaultPath(queue)) {
    if (step.k === "scene") {
      view = step.owner;
      current = [];
    } else if (step.k === "state") state = step.state;
    else if (step.k === "time" || step.k === "sys") current.push({ from: step.k, text: step.text });
    else if (step.k === "bot") current.push({ from: "biz", text: step.text, by: step.by });
    else if (step.k === "send") current.push({ from: "me", text: step.text });
    else if (step.k === "choose") current.push({ from: "me", text: step.options[0].label });
    else if (step.k === "receipt") current.push({ from: "receipt", text: step.amount });
  }
  return { log: current, owner: view, state };
}

/** WhatsApp's *bold* and _italics_. */
function rich(text: string): ReactNode {
  return text.split(/(\*[^*\n]+\*|_[^_\n]+_)/g).map((part, i) =>
    /^\*[^*]+\*$/.test(part) ? (
      <strong key={i}>{part.slice(1, -1)}</strong>
    ) : /^_[^_]+_$/.test(part) ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function DemoMomentsStage({
  demo,
  onEdit,
  onQuote,
  whatsappHref,
}: {
  demo: MomentsInput;
  onEdit: () => void;
  onQuote: () => void;
  whatsappHref: string;
}) {
  const t = useTranslations("myDemo");
  const reduce = useReducedMotion();
  const moments = useMemo(() => buildMoments(demo), [demo]);
  const sample = demoBusinesses[demo.key];
  const owner = demo.owner || sample.assistant.owner;

  const [index, setIndex] = useState(0);
  const [queue, setQueue] = useState<Step[]>(() => moments[0].steps);
  const [log, setLog] = useState<Message[]>([]);
  const [ownerView, setOwnerView] = useState(false);
  const [taps, setTaps] = useState(0);
  const [run, setRun] = useState(0);
  const [typing, setTyping] = useState(false);
  const [asking, setAsking] = useState(false);
  // The visitor wrote in the middle of a moment: the story waits for their tap.
  const [paused, setPaused] = useState(false);
  const [watched, setWatched] = useState<number[]>([]);
  const [draft, setDraft] = useState("");
  // The real assistant: one chat per moment, and what it knows in each one.
  const [session] = useState(newSession);
  const [seed, setSeed] = useState<AssistantState | null>(null);
  const [aiStates, setAiStates] = useState<Record<number, unknown>>({});
  const [replySeconds, setReplySeconds] = useState<number | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const taken = useRef<Step | null>(null);

  const moment = moments[index];
  const head = queue[0];
  const waitingTap = !!head && isTap(head) && !typing;
  const repliedLive = log.some((m) => m.live && m.from === "biz");
  const done = moment.open ? repliedLive : !head && !typing;
  const nextMoment = moments.find((m, i) => i > index && !watched.includes(m.id)) ?? moments.find((m, i) => i < index && !watched.includes(m.id));
  const savedMinutes = moments.filter((m) => watched.includes(m.id) || (m.id === moment.id && done)).reduce((sum, m) => sum + m.minutes, 0);
  const totalTaps = taps + defaultPath(queue).filter(isTap).length;
  const lastBiz = [...log].reverse().find((m) => m.from === "biz");
  const tapLabel = head?.k === "send" ? head.text : head?.k === "choose" ? head.options[0].label : head?.k === "next" ? head.label : "";
  const waitMs = clamp(5000 + words(`${moment.title} ${moment.text} ${lastBiz?.text ?? ""} ${tapLabel}`) * MS_PER_WORD, 12000, 30000);

  function push(message: Message) {
    setLog((list) => [...list, message]);
  }

  // Plays the moment: the business "types" before each message; taps wait for the visitor
  // and, once there was time to read, the story goes on with the suggested answer.
  useEffect(() => {
    if (!head || asking) return;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, reduce ? 0 : ms));
    const pop = () => setQueue((q) => q.slice(1));
    switch (head.k) {
      case "time":
      case "sys":
        later(head.k === "sys" ? 700 : 400, () => {
          push({ from: head.k, text: head.text });
          pop();
        });
        break;
      case "scene":
        later(300, () => {
          setOwnerView(head.owner);
          setLog([]);
          pop();
        });
        break;
      case "state":
        later(0, () => {
          setSeed(head.state);
          pop();
        });
        break;
      case "receipt":
        later(400, () => {
          push({ from: "receipt", text: head.amount });
          pop();
        });
        break;
      case "bot":
        later(500, () => setTyping(true));
        later(500 + typingTime(head.text), () => {
          setTyping(false);
          push({ from: "biz", text: head.text, by: head.by });
          pop();
        });
        break;
      default:
        if (!paused && !reduce) later(waitMs, () => take(0));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
    // Runs once per step: `head` changes with every step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [head, asking, paused, run]);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setWatched((list) => (list.includes(moment.id) ? list : [...list, moment.id])), 0);
    return () => window.clearTimeout(timer);
  }, [done, moment.id]);

  useEffect(() => {
    const chat = chatRef.current;
    if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [log.length, typing, head, reduce]);

  useEffect(() => {
    const bar = tabsRef.current;
    const tab = bar?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!bar || !tab) return;
    bar.scrollTo({ left: Math.max(0, tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2), behavior: reduce ? "auto" : "smooth" });
  }, [index, reduce]);

  /** The visitor's tap: sends the client's message, picks an answer or moves the story ahead. */
  function take(option: number) {
    if (!head || !isTap(head) || taken.current === head) return;
    taken.current = head;
    if (head.k === "send") {
      push({ from: "me", text: head.text });
      setQueue((q) => q.slice(1));
    } else if (head.k === "choose") {
      const picked = head.options[option] ?? head.options[0];
      push({ from: "me", text: picked.label });
      setQueue((q) => [...picked.then, ...q.slice(1)]);
    } else {
      setQueue((q) => q.slice(1));
    }
    setTaps((n) => n + 1);
    setPaused(false);
  }

  function begin(i: number) {
    setIndex(i);
    setQueue(moments[i].steps);
    setLog([]);
    setOwnerView(false);
    setTaps(0);
    setTyping(false);
    setPaused(false);
    setSeed(null);
    setDraft("");
    taken.current = null;
    setRun((r) => r + 1);
    if (window.innerWidth < 1024) {
      window.setTimeout(() => stageRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 200);
    }
  }

  function skip() {
    const end = playOut(queue, log, ownerView);
    setLog(end.log);
    setOwnerView(end.owner);
    if (end.state !== undefined) setSeed(end.state);
    setTaps((n) => n + defaultPath(queue).filter(isTap).length);
    setQueue([]);
    setTyping(false);
  }

  /** The real assistant's answer; null when it can't answer (n8n off or too slow). */
  async function askAssistant(text: string) {
    try {
      const response = await fetch("/api/demo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(58_000),
        body: JSON.stringify({
          sessionId: `${session}${moment.id}`,
          mensaje: text,
          negocio: assistantBusiness(demo),
          estado: aiStates[moment.id] ?? seed,
        }),
      });
      const data = response.ok ? ((await response.json()) as { respuesta?: string; estado?: unknown }) : null;
      if (!data?.respuesta) return null;
      if (data.estado) setAiStates((states) => ({ ...states, [moment.id]: data.estado }));
      return data.respuesta;
    } catch {
      return null;
    }
  }

  /** Prepared replies (or Claude, when it's set up) with the visitor's business, while the real assistant is off. */
  async function askBackup(text: string) {
    const conversation = [...log.filter((m) => m.from === "me" || m.from === "biz"), { from: "me", text }].slice(-20);
    try {
      const response = await fetch("/api/demo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: demo.key,
          custom: demo.custom,
          name: demo.name,
          address: demo.address ?? "",
          currency: demo.currency,
          services: demo.services.map((s) => ({ name: s.name, price: formatMoney(s.amount, demo.currency), amount: s.amount })),
          combine: true,
          slots: sample.texts.es.slots,
          unit: "hora",
          locale: "es",
          messages: conversation.map((m) => ({ role: m.from === "me" ? "user" : "assistant", text: m.text.slice(0, 800) })),
        }),
      });
      if (!response.ok) return null;
      return ((await response.json()) as { text: string }).text;
    } catch {
      return null;
    }
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || asking || ownerView) return;
    setDraft("");
    setPaused(true);
    push({ from: "me", text: clean, live: true });
    setAsking(true);
    setTyping(true);
    const seconds = stopwatch();
    const real = await askAssistant(clean);
    if (real) setReplySeconds(seconds());
    const answer = real ?? (await askBackup(clean)) ?? t("error");
    setTyping(false);
    setAsking(false);
    push({ from: "biz", text: answer, live: true });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  const gains = Array.from(new Set(moments.filter((m) => watched.includes(m.id) || (m.id === moment.id && done)).flatMap((m) => m.gains)));
  const MomentIcon = momentIcons[moment.id];

  return (
    <motion.div
      key="stage-moments"
      initial={reduce ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease }}
      className="overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(27,23,48,0.05)]"
    >
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a57bff] to-[#7c4dff] text-xl">
            {sample.emoji}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[17px] font-semibold text-[var(--color-ink)]">
              <span className="truncate">{demo.name}</span>
              <button
                type="button"
                onClick={onEdit}
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[12.5px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
              >
                <Pencil size={12} />
                {t("edit")}
              </button>
            </p>
            <p className="text-[13.5px] leading-snug text-[var(--color-muted)]">{t("stageText")}</p>
          </div>
        </div>
      </div>

      <div ref={stageRef} className="grid scroll-mt-20 grid-cols-[minmax(0,1fr)] lg:grid-cols-[400px_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        {/* Every moment of the demo, always in sight: above the phone on a phone, above the guide on a computer */}
        {moments.length > 1 ? (
          <nav aria-label="Momentos de la demo" className="min-w-0 px-4 pt-4 md:px-6 lg:col-start-2 lg:row-start-1 lg:border-l lg:border-[var(--color-border)] lg:pt-6">
            <div className="rounded-[20px] bg-[var(--color-primary-soft)] p-3 md:p-4">
              <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-1">
                <span className="text-[12.5px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  {`Tu demo tiene ${moments.length} momentos`}
                </span>
                <span className="text-[13px] text-[var(--color-muted)]">
                  Toca cualquiera para verlo, en el orden que quieras.
                </span>
              </p>
              <div
                ref={tabsRef}
                role="tablist"
                className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto scroll-smooth px-1 pb-0.5 [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden"
              >
                {moments.map((m, i) => {
                  const on = i === index;
                  const seen = watched.includes(m.id) && !on;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => (on ? undefined : begin(i))}
                      className={`relative flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-3.5 text-[13.5px] font-semibold transition-colors ${
                        on
                          ? "text-white"
                          : "bg-white text-[var(--color-ink)] shadow-[0_1px_2px_rgba(27,23,48,0.08)] ring-1 ring-[var(--color-border)] hover:text-[var(--color-primary)] hover:ring-[var(--color-primary)]/40"
                      }`}
                    >
                      {on ? (
                        <motion.span
                          layoutId="demo-moment-tab"
                          className="absolute inset-0 rounded-full bg-[var(--color-primary)] shadow-[0_6px_16px_-6px_rgba(124,77,255,0.8)]"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span
                        className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                          on ? "bg-white text-[var(--color-primary)]" : seen ? "bg-[#e8f7ef] text-[var(--color-success)]" : "bg-[var(--color-mist)] text-[var(--color-ink)]"
                        }`}
                      >
                        {seen ? <Check size={13} strokeWidth={3} /> : i + 1}
                      </span>
                      <span className="relative">{m.tab}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        ) : null}

        {/* What the client (or the owner) sees */}
        <div
          className="flex min-w-0 flex-col items-center px-4 py-4 md:px-6 md:py-5 lg:col-start-1 lg:row-span-2 lg:row-start-1"
          style={{
            background: "radial-gradient(90% 80% at 80% 10%, color-mix(in srgb, #7c4dff 30%, transparent), transparent 65%), #f1ebff",
            perspective: 1400,
          }}
        >
          <p className="mb-2 hidden items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-primary)] sm:flex">
            <Smartphone size={14} />
            {ownerView ? `Lo que ve ${owner}` : t("clientSees")}
          </p>
          <motion.div
            className="w-full max-w-[360px]"
            initial={reduce ? undefined : { opacity: 0, rotateX: 70, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease }}
            style={{ transformOrigin: "bottom center" }}
          >
            <div className="flex flex-col overflow-hidden rounded-[28px] border-[7px] border-[var(--color-ink)] bg-[#efeae2] shadow-[0_30px_60px_-30px_rgba(27,23,48,0.5)]">
              <div className="flex items-center gap-2.5 bg-white px-4 py-2.5">
                {ownerView ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-ink)] text-[11px] font-bold text-white">AX</span>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#a57bff] to-[#7c4dff] text-sm">
                    {sample.emoji}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold leading-tight text-[var(--color-ink)]">
                    {ownerView ? `Asistente · ${demo.name}` : demo.name}
                  </p>
                  <p className="text-xs text-[var(--color-success)]">{ownerView ? `solo para ${owner}` : typing ? t("typing") : t("online")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => begin(index)}
                  aria-label={t("replay")}
                  className="ml-auto cursor-pointer rounded-full p-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                >
                  <RotateCcw size={15} />
                </button>
              </div>

              <p className="flex items-center justify-center gap-1.5 border-t border-[var(--color-border)] bg-[var(--color-primary-soft)] px-3 py-1.5 text-center text-[12px] font-medium leading-snug text-[var(--color-primary)]">
                <Info size={13} className="shrink-0" />
                {t("demoNote")}
              </p>
              <div ref={chatRef} className="flex h-[300px] flex-col gap-2 overflow-y-auto px-3 py-3 sm:h-[360px] lg:h-[420px]" aria-live="polite">
                <div className="flex-1" />
                {log.map((message, i) => (
                  <Bubble key={`${run}-${i}`} message={message} business={demo.name} />
                ))}
                <AnimatePresence>
                  {typing ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex w-fit gap-1 rounded-2xl rounded-tl-sm bg-white px-3.5 py-3"
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
                {/* The answers the person holding the phone can tap */}
                {waitingTap && head?.k === "choose" ? (
                  <div className="ml-auto flex max-w-[92%] flex-wrap justify-end gap-1.5">
                    {head.options.map((o, i) => (
                      <motion.button
                        key={o.label}
                        type="button"
                        onClick={() => take(i)}
                        animate={i === 0 && !reduce ? { scale: [1, 1.05, 1] } : undefined}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className={`cursor-pointer rounded-full px-3 py-1.5 text-[13.5px] font-semibold transition-colors ${
                          i === 0
                            ? "bg-[var(--color-primary)] text-white shadow-[0_0_0_4px_rgba(124,77,255,0.25)]"
                            : "bg-white text-[var(--color-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-[var(--color-primary)]/30 hover:bg-[var(--color-primary-soft)]"
                        }`}
                      >
                        {i === 0 ? "👆 " : ""}
                        {o.label}
                      </motion.button>
                    ))}
                  </div>
                ) : null}
                {waitingTap && head?.k === "next" ? (
                  <button
                    type="button"
                    onClick={() => take(0)}
                    className="mx-auto my-1 flex cursor-pointer items-center gap-1 rounded-full bg-[var(--color-ink)] px-3.5 py-1.5 text-[12.5px] font-semibold text-white"
                  >
                    {head.label} <ArrowRight size={13} />
                  </button>
                ) : null}
              </div>

              {waitingTap && head?.k === "send" ? (
                <div className="px-3 pb-2">
                  <motion.button
                    type="button"
                    onClick={() => take(0)}
                    animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="ml-auto flex max-w-[92%] cursor-pointer items-center gap-1.5 rounded-2xl bg-[var(--color-primary)] px-3.5 py-2 text-left text-[14px] font-semibold leading-snug text-white shadow-[0_0_0_4px_rgba(124,77,255,0.25)]"
                  >
                    <span aria-hidden="true">👆</span>
                    {head.text}
                  </motion.button>
                </div>
              ) : null}

              {moment.open && !asking && moment.tries ? (
                <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {moment.tries.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="shrink-0 cursor-pointer rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-primary)] shadow-[0_1px_1px_rgba(0,0,0,0.06)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Always open: the real assistant answers what the visitor writes */}
              <form onSubmit={onSubmit} className="flex items-center gap-2 bg-[#f6f3ee] px-3 py-2.5">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={ownerView || asking}
                  maxLength={400}
                  placeholder={ownerView ? `Este es el WhatsApp de ${owner}` : "Escríbele tú: responde la IA"}
                  aria-label={t("placeholder")}
                  className={`min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-[15px] text-[var(--color-ink)] outline-none transition-shadow placeholder:text-[var(--color-muted)] disabled:cursor-not-allowed ${
                    moment.open && !repliedLive ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[#f6f3ee]" : ""
                  }`}
                />
                <button
                  type="submit"
                  disabled={ownerView || asking || !draft.trim()}
                  aria-label={t("send")}
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* The guide: what's happening, one tap at a time */}
        <div className="flex min-w-0 flex-col gap-4 border-t border-[var(--color-border)] p-4 md:p-6 lg:col-start-2 lg:row-start-2 lg:border-l lg:border-t-0 lg:pt-5">
          {!done ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-semibold text-[var(--color-primary)]">
                  {`Momento ${index + 1} de ${moments.length}`}
                  {moment.open ? "" : ` · Paso ${Math.min(taps + 1, Math.max(1, totalTaps))} de ${Math.max(1, totalTaps)}`}
                </p>
                {moment.open ? null : (
                  <button
                    type="button"
                    onClick={skip}
                    className="cursor-pointer rounded-full px-2.5 py-1 text-[12.5px] font-medium text-[var(--color-muted)] hover:bg-[var(--color-mist)] hover:text-[var(--color-ink)]"
                  >
                    {t("skipToSummary")}
                  </button>
                )}
              </div>
              {moment.open ? null : (
                <div className="flex gap-1.5" aria-hidden="true">
                  {Array.from({ length: Math.max(1, totalTaps) }).map((_, i) => (
                    <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-mist)]">
                      <motion.span
                        className="block h-full rounded-full bg-[var(--color-primary)]"
                        initial={false}
                        animate={{ width: i < taps ? "100%" : "0%" }}
                        transition={{ duration: 0.4 }}
                      />
                    </span>
                  ))}
                </div>
              )}

              <div className="rounded-[22px] bg-[var(--color-fog)] p-5 ring-1 ring-[var(--color-border)] md:p-6">
                <p className="flex w-fit items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[12px] font-semibold text-[var(--color-primary)]">
                  <MomentIcon size={13} />
                  {moment.tag}
                </p>
                <p className="text-display mt-2 text-[1.35rem] font-semibold leading-tight text-[var(--color-ink)] md:text-[1.6rem]">{moment.title}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]">{moment.text}</p>

                {moment.open ? (
                  <div className="mt-4">
                    <p className="text-[13px] font-semibold text-[var(--color-muted)]">Pregúntale, por ejemplo:</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {(moment.tries ?? []).map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={asking}
                          onClick={() => void send(s)}
                          className="cursor-pointer rounded-full border border-[var(--color-primary)]/30 bg-white px-3.5 py-2 text-[14px] font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-soft)] disabled:opacity-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 flex items-start gap-2 text-[13.5px] leading-snug text-[var(--color-muted)]">
                      <MessageCircle size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />O escribe lo que quieras en el chat: te responde la IA, con tus
                      servicios y tus precios. Puede tardar unos segundos.
                    </p>
                    {asking ? <Thinking /> : null}
                    {nextMoment ? (
                      <button
                        type="button"
                        onClick={() => begin(moments.indexOf(nextMoment))}
                        className="mt-4 flex cursor-pointer items-center gap-1.5 text-[14px] font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        O mira el siguiente momento: {nextMoment.tab}
                        <ArrowRight size={15} />
                      </button>
                    ) : null}
                  </div>
                ) : waitingTap && head ? (
                  <>
                    <motion.button
                      key={`${run}-${taps}`}
                      type="button"
                      onClick={() => take(0)}
                      whileTap={{ scale: 0.97 }}
                      className="relative mt-5 flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl bg-[var(--color-primary)] px-4 py-3.5 text-left text-white shadow-[0_14px_30px_-12px_rgba(124,77,255,0.9)]"
                    >
                      {paused ? null : (
                        <motion.span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 bg-white/15"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: waitMs / 1000, ease: "linear" }}
                        />
                      )}
                      <motion.span
                        aria-hidden="true"
                        className="relative text-2xl"
                        animate={reduce ? undefined : { y: [0, -4, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity }}
                      >
                        {head.k === "next" ? "⏭️" : "👆"}
                      </motion.span>
                      <span className="relative min-w-0">
                        <span className="block text-[12px] font-semibold uppercase tracking-wider text-white/80">
                          {head.k === "next"
                            ? "Sigue la historia"
                            : ownerView
                              ? `Responde como ${owner}`
                              : head.k === "send"
                                ? t("sendAsClient")
                                : "Responde como tu cliente"}
                        </span>
                        <span className="block text-[16px] font-semibold leading-snug">«{tapLabel}»</span>
                      </span>
                      <ArrowRight size={20} className="relative ml-auto shrink-0" />
                    </motion.button>
                    {head.k === "choose" && head.options.length > 1 ? (
                      <div className="mt-3">
                        <p className="text-[13px] font-semibold text-[var(--color-muted)]">{t("orAnswer")}</p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {head.options.slice(1).map((o, i) => (
                            <button
                              key={o.label}
                              type="button"
                              onClick={() => take(i + 1)}
                              className="cursor-pointer rounded-full border border-[var(--color-primary)]/30 bg-white px-3.5 py-2 text-[14px] font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-soft)]"
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <p className="mt-3 text-center text-[12.5px] text-[var(--color-muted)]">
                      {paused ? "La historia te espera: sigue cuando quieras." : t("autoNote")}
                    </p>
                  </>
                ) : (
                  <Thinking label={asking || typing ? t("guideTyping") : "Mira lo que pasa en el chat…"} />
                )}
              </div>

              {moment.open || ownerView ? null : (
                <p className="flex items-start gap-2 text-[13.5px] leading-snug text-[var(--color-muted)]">
                  <MessageCircle size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                  {moment.holder}. También puedes escribirle tú en el chat cuando quieras: te responde el asistente real.
                </p>
              )}
              {replySeconds !== null && repliedLive ? <ReplyTime seconds={replySeconds} /> : null}
              <details className="group rounded-2xl bg-white px-4 py-3 ring-1 ring-[var(--color-border)]">
                <summary className="cursor-pointer list-none text-[14px] font-semibold text-[var(--color-ink)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Info size={15} className="text-[var(--color-primary)]" />
                    ¿Cómo funciona por dentro?
                  </span>
                </summary>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-muted)]">{moment.behind}</p>
              </details>
            </>
          ) : (
            /* End of a moment: what the business gained, then the next moment or the next step */
            <motion.div
              key={`summary-${run}`}
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="flex flex-col gap-4"
            >
              <div>
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-success)]">
                  <Trophy size={15} />
                  {moment.tag}
                </p>
                <p className="text-display mt-1 text-[1.5rem] font-semibold leading-tight text-[var(--color-ink)] md:text-[1.8rem]">
                  {t(nextMoment ? "summaryTitle" : "summaryAllTitle", { name: demo.name })}
                </p>
                <p className="mt-1 text-[15px] text-[var(--color-muted)]">{t("summaryText")}</p>
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {(nextMoment ? moment.gains : gains).map((result, i) => (
                  <motion.li
                    key={result}
                    initial={reduce ? undefined : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-2.5 rounded-2xl bg-[var(--color-fog)] p-3 text-[14.5px] font-medium leading-snug text-[var(--color-ink)] ring-1 ring-[var(--color-border)]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f7ef] text-[var(--color-success)]">
                      <Check size={14} strokeWidth={3} />
                    </span>
                    {result}
                  </motion.li>
                ))}
              </ul>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl bg-[var(--color-primary-soft)] px-4 py-3 text-[15px] font-semibold text-[var(--color-primary)]">
                <Clock size={17} className="shrink-0" />
                {t("summaryTime")}
                <span className="font-medium">· te ahorras ~{nextMoment ? moment.minutes : savedMinutes} minutos</span>
              </p>
              {replySeconds !== null ? <ReplyTime seconds={replySeconds} /> : null}

              {nextMoment ? (
                <button
                  type="button"
                  onClick={() => begin(moments.indexOf(nextMoment))}
                  className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[var(--color-primary)] px-4 py-3.5 text-left text-white shadow-[0_14px_30px_-12px_rgba(124,77,255,0.9)]"
                >
                  {(() => {
                    const Icon = momentIcons[nextMoment.id];
                    return <Icon size={22} className="shrink-0" />;
                  })()}
                  <span className="min-w-0">
                    <span className="block text-[12px] font-semibold uppercase tracking-wider text-white/80">{t("nextSituation")}</span>
                    <span className="block text-[16px] font-semibold">{nextMoment.title}</span>
                  </span>
                  <ArrowRight size={20} className="ml-auto shrink-0 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <>
                  <p className="flex items-start gap-2 text-[14.5px] text-[var(--color-ink)]">
                    <MessageCircle size={17} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                    {t("tryNow")}
                  </p>
                  <p className="flex items-start gap-2 rounded-2xl bg-[var(--color-fog)] px-4 py-3 text-[14px] leading-snug text-[var(--color-ink)] ring-1 ring-[var(--color-border)]">
                    <Info size={17} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                    <span>
                      <span className="font-semibold">{t("demoDisclaimerTitle")}</span> {t("demoDisclaimer")}
                    </span>
                  </p>
                  <div className="relative overflow-hidden rounded-2xl bg-[var(--color-ink)] p-4 text-white md:p-5">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{ background: "radial-gradient(70% 120% at 100% 0%, rgba(124,77,255,0.5), transparent 70%)" }}
                    />
                    <p className="text-display relative text-[1.3rem] font-semibold leading-snug md:text-[1.5rem]">{t("ctaInnovate")}</p>
                    <p className="relative mt-1 text-[14px] leading-snug text-white/75">{t("ctaTitle")}</p>
                    <div className="relative mt-3 flex flex-wrap gap-2">
                      <a
                        href="#contacto"
                        onClick={onQuote}
                        className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-primary-soft)]"
                      >
                        {t("ctaQuote")}
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </a>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-2.5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        <MessageCircle size={16} />
                        {t("ctaWhatsapp")}
                      </a>
                    </div>
                  </div>
                </>
              )}
              {(
                <p className="flex items-start gap-2 text-[13.5px] leading-snug text-[var(--color-muted)]">
                  <MessageCircle size={16} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
                  {ownerView
                    ? "Toca otro momento en la lista de momentos para seguir."
                    : "Puedes seguir escribiéndole en el chat: te responde el asistente real."}
                </p>
              )}
              <button
                type="button"
                onClick={() => begin(index)}
                className="flex w-fit cursor-pointer items-center gap-1.5 text-[13.5px] font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                <RotateCcw size={14} />
                {t("replay")}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Thinking({ label = "Tu asistente está respondiendo…" }: { label?: string }) {
  return (
    <p className="mt-3 flex items-center gap-2 text-[15px] font-medium text-[var(--color-primary)]">
      <span className="flex gap-1">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="h-2 w-2 rounded-full bg-[var(--color-primary)]"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
          />
        ))}
      </span>
      {label}
    </p>
  );
}

function ReplyTime({ seconds }: { seconds: number }) {
  return (
    <p className="flex items-center gap-2 rounded-2xl bg-[#e8f7ef] px-4 py-3 text-[15px] font-semibold text-[#15803d]">
      <Timer size={17} className="shrink-0" />
      Tu asistente respondió en {seconds} s
    </p>
  );
}

function Bubble({ message, business }: { message: Message; business: string }) {
  if (message.from === "time") {
    return (
      <p className="mx-auto my-1 w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[var(--color-muted)]">{message.text}</p>
    );
  }
  if (message.from === "sys") {
    return (
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto my-1 flex max-w-[94%] items-start gap-1.5 rounded-xl bg-[#fff8db] px-3 py-2 text-[12.5px] leading-snug text-[#6b5a1e]"
      >
        <BadgeCheck size={14} className="mt-0.5 shrink-0" />
        <span>{message.text}</span>
      </motion.p>
    );
  }
  if (message.from === "receipt") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="ml-auto w-[210px] rounded-2xl rounded-tr-sm bg-white p-3 text-[12.5px] text-[var(--color-ink)] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
      >
        <p className="font-semibold text-[var(--color-success)]">Transferencia · Envío exitoso</p>
        <p className="mt-1 text-[20px] font-bold tabular-nums">{message.text}</p>
        <p className="mt-1 flex justify-between text-[var(--color-muted)]">
          <span>Para</span>
          <span className="truncate pl-2 text-[var(--color-ink)]">{business}</span>
        </p>
        <p className="flex justify-between text-[var(--color-muted)]">
          <span>Comprobante</span>
          <span className="text-[var(--color-ink)]">N.º 48213907</span>
        </p>
      </motion.div>
    );
  }
  const fromBusiness = message.from === "biz";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease }}
      className={`flex max-w-[88%] flex-col gap-0.5 ${fromBusiness ? "items-start" : "ml-auto items-end"}`}
    >
      {message.by ? <span className="px-1 text-[11px] font-semibold text-[var(--color-primary)]">Escribe {message.by}</span> : null}
      <p
        className={`whitespace-pre-line rounded-2xl px-3.5 py-2 text-[14px] leading-snug ${
          fromBusiness
            ? "rounded-tl-sm bg-white text-[var(--color-ink)] shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
            : "rounded-tr-sm bg-[var(--color-primary)] text-white"
        }`}
      >
        {rich(message.text)}
      </p>
    </motion.div>
  );
}
