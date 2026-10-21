"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CalendarPlus,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Smartphone,
  Timer,
  Trophy,
  Wand2,
  X,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useFormPrefill } from "@/lib/FormPrefillContext";
import {
  advance,
  answersLeft,
  buildFlow,
  choose,
  emptyEngine,
  fastForward,
  openChapter,
  playbookFor,
  storyOrder,
  type ChatMessage,
  type Choice,
  type DemoCard as CardData,
  type DemoService,
  type Engine,
  type Playbook,
  type VisitorBusiness,
} from "@/lib/demoFlow";
import { businessKeys, demoBusinesses, offeredPains, type BusinessKey, type PainKey } from "@/content/demoBusinesses";
import { priceIn, serviceCatalog } from "@/content/serviceCatalog";
import { formatMoney, useCurrency } from "@/lib/currency";
import { CurrencySelect } from "@/components/ui/CurrencySelect";
import { announceDemoPick, START_DEMO_EVENT, type StartDemoDetail } from "@/lib/demoEvents";
import { buildWhatsAppLink } from "@/config/contact";
import type { AppLocale } from "@/i18n/routing";

type Phase = "idle" | "playing" | "done";
/** The demo the visitor created: their business and the situations to show, in order. */
type Created = {
  key: BusinessKey;
  custom: string;
  kind: string;
  pains: PainKey[];
  business: VisitorBusiness;
  /** Who runs the business: the assistant passes chats to them. Optional; the demo uses a sample name. */
  owner: string;
  /** How a business of a kind we don't know works, written by Claude. */
  playbook?: Playbook | null;
};

const painIcons: Record<PainKey, typeof MessageCircle> = {
  responder: MessageCircle,
  agendar: CalendarPlus,
  reprogramar: CalendarClock,
  cotizar: FileText,
};
const MAX_SERVICES = 5;
const SETUP_STEPS = 3;

/** Services typed by hand when the business is "Other": name and price. */
type OwnService = { name: string; price: string };
const emptyOwn: OwnService[] = [
  { name: "", price: "" },
  { name: "", price: "" },
  { name: "", price: "" },
];
const amountOf = (price: string) => Number(price.replace(/\D/g, "")) || 0;
const unique = (list: string[]) => Array.from(new Set(list));

/** The situation to show after this one: the next one not seen yet. */
function nextAfter(pains: PainKey[], chapter: number, watched: PainKey[]) {
  const open = (p: PainKey, i: number) => i !== chapter && !watched.includes(p);
  return pains.find((p, i) => i > chapter && open(p, i)) ?? pains.find((p, i) => i < chapter && open(p, i)) ?? null;
}

/** Starts counting: the returned function says how many whole seconds went by (at least 1). */
function stopwatch() {
  const start = performance.now();
  return () => Math.max(1, Math.round((performance.now() - start) / 1000));
}

/** A chat id for the real assistant: its memory and its sample calendar live per demo. */
function newSession() {
  return `demo-${Math.random().toString(36).slice(2, 12).padEnd(8, "0")}`;
}

/** The visitor's business as the real assistant in n8n reads it (api/demo-chat → "Demo web · Asistente"). */
function assistantBusiness(demo: Created) {
  const { assistant, texts } = demoBusinesses[demo.key];
  return {
    nombre: demo.business.name.slice(0, 40),
    rubro: (demo.custom || assistant.kind).slice(0, 40),
    duena: (demo.owner || assistant.owner).slice(0, 20),
    direccion: demo.business.address ?? "",
    a_domicilio: false,
    profesional: assistant.pro,
    profesionales: assistant.team,
    horario: texts.es.hours,
    horas: assistant.hours,
    zona: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Santiago",
    moneda: demo.business.currency,
    servicios: demo.business.services.map((s) => ({ nombre: s.name, precio: s.amount })),
    necesidades: demo.pains,
    por_evento: false,
  };
}

const weekdays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/** "mañana 10:00" or "jueves 16:00" as the assistant's calendar writes it ("2026-10-22 10:00"), in the visitor's time. */
function slotStart(label: string) {
  const m = label.toLowerCase().match(/^(hoy|mañana|domingo|lunes|martes|miércoles|jueves|viernes|sábado)\s+(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const day = new Date();
  if (m[1] === "mañana") day.setDate(day.getDate() + 1);
  else if (m[1] !== "hoy") day.setDate(day.getDate() + ((weekdays.indexOf(m[1]) - day.getDay() + 7) % 7 || 7));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())} ${pad(Number(m[2]))}:${m[3]}`;
}

/** What the guided chat already did, so the real assistant picks up from there: the booking and the client's name. */
function guidedState(demo: Created, slot: string | undefined, locale: AppLocale) {
  const start = slot ? slotStart(slot) : null;
  if (!start) return null;
  const client = playbookFor(flowContext(demo, null, locale), locale).client;
  const reserva = {
    reserva_id: "D-demo",
    inicio: start,
    servicio_id: "srv1",
    servicio_nombre: demo.business.services[0].name,
    barbero_id: "pro1",
    barbero_nombre: demoBusinesses[demo.key].assistant.team[0],
    nombre: client,
  };
  return { nombre: client, reservas: [reserva] };
}

function flowFor(demo: Created, pain: PainKey, next: PainKey | null, locale: AppLocale) {
  return buildFlow(pain, flowContext(demo, next, locale), locale);
}

function flowContext(demo: Created, next: PainKey | null, locale: AppLocale) {
  return { business: demo.business, texts: demoBusinesses[demo.key].texts[locale], kind: demo.custom, next, playbook: demo.playbook };
}

// Reading pace for the guide: about 150 words a minute, slow enough for anyone.
const MS_PER_WORD = 400;
const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
/** How long the assistant "types": longer answers take a little longer, like a person. */
const typingTime = (text: string) => clamp(1200 + text.length * 12, 1500, 3000);

const ease = [0.22, 1, 0.36, 1] as const;
const input =
  "h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)]";

/**
 * "Try it with your business". Three short steps (the business, its services,
 * what takes most of the owner's time) while a WhatsApp preview builds itself
 * on the side. Then a guided demo: the visitor plays the client, one step at
 * a time, and sees what the business gains; each chosen situation is a
 * chapter, and the summary leads to a quote with what they already told us.
 */
export function PersonalDemo() {
  const t = useTranslations("myDemo");
  const locale = useLocale() as AppLocale;
  const reduce = useReducedMotion();
  const { requestContact } = useFormPrefill();
  const { currency } = useCurrency();

  // Setup
  const [setupStep, setSetupStep] = useState(0);
  const [business, setBusiness] = useState<BusinessKey>("salon");
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [owner, setOwner] = useState("");
  // Indexes of the ticked services in the catalog of the chosen kind of business.
  const [picked, setPicked] = useState<number[]>([0, 1]);
  const [pains, setPains] = useState<PainKey[]>([]);
  const [own, setOwn] = useState<OwnService[]>(emptyOwn);
  // Services the visitor adds by hand when theirs isn't in the menu.
  const [extra, setExtra] = useState<OwnService[]>([]);
  const [preparing, setPreparing] = useState(false);
  // Prices the visitor typed over the suggested ones, by business, currency and service.
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});

  // Demo
  const [created, setCreated] = useState<Created | null>(null);
  const [chapter, setChapter] = useState(0);
  const [watched, setWatched] = useState<PainKey[]>([]);
  const [run, setRun] = useState(0);
  const [engine, setEngine] = useState<Engine>(emptyEngine);
  // The chat as it was when this situation began, to replay it.
  const [chapterStart, setChapterStart] = useState<{ before: Engine; handoff: boolean }>({ before: emptyEngine, handoff: false });
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  // The real assistant (n8n, Spanish): one chat per demo, what it booked so far, and how fast it answered.
  const [session, setSession] = useState(newSession);
  const [aiState, setAiState] = useState<unknown>(null);
  const [replySeconds, setReplySeconds] = useState<number | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const setupRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const sample = demoBusinesses[business];
  const catalog = serviceCatalog[business];
  const typedKind = business === "otro" ? custom.trim() : "";
  const previewName = name.trim() || (typedKind ? `${locale === "es" ? "Tu" : "Your"} ${typedKind.toLowerCase()}` : t("yourBusiness"));

  const ownServices = own.filter((s) => s.name.trim() && amountOf(s.price) > 0);
  const editKey = (i: number) => `${business}-${currency}-${i}`;
  /** The price of a service in the menu: the visitor's own if they changed it. */
  const priceOf = (i: number) => amountOf(priceEdits[editKey(i)] ?? "") || priceIn(catalog[i], currency);
  /** What the price box shows: what the visitor is typing (even empty), or the suggested price. */
  const priceShown = (i: number) => {
    const typed = priceEdits[editKey(i)];
    if (typed === undefined) return formatMoney(priceIn(catalog[i], currency), currency);
    return typed ? formatMoney(amountOf(typed), currency) : "";
  };
  const extraServices = extra.filter((s) => s.name.trim() && amountOf(s.price) > 0);
  const servicesCount = business === "otro" ? own.length : picked.length + extra.length;
  const canAddService = servicesCount < MAX_SERVICES;
  const ownReady = business !== "otro" || ownServices.length > 0;

  const pain = created ? created.pains[chapter] : null;
  const nextChapter = created ? nextAfter(created.pains, chapter, watched) : null;
  const flow = created && pain ? flowFor(created, pain, nextChapter, locale) : null;
  const price = (s: DemoService) => formatMoney(s.amount, created?.business.currency ?? currency);
  const phase: Phase = !created ? "idle" : engine.end ? "done" : "playing";
  const head = engine.pending[0];
  const awaitingTap = phase === "playing" && head?.kind === "choose";
  const choices = head?.kind === "choose" ? head.choices : [];
  const suggested = choices[0];
  const lastMessage = engine.log.at(-1);
  // The assistant's last message holds the answers; the client's first message of a situation goes over the input.
  const botAsking = lastMessage?.from === "bot" && !lastMessage.live && !!lastMessage.choices?.length && !lastMessage.chosen;
  const openingTap = awaitingTap && !botAsking;
  const hasLive = engine.log.some((m) => m.live);

  // The guide: one step per answer of the client, then the summary.
  const inChapter = engine.log.filter((m) => m.chapter === chapter && !m.live);
  const lastBot = [...inChapter].reverse().find((m) => m.from === "bot");
  const sentSteps = inChapter.filter((m) => m.from === "client").length;
  const clientSteps = Math.max(1, flow ? sentSteps + answersLeft(engine, flow) : 1);
  const earned = unique(inChapter.flatMap((m) => (m.from === "bot" && m.benefit ? [m.benefit] : [])));
  // The final summary: the first two gains of each situation, so it stays short.
  const highlights = unique(
    (created?.pains ?? []).flatMap((_, c) =>
      engine.log.flatMap((m) => (m.chapter === c && m.from === "bot" && !m.live && m.benefit ? [m.benefit] : [])).slice(0, 2),
    ),
  );
  const opening = flow ? flow.opening(chapterStart.before.log.length > 0) : null;
  const guideTitle = awaitingTap ? (botAsking ? (lastBot?.caption ?? "") : (opening?.title ?? "")) : "";
  const guideBody = awaitingTap ? (botAsking ? (lastBot?.benefit ?? "") : t("guideStartText")) : "";
  const upcoming =
    flow && head ? (head.kind === "bot" ? flow.node(head.id, engine.memory).caption : head.kind === "note" ? head.caption : null) : null;
  // Time to read the guide and the last message before the demo carries on by itself.
  const waitMs = suggested
    ? clamp(5000 + words(`${guideTitle} ${guideBody} ${botAsking ? lastMessage?.text : ""} ${suggested.label}`) * MS_PER_WORD, 12000, 30000)
    : 0;

  // Play the chat one message at a time. The assistant "types" for a moment
  // before each answer; the client's turn waits for the visitor's tap and,
  // once there was time to read, carries on with the suggested answer.
  useEffect(() => {
    if (!flow || !head) return;
    const timers: number[] = [];
    if (head.kind === "note") {
      timers.push(window.setTimeout(() => setEngine((e) => advance(e, flow)), reduce ? 0 : 1800));
    } else if (head.kind === "bot") {
      const text = flow.node(head.id, engine.memory).text;
      if (!reduce) timers.push(window.setTimeout(() => setTyping(true), 600));
      timers.push(
        window.setTimeout(
          () => {
            setTyping(false);
            setEngine((e) => advance(e, flow));
          },
          reduce ? 0 : 600 + typingTime(text),
        ),
      );
    } else if (!reduce) {
      timers.push(window.setTimeout(() => setEngine((e) => choose(e, head.choices[0])), waitMs));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
    // Runs once per step: `head` changes with every message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [head]);

  // Remember which situations the visitor has seen, for the summary.
  useEffect(() => {
    if (phase !== "done" || !pain) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- records the chapter once it ends
    setWatched((list) => (list.includes(pain) ? list : [...list, pain]));
  }, [phase, pain]);

  // The hero's "create my demo" button brings the visitor here, ready to type.
  useEffect(() => {
    function onStart(event: Event) {
      const { business: key } = (event as CustomEvent<StartDemoDetail>).detail;
      if (key) {
        setBusiness(key);
        setPicked([0, 1]);
      }
      setCreated(null);
      setSetupStep(0);
      window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 700);
    }
    window.addEventListener(START_DEMO_EVENT, onStart);
    return () => window.removeEventListener(START_DEMO_EVENT, onStart);
  }, []);

  useEffect(() => {
    const bar = tabsRef.current;
    const tab = bar?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!bar || !tab) return;
    const left = tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, left), behavior: reduce ? "auto" : "smooth" });
  }, [pain, created, reduce]);

  useEffect(() => {
    const chat = chatRef.current;
    if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [engine.log.length, typing, phase, reduce]);

  function pickBusiness(key: BusinessKey) {
    setBusiness(key);
    setPicked([0, 1]);
    setExtra([]);
  }

  function toggleService(index: number) {
    setPicked((list) =>
      list.includes(index) ? list.filter((i) => i !== index) : list.length + extra.length >= MAX_SERVICES ? list : [...list, index],
    );
  }

  /** Changes the setup step; on phones, brings its question back into view. */
  function goToStep(step: number) {
    setSetupStep(step);
    const form = setupRef.current;
    if (form && window.innerWidth < 1024 && form.getBoundingClientRect().top < 0) {
      form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
  }

  function addService() {
    if (!canAddService) return;
    if (business === "otro") setOwn((list) => [...list, { name: "", price: "" }]);
    else setExtra((list) => [...list, { name: "", price: "" }]);
  }

  function setExtraRow(index: number, patch: Partial<OwnService>) {
    setExtra((list) => list.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeExtraRow(index: number) {
    setExtra((list) => list.filter((_, i) => i !== index));
  }

  function setOwnRow(index: number, patch: Partial<OwnService>) {
    setOwn((list) => list.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function togglePain(key: PainKey) {
    setPains((list) => (list.includes(key) ? list.filter((p) => p !== key) : [...list, key]));
  }

  function scrollToStage() {
    if (window.innerWidth < 1024) {
      window.setTimeout(() => stageRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 200);
    }
  }

  /** Starts a situation after what's already in the chat (or after `before`, to replay it). */
  function begin(demo: Created, index: number, handoff: boolean, before: Engine) {
    setChapter(index);
    setChapterStart({ before, handoff });
    setEngine(openChapter(before, flowFor(demo, demo.pains[index], null, locale), index, handoff));
    setTyping(false);
    setDraft("");
    setRun((r) => r + 1);
  }

  function replay() {
    if (created) begin(created, chapter, chapterStart.handoff, chapterStart.before);
  }

  function goNext() {
    if (!created || !nextChapter) return;
    begin(created, created.pains.indexOf(nextChapter), engine.end?.handoff ?? false, engine);
    scrollToStage();
  }

  /** Asks Claude how a business of this kind works; null if it takes too long or there's no AI. */
  async function fetchPlaybook(kind: string, businessName: string, services: DemoService[]) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch("/api/demo-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          kind,
          name: businessName,
          locale,
          services: services.map((s) => ({ name: s.name, price: formatMoney(s.amount, currency) })),
        }),
      });
      if (!response.ok) return null;
      return ((await response.json()) as { playbook: Playbook | null }).playbook;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function create(event: FormEvent) {
    event.preventDefault();
    if (setupStep < SETUP_STEPS - 1) {
      goToStep(setupStep + 1);
      return;
    }
    if (!pains.length || !ownReady || preparing) return;
    const kind = typedKind || sample.texts[locale].label;
    const businessName = name.trim() || (typedKind ? previewName : sample.name);
    // Each conversation needs two services: fill in from the menu when only one is ticked.
    const indexes = [...picked].sort((a, b) => a - b);
    for (let i = 0; indexes.length < 2 && i < catalog.length; i++) if (!indexes.includes(i)) indexes.push(i);
    const services: DemoService[] =
      business === "otro"
        ? ownServices.map((s) => ({ name: s.name.trim(), amount: amountOf(s.price) }))
        : [
            ...indexes.map((i) => ({ name: catalog[i][locale], amount: priceOf(i) })),
            ...extraServices.map((s) => ({ name: s.name.trim(), amount: amountOf(s.price) })),
          ];
    const ordered = storyOrder.filter((key) => pains.includes(key) && offeredPains.includes(key));
    let playbook: Playbook | null = null;
    // In Spanish "Otro" is another business with appointments: the built-in playbook fits it.
    if (business === "otro" && typedKind && locale !== "es") {
      setPreparing(true);
      playbook = await fetchPlaybook(typedKind, businessName, services);
      setPreparing(false);
    }
    const demo: Created = {
      key: business,
      custom: typedKind,
      kind,
      pains: ordered,
      business: { name: businessName, currency, services, address: address.trim() || undefined },
      owner: owner.trim(),
      playbook,
    };
    setCreated(demo);
    setWatched([]);
    setSession(newSession());
    setAiState(null);
    setReplySeconds(null);
    begin(demo, 0, false, emptyEngine);
    announceDemoPick({
      business,
      pains: ordered,
      name: businessName,
      address: address.trim() || undefined,
      currency,
      services,
      summary: summarize(demo),
    });
    scrollToStage();
  }

  /** Jumps to another situation; adds it when the visitor hadn't picked it. */
  function goToPain(next: PainKey) {
    if (!created) return;
    const index = created.pains.indexOf(next);
    if (index === chapter && phase === "playing") return;
    // The chat goes on: the situation starts after what's already there.
    if (index >= 0) {
      begin(created, index, false, engine);
    } else {
      const list = [...created.pains, next];
      const demo = { ...created, pains: list };
      setCreated(demo);
      setPains(list);
      begin(demo, list.length - 1, false, engine);
      announceDemoPick({
        business: created.key,
        pains: list,
        name: created.business.name,
        address: created.business.address,
        currency: created.business.currency,
        services: created.business.services,
        summary: summarize(demo),
      });
    }
    scrollToStage();
  }

  function answer(choice: Choice) {
    setEngine((e) => choose(e, choice));
  }

  function answerWith(label: string) {
    const choice = choices.find((c) => c.label === label);
    if (choice) answer(choice);
  }

  function skip() {
    if (!flow) return;
    setTyping(false);
    setEngine((e) => fastForward(e, flow));
    window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || typing || !created) return;
    const asked: ChatMessage = { from: "client", text: clean, chapter, live: true };
    // The assistant gets the whole chat, so it answers within the story the visitor just saw.
    const conversation = [...engine.log, asked].filter((m) => m.from !== "note").slice(-40);
    setEngine((e) => ({ ...e, log: [...e.log, asked] }));
    setDraft("");
    setTyping(true);
    // In Spanish the real assistant answers (n8n, with the brain of the product); if it can't, the prepared replies below.
    if (locale === "es") {
      const seconds = stopwatch();
      try {
        const response = await fetch("/api/demo-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(58_000),
          body: JSON.stringify({
            sessionId: session,
            mensaje: clean,
            negocio: assistantBusiness(created),
            estado: aiState ?? guidedState(created, engine.memory.slot, locale),
          }),
        });
        const data = response.ok ? ((await response.json()) as { respuesta?: string; estado?: unknown }) : null;
        if (data?.respuesta) {
          if (data.estado) setAiState(data.estado);
          setReplySeconds(seconds());
          setTyping(false);
          setEngine((e) => ({ ...e, log: [...e.log, { from: "bot", text: data.respuesta ?? "", chapter, live: true }] }));
          return;
        }
      } catch {
        // Falls back to the prepared replies.
      }
    }
    let reply: ChatMessage;
    try {
      const response = await fetch("/api/demo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: created.key,
          custom: created.custom,
          name: created.business.name,
          address: created.business.address ?? "",
          currency: created.business.currency,
          services: created.business.services.map((s) => ({ name: s.name, price: price(s), amount: s.amount })),
          ...(() => {
            const pb = playbookFor(flowContext(created, null, locale), locale);
            return { combine: pb.combine, slots: pb.slots, unit: pb.unit };
          })(),
          locale,
          messages: conversation.map((m) => ({ role: m.from === "client" ? "user" : "assistant", text: m.text.slice(0, 800) })),
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as { text: string; buttons: string[] };
      // No quote buttons while the demo doesn't show quotes.
      const buttons = data.buttons.filter((b) => !/cotiz|quote/i.test(b));
      reply = { from: "bot", text: data.text, choices: buttons, chapter, live: true };
    } catch {
      reply = { from: "bot", text: t("error"), chapter, live: true };
    }
    setTyping(false);
    setEngine((e) => ({ ...e, log: [...e.log, reply] }));
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  /** One line with everything the visitor told the demo, for the quote. */
  function summarize(demo: Created) {
    const services = demo.business.services.map((s) => `${s.name} ${formatMoney(s.amount, demo.business.currency)}`).join(", ");
    const situations = demo.pains.map((p) => t(`pains.${p}`)).join(", ");
    const place = demo.business.address ? ` · ${demo.business.address}` : "";
    return `${demo.business.name} (${demo.kind})${place} · ${services} · ${situations}`;
  }

  const servicesText = created ? created.business.services.map((s) => `${s.name} ${price(s)}`).join(", ") : "";
  const painsText = created ? created.pains.map((p) => t(`pains.${p}`)).join(", ") : "";
  const summary = created ? summarize(created) : "";

  function wantQuote() {
    if (!created) return;
    requestContact({
      businessType: demoBusinesses[created.key].formType,
      mainTask: summary,
      solutionInterest: "aiAgent",
      demoSummary: summary,
    });
  }

  const suggestions = (() => {
    if (phase !== "done" || typing || !created || hasLive) return [];
    const other = (created.business.services[1] ?? created.business.services[0]).name.toLowerCase();
    return locale === "es"
      ? [`¿Cuánto sale ${other}?`, "Quiero cambiar mi hora", "¿Dónde están?"]
      : [`How much is ${other}?`, "I need to move my slot", "Where are you?"];
  })();


  return (
    <section id="prueba" className="bg-[var(--color-fog)] py-10 md:py-14 lg:py-8">
      <Container>
        <AnimatePresence mode="wait" initial={false}>
          {!created ? (
            <motion.div
              key="setup"
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease }}
              className="grid overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(27,23,48,0.05)] lg:grid-cols-[1fr_420px]"
            >
              {/* Three short steps, one question at a time */}
              <form ref={setupRef} onSubmit={create} className="flex scroll-mt-20 flex-col p-6 md:p-8">
                <p className="text-sm font-medium text-[var(--color-primary)]">{t("eyebrow")}</p>
                <h2 className="text-display mt-2 text-[1.7rem] font-semibold leading-[1.1] text-[var(--color-ink)] md:text-[2.1rem]">
                  {t("title")}
                </h2>
                <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-[var(--color-muted)]">{t("subtitle")}</p>

                <div className="mt-6 flex items-center gap-3">
                  <span className="shrink-0 text-[13px] font-semibold text-[var(--color-primary)]">
                    {t("wizardStep", { n: setupStep + 1, total: SETUP_STEPS })}
                  </span>
                  <div className="flex flex-1 gap-1.5" aria-hidden="true">
                    {Array.from({ length: SETUP_STEPS }).map((_, i) => (
                      <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-mist)]">
                        <motion.span
                          className="block h-full rounded-full bg-[var(--color-primary)]"
                          initial={false}
                          animate={{ width: i <= setupStep ? "100%" : "0%" }}
                          transition={{ duration: 0.35 }}
                        />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 min-h-[300px]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={setupStep}
                      initial={reduce ? undefined : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={reduce ? undefined : { opacity: 0, x: -24 }}
                      transition={{ duration: 0.3, ease }}
                      className="space-y-4"
                    >
                      {setupStep === 0 ? (
                        <>
                          <p className="text-[19px] font-semibold text-[var(--color-ink)]">{t("stepBusiness")}</p>
                          <label className="block">
                            <span className="text-[14px] font-semibold text-[var(--color-ink)]">{t("nameLabel")}</span>
                            <input
                              ref={nameRef}
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              maxLength={40}
                              placeholder={t("namePlaceholder", { example: sample.name })}
                              className={`${input} mt-1.5`}
                            />
                          </label>
                          <label className="block">
                            <span className="text-[14px] font-semibold text-[var(--color-ink)]">{t("kindLabel")}</span>
                            <span className="relative mt-1.5 block">
                              <select
                                value={business}
                                onChange={(e) => pickBusiness(e.target.value as BusinessKey)}
                                className={`${input} cursor-pointer appearance-none pr-10`}
                              >
                                {businessKeys.map((key) => (
                                  <option key={key} value={key}>
                                    {demoBusinesses[key].emoji} {demoBusinesses[key].texts[locale].label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={16}
                                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                              />
                            </span>
                          </label>
                          {business === "otro" ? (
                            <input
                              value={custom}
                              onChange={(e) => setCustom(e.target.value)}
                              maxLength={40}
                              placeholder={t("otherPlaceholder")}
                              aria-label={t("otherPlaceholder")}
                              className={input}
                            />
                          ) : null}
                          <label className="block">
                            <span className="text-[14px] font-semibold text-[var(--color-ink)]">
                              {t("addressLabel")} <span className="font-normal text-[var(--color-muted)]">{t("optional")}</span>
                            </span>
                            <span className="relative mt-1.5 block">
                              <MapPin size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                              <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                maxLength={80}
                                autoComplete="street-address"
                                placeholder={t("addressPlaceholder")}
                                className={`${input} pl-10`}
                              />
                            </span>
                          </label>
                          {locale === "es" ? (
                            <label className="block">
                              <span className="text-[14px] font-semibold text-[var(--color-ink)]">
                                {t("ownerLabel")} <span className="font-normal text-[var(--color-muted)]">{t("optional")}</span>
                              </span>
                              <input
                                value={owner}
                                onChange={(e) => setOwner(e.target.value)}
                                maxLength={20}
                                autoComplete="given-name"
                                placeholder={t("ownerPlaceholder")}
                                className={`${input} mt-1.5`}
                              />
                            </label>
                          ) : null}
                        </>
                      ) : setupStep === 1 ? (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[19px] font-semibold text-[var(--color-ink)]">{t("servicesLabel")}</p>
                            <CurrencySelect label={t("currencyLabel")} />
                          </div>
                          {business === "otro" ? (
                            <>
                              <p className="text-[14px] text-[var(--color-muted)]">{t("ownHint")}</p>
                              <div className="space-y-2">
                                {own.map((row, i) => (
                                  <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,9rem)] gap-2">
                                    <input
                                      value={row.name}
                                      onChange={(e) => setOwnRow(i, { name: e.target.value })}
                                      maxLength={50}
                                      placeholder={t(i === 0 ? "ownNamePlaceholder" : "ownNameMore")}
                                      aria-label={t("ownNameLabel", { n: i + 1 })}
                                      className={input}
                                    />
                                    <input
                                      value={row.price ? formatMoney(amountOf(row.price), currency) : ""}
                                      onChange={(e) => setOwnRow(i, { price: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                                      inputMode="numeric"
                                      placeholder={t("ownPricePlaceholder")}
                                      aria-label={t("ownPriceLabel", { n: i + 1 })}
                                      className={`${input} tabular-nums`}
                                    />
                                  </div>
                                ))}
                              </div>
                              {canAddService ? (
                                <button
                                  type="button"
                                  onClick={addService}
                                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-1 text-[14px] font-semibold text-[var(--color-primary)] hover:underline"
                                >
                                  <Plus size={16} strokeWidth={2.5} />
                                  {t("addService")}
                                </button>
                              ) : null}
                            </>
                          ) : (
                            <>
                              <p className="text-[14px] text-[var(--color-muted)]">{t("servicesHint", { max: MAX_SERVICES })}</p>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {catalog.map((service, i) => {
                                  const on = picked.includes(i);
                                  return (
                                    <div
                                      key={service.es}
                                      className={`relative flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-2xl border px-3.5 py-3 transition-colors ${
                                        on
                                          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                                          : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                                      }`}
                                    >
                                      {/* The whole card ticks the service; the price stays editable on top */}
                                      <button
                                        type="button"
                                        onClick={() => toggleService(i)}
                                        aria-pressed={on}
                                        aria-label={service[locale]}
                                        className="absolute inset-0 cursor-pointer rounded-2xl"
                                      />
                                      <span
                                        className={`pointer-events-none flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                                          on ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-[#cfcadf]"
                                        }`}
                                      >
                                        {on ? <Check size={12} strokeWidth={3.5} /> : null}
                                      </span>
                                      <span className="pointer-events-none min-w-[7.5rem] flex-1 text-[14.5px] font-medium leading-snug text-[var(--color-ink)]">
                                        {service[locale]}
                                      </span>
                                      {on ? (
                                        <input
                                          value={priceShown(i)}
                                          placeholder={formatMoney(priceIn(service, currency), currency)}
                                          onChange={(e) =>
                                            setPriceEdits((edits) => ({ ...edits, [editKey(i)]: e.target.value.replace(/\D/g, "").slice(0, 9) }))
                                          }
                                          inputMode="numeric"
                                          aria-label={t("priceLabel", { service: service[locale] })}
                                          className="relative z-10 ml-auto h-8 w-[6.5rem] shrink-0 rounded-lg border border-[var(--color-primary)]/30 bg-white px-2 text-right text-[14px] font-semibold tabular-nums text-[var(--color-primary)] outline-none focus:border-[var(--color-primary)]"
                                        />
                                      ) : (
                                        <span className="pointer-events-none shrink-0 text-[14px] font-semibold tabular-nums text-[var(--color-primary)]">
                                          {formatMoney(priceIn(service, currency), currency)}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {extra.map((row, i) => (
                                <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,8rem)_auto] items-center gap-2">
                                  <input
                                    value={row.name}
                                    onChange={(e) => setExtraRow(i, { name: e.target.value })}
                                    maxLength={50}
                                    placeholder={t("ownNamePlaceholder")}
                                    aria-label={t("ownNameLabel", { n: picked.length + i + 1 })}
                                    className={input}
                                  />
                                  <input
                                    value={row.price ? formatMoney(amountOf(row.price), currency) : ""}
                                    onChange={(e) => setExtraRow(i, { price: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                                    inputMode="numeric"
                                    placeholder={t("ownPricePlaceholder")}
                                    aria-label={t("ownPriceLabel", { n: picked.length + i + 1 })}
                                    className={`${input} tabular-nums`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeExtraRow(i)}
                                    aria-label={t("removeService")}
                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-mist)] hover:text-[var(--color-ink)]"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                              {canAddService ? (
                                <button
                                  type="button"
                                  onClick={addService}
                                  className="flex cursor-pointer items-center gap-1.5 rounded-full px-1 text-[14px] font-semibold text-[var(--color-primary)] hover:underline"
                                >
                                  <Plus size={16} strokeWidth={2.5} />
                                  {t("addService")}
                                </button>
                              ) : null}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-[19px] font-semibold text-[var(--color-ink)]">{t("painLabel")}</p>
                          <p className="text-[14px] text-[var(--color-muted)]">{t("painsHint")}</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {offeredPains.map((key) => {
                              const Icon = painIcons[key];
                              const on = pains.includes(key);
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => togglePain(key)}
                                  aria-pressed={on}
                                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                                    on
                                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                                      : "border-[var(--color-border)] bg-white hover:border-[var(--color-primary)]/40"
                                  }`}
                                >
                                  <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                      on ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-mist)] text-[var(--color-primary)]"
                                    }`}
                                  >
                                    <Icon size={19} />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-[15px] font-semibold text-[var(--color-ink)]">{t(`pains.${key}`)}</span>
                                    <span className="block text-[13px] leading-snug text-[var(--color-muted)]">{t(`painDesc.${key}`)}</span>
                                  </span>
                                  <span
                                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                                      on ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-[#cfcadf]"
                                    }`}
                                  >
                                    {on ? <Check size={12} strokeWidth={3.5} /> : null}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {setupStep === SETUP_STEPS - 1 && !pains.length ? (
                  <p className="mt-4 text-[13.5px] text-[var(--color-muted)]">{t("pickOne")}</p>
                ) : null}
                <div className="mt-4 flex items-center gap-3">
                  {setupStep > 0 ? (
                    <button
                      type="button"
                      onClick={() => goToStep(setupStep - 1)}
                      className="flex h-12 cursor-pointer items-center gap-1.5 rounded-2xl px-4 text-[15px] font-medium text-[var(--color-muted)] hover:bg-[var(--color-mist)] hover:text-[var(--color-ink)]"
                    >
                      <ArrowLeft size={16} />
                      {t("back")}
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={(setupStep === SETUP_STEPS - 1 && !pains.length) || (setupStep === 1 && !ownReady) || preparing}
                    className="group ml-auto inline-flex h-12 cursor-pointer items-center gap-2 whitespace-nowrap rounded-2xl bg-[var(--color-primary)] px-5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40 sm:ml-0"
                  >
                    {preparing ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        {t("preparing")}
                      </>
                    ) : setupStep === SETUP_STEPS - 1 ? (
                      <>
                        <Wand2 size={17} />
                        {t("create")}
                      </>
                    ) : (
                      t("next")
                    )}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </form>

              {/* A WhatsApp business profile that builds itself with each answer */}
              <div
                className="hidden flex-col items-center justify-center px-6 py-8 lg:flex"
                style={{
                  background:
                    "radial-gradient(90% 80% at 80% 10%, color-mix(in srgb, #7c4dff 30%, transparent), transparent 65%), #f1ebff",
                }}
              >
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">{t("previewTitle")}</p>
                <div className="w-full max-w-[320px] overflow-hidden rounded-[28px] border-[7px] border-[var(--color-ink)] bg-[#efeae2] shadow-[0_30px_60px_-30px_rgba(27,23,48,0.5)]">
                  <div className="flex flex-col items-center bg-white px-4 pb-4 pt-5 text-center">
                    <motion.span
                      key={business}
                      initial={reduce ? undefined : { scale: 0.6 }}
                      animate={{ scale: 1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#a57bff] to-[#7c4dff] text-3xl"
                    >
                      {sample.emoji}
                    </motion.span>
                    <p className="mt-2 max-w-full truncate text-[17px] font-semibold text-[var(--color-ink)]">{previewName}</p>
                    <p className="text-[12px] text-[var(--color-muted)]">
                      {t("previewBusinessAccount")} · {typedKind || sample.texts[locale].label}
                    </p>
                    <AnimatePresence>
                      {address.trim() ? (
                        <motion.p
                          initial={reduce ? undefined : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1.5 flex max-w-full items-center gap-1 text-[12.5px] text-[var(--color-ink)]"
                        >
                          <MapPin size={12} className="shrink-0 text-[var(--color-primary)]" />
                          <span className="truncate">{address.trim()}</span>
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">{t("previewCatalog")}</p>
                      <ul className="mt-1.5 space-y-1">
                        <AnimatePresence initial={false}>
                          {(business === "otro"
                            ? ownServices.map((row, i) => ({ key: `own-${i}`, name: row.name.trim(), amount: amountOf(row.price) }))
                            : [...picked]
                                .sort((a, b) => a - b)
                                .map((i) => ({ key: `${business}-${i}`, name: catalog[i][locale], amount: priceOf(i) }))
                                .concat(extraServices.map((row, i) => ({ key: `extra-${i}`, name: row.name.trim(), amount: amountOf(row.price) })))
                          ).map((item) => (
                            <motion.li
                              key={item.key}
                              layout
                              initial={reduce ? undefined : { opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex justify-between gap-2 text-[13px] text-[var(--color-ink)]"
                            >
                              <span className="truncate">{item.name}</span>
                              <span className="shrink-0 font-semibold tabular-nums">{formatMoney(item.amount, currency)}</span>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    </div>
                    {pains.length ? (
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">{t("previewSkills")}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {offeredPains
                            .filter((key) => pains.includes(key))
                            .map((key) => (
                              <motion.span
                                key={key}
                                initial={reduce ? undefined : { scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11.5px] font-medium text-[var(--color-primary)]"
                              >
                                <Check size={11} strokeWidth={3} />
                                {t(`pains.${key}`)}
                              </motion.span>
                            ))}
                        </div>
                      </div>
                    ) : null}
                    <p className="w-fit max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[13px] leading-snug text-[var(--color-ink)] shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
                      {t("previewGreeting", { name: previewName })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* The stage: what the client sees, and what the business gains */
            <motion.div
              key="stage"
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease }}
              className="overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(27,23,48,0.05)]"
            >
              <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a57bff] to-[#7c4dff] text-xl">
                    {demoBusinesses[created.key].emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-[17px] font-semibold text-[var(--color-ink)]">
                      <span className="truncate">{created.business.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCreated(null);
                          setSetupStep(0);
                        }}
                        className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[12.5px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
                      >
                        <Pencil size={12} />
                        {t("edit")}
                      </button>
                    </p>
                    <p className="text-[13.5px] leading-snug text-[var(--color-muted)]">{t("stageText")}</p>
                  </div>
                </div>
                {/* Situations: the ones picked come first; any other can be added */}
                <div
                  ref={tabsRef}
                  role="tablist"
                  aria-label={t("painLabel")}
                  className="relative -mx-1 flex gap-1 overflow-x-auto scroll-smooth rounded-full bg-[var(--color-mist)] p-1 [scrollbar-width:none] lg:mx-0 [&::-webkit-scrollbar]:hidden"
                >
                  {[...created.pains, ...offeredPains.filter((key) => !created.pains.includes(key))].map((key) => {
                    const Icon = painIcons[key];
                    const on = pain === key;
                    const seen = watched.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => goToPain(key)}
                        className={`relative flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
                          on
                            ? "text-white"
                            : created.pains.includes(key)
                              ? "text-[var(--color-ink)]"
                              : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {on ? (
                          <motion.span
                            layoutId="demo-pain-tab"
                            className="absolute inset-0 rounded-full bg-[var(--color-primary)] shadow-[0_6px_16px_-6px_rgba(124,77,255,0.8)]"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        ) : null}
                        {seen && !on ? (
                          <Check size={14} strokeWidth={3} className="relative shrink-0 text-[var(--color-success)]" />
                        ) : (
                          <Icon size={15} className="relative shrink-0" />
                        )}
                        <span className="relative">{t(`pains.${key}`)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div ref={stageRef} className="grid scroll-mt-20 grid-cols-[minmax(0,1fr)] lg:grid-cols-[400px_minmax(0,1fr)]">
                {/* What the client sees */}
                <div
                  className="flex min-w-0 flex-col items-center px-4 py-4 md:px-6 md:py-5"
                  style={{
                    background:
                      "radial-gradient(90% 80% at 80% 10%, color-mix(in srgb, #7c4dff 30%, transparent), transparent 65%), #f1ebff",
                    perspective: 1400,
                  }}
                >
                  <p className="mb-2 hidden items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[var(--color-primary)] sm:flex">
                    <Smartphone size={14} />
                    {t("clientSees")}
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
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#a57bff] to-[#7c4dff] text-sm">
                          {demoBusinesses[created.key].emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-semibold leading-tight text-[var(--color-ink)]">{created.business.name}</p>
                          <p className="text-xs text-[var(--color-success)]">{typing ? t("typing") : t("online")}</p>
                        </div>
                        <button
                          type="button"
                          onClick={replay}
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
                      <div ref={chatRef} className="flex h-[260px] flex-col gap-2 overflow-y-auto px-3 py-3 sm:h-[340px] lg:h-[400px]" aria-live="polite">
                        <div className="flex-1" />
                        {engine.log.map((message, i) => {
                          const isLast = i === engine.log.length - 1;
                          const active = isLast && (message.live ? phase === "done" && !typing : botAsking && awaitingTap);
                          return (
                            <ChatBubble
                              key={`${i}-${message.text}`}
                              message={message}
                              active={active}
                              suggested={message.live ? undefined : suggested?.label}
                              onPick={(label) => (message.live ? void send(label) : answerWith(label))}
                            />
                          );
                        })}
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
                      </div>

                      {openingTap && suggested ? (
                        <div className="px-3 pb-2">
                          <motion.button
                            type="button"
                            onClick={() => answer(suggested)}
                            animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="ml-auto flex max-w-[92%] cursor-pointer items-center gap-1.5 rounded-2xl bg-[var(--color-primary)] px-3.5 py-2 text-left text-[14px] font-semibold leading-snug text-white shadow-[0_0_0_4px_rgba(124,77,255,0.25)]"
                          >
                            <span aria-hidden="true">👆</span>
                            {suggested.label}
                          </motion.button>
                        </div>
                      ) : null}

                      {suggestions.length ? (
                        <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {suggestions.map((s) => (
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

                      <form onSubmit={onSubmit} className="flex items-center gap-2 bg-[#f6f3ee] px-3 py-2.5">
                        <input
                          ref={inputRef}
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          disabled={phase !== "done"}
                          maxLength={400}
                          placeholder={phase === "done" ? t("placeholder") : t("placeholderWait")}
                          aria-label={t("placeholder")}
                          className={`min-w-0 flex-1 rounded-full bg-white px-4 py-2.5 text-[15px] text-[var(--color-ink)] outline-none transition-shadow placeholder:text-[var(--color-muted)] disabled:cursor-not-allowed ${
                            phase === "done" && !hasLive ? "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[#f6f3ee]" : ""
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={phase !== "done" || !draft.trim() || typing}
                          aria-label={t("send")}
                          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--color-primary)] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Send size={16} />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                </div>

                {/* The guide: one step at a time, with what the business gains */}
                <div className="flex min-w-0 flex-col gap-4 border-t border-[var(--color-border)] p-4 md:p-6 lg:border-l lg:border-t-0">
                  {phase === "playing" ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-semibold text-[var(--color-primary)]">
                          {created.pains.length > 1 ? `${t("chapterLabel", { n: chapter + 1, total: created.pains.length })} · ` : ""}
                          {t("guideStep", { n: Math.min(sentSteps + 1, clientSteps), total: clientSteps })}
                        </p>
                        <button
                          type="button"
                          onClick={skip}
                          className="cursor-pointer rounded-full px-2.5 py-1 text-[12.5px] font-medium text-[var(--color-muted)] hover:bg-[var(--color-mist)] hover:text-[var(--color-ink)]"
                        >
                          {t("skipToSummary")}
                        </button>
                      </div>
                      <div className="flex gap-1.5" aria-hidden="true">
                        {Array.from({ length: clientSteps }).map((_, i) => (
                          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-mist)]">
                            <motion.span
                              className="block h-full rounded-full bg-[var(--color-primary)]"
                              initial={false}
                              animate={{ width: i < sentSteps ? "100%" : "0%" }}
                              transition={{ duration: 0.4 }}
                            />
                          </span>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`guide-${run}-${engine.log.length}-${awaitingTap ? "wait" : "work"}`}
                          initial={reduce ? undefined : { opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduce ? undefined : { opacity: 0, y: -6 }}
                          transition={{ duration: 0.3, ease }}
                          className="rounded-[22px] bg-[var(--color-fog)] p-5 ring-1 ring-[var(--color-border)] md:p-6"
                        >
                          {awaitingTap && suggested ? (
                            <>
                              <p className="text-display text-[1.35rem] font-semibold leading-tight text-[var(--color-ink)] md:text-[1.6rem]">
                                {guideTitle}
                              </p>
                              {botAsking && lastBot?.benefit ? (
                                <p className="mt-3 flex items-start gap-2 rounded-2xl bg-[#e8f7ef] px-3.5 py-2.5 text-[15px] font-medium leading-snug text-[#15803d]">
                                  <BadgeCheck size={18} className="mt-0.5 shrink-0" />
                                  <span>
                                    <span className="block text-[11px] font-semibold uppercase tracking-wider opacity-80">{t("benefitLabel")}</span>
                                    {lastBot.benefit}
                                  </span>
                                </p>
                              ) : (
                                <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-muted)]">{guideBody}</p>
                              )}
                              <motion.button
                                type="button"
                                onClick={() => answer(suggested)}
                                whileTap={{ scale: 0.97 }}
                                className="relative mt-5 flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl bg-[var(--color-primary)] px-4 py-3.5 text-left text-white shadow-[0_14px_30px_-12px_rgba(124,77,255,0.9)]"
                              >
                                {/* Time left before it carries on by itself */}
                                <motion.span
                                  aria-hidden="true"
                                  className="absolute inset-y-0 left-0 bg-white/15"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: waitMs / 1000, ease: "linear" }}
                                />
                                <motion.span
                                  aria-hidden="true"
                                  className="relative text-2xl"
                                  animate={reduce ? undefined : { y: [0, -4, 0] }}
                                  transition={{ duration: 0.9, repeat: Infinity }}
                                >
                                  👆
                                </motion.span>
                                <span className="relative min-w-0">
                                  <span className="block text-[12px] font-semibold uppercase tracking-wider text-white/80">{t("sendAsClient")}</span>
                                  <span className="block text-[16px] font-semibold leading-snug">«{suggested.label}»</span>
                                </span>
                                <ArrowRight size={20} className="relative ml-auto shrink-0" />
                              </motion.button>
                              {choices.length > 1 ? (
                                <div className="mt-3">
                                  <p className="text-[13px] font-semibold text-[var(--color-muted)]">{t("orAnswer")}</p>
                                  <div className="mt-1.5 flex flex-wrap gap-2">
                                    {choices.slice(1).map((choice) => (
                                      <button
                                        key={choice.label}
                                        type="button"
                                        onClick={() => answer(choice)}
                                        className="cursor-pointer rounded-full border border-[var(--color-primary)]/30 bg-white px-3.5 py-2 text-[14px] font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-soft)]"
                                      >
                                        {choice.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                              <p className="mt-3 text-center text-[12.5px] text-[var(--color-muted)]">{t("autoNote")}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-display text-[1.35rem] font-semibold leading-tight text-[var(--color-ink)] md:text-[1.6rem]">
                                {upcoming ?? lastMessage?.caption ?? t("starting")}
                              </p>
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
                                {t("guideTyping")}
                              </p>
                            </>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* What the business has gained so far */}
                      {earned.length ? (
                        <div>
                          <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t("earnedLabel")}</p>
                          <ul className="mt-2 space-y-1.5">
                            <AnimatePresence initial={false}>
                              {earned.map((benefit) => (
                                <motion.li
                                  key={benefit}
                                  initial={reduce ? undefined : { opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex items-start gap-2 text-[14px] leading-snug text-[var(--color-ink)]"
                                >
                                  <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                                  {benefit}
                                </motion.li>
                              ))}
                            </AnimatePresence>
                          </ul>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    /* End of a situation: what the business gained, then the next situation or the next step */
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
                          {engine.end?.outcome}
                        </p>
                        <p className="text-display mt-1 text-[1.5rem] font-semibold leading-tight text-[var(--color-ink)] md:text-[1.8rem]">
                          {t(nextChapter ? "summaryTitle" : "summaryAllTitle", { name: created.business.name })}
                        </p>
                        <p className="mt-1 text-[15px] text-[var(--color-muted)]">{t("summaryText")}</p>
                      </div>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {(nextChapter ? earned : highlights).map((result, i) => (
                          <motion.li
                            key={result}
                            initial={reduce ? undefined : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.12 }}
                            className="flex items-start gap-2.5 rounded-2xl bg-[var(--color-fog)] p-3 text-[14.5px] font-medium leading-snug text-[var(--color-ink)] ring-1 ring-[var(--color-border)]"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f7ef] text-[var(--color-success)]">
                              <Check size={14} strokeWidth={3} />
                            </span>
                            {result}
                          </motion.li>
                        ))}
                      </ul>
                      <p className="flex items-center gap-2 rounded-2xl bg-[var(--color-primary-soft)] px-4 py-3 text-[15px] font-semibold text-[var(--color-primary)]">
                        <Clock size={17} className="shrink-0" />
                        {t("summaryTime")}
                      </p>
                      {replySeconds !== null ? (
                        <p className="flex items-center gap-2 rounded-2xl bg-[#e8f7ef] px-4 py-3 text-[15px] font-semibold text-[#15803d]">
                          <Timer size={17} className="shrink-0" />
                          {t("replyTime", { s: replySeconds })}
                        </p>
                      ) : null}

                      {nextChapter ? (
                        <NextSituation
                          label={t("nextSituation")}
                          name={t(`pains.${nextChapter}`)}
                          icon={painIcons[nextChapter]}
                          onClick={goNext}
                        />
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
                                onClick={wantQuote}
                                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-primary-soft)]"
                              >
                                {t("ctaQuote")}
                                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                              </a>
                              <a
                                href={buildWhatsAppLink(
                                  t("whatsappMessage", { name: created.business.name, kind: created.kind, services: `${servicesText} (${painsText})` }),
                                )}
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
                      <button
                        type="button"
                        onClick={replay}
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
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}

function NextSituation({
  label,
  name,
  icon: Icon,
  onClick,
}: {
  label: string;
  name: string;
  icon: typeof MessageCircle;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[var(--color-primary)] px-4 py-3.5 text-left text-white shadow-[0_14px_30px_-12px_rgba(124,77,255,0.9)]"
    >
      <Icon size={22} className="shrink-0" />
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold uppercase tracking-wider text-white/80">{label}</span>
        <span className="block text-[16px] font-semibold">{name}</span>
      </span>
      <ArrowRight size={20} className="ml-auto shrink-0 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function ChatBubble({
  message,
  active,
  suggested,
  onPick,
}: {
  message: ChatMessage;
  /** The last message: its answers can be tapped. */
  active: boolean;
  suggested?: string;
  onPick: (label: string) => void;
}) {
  if (message.from === "note") {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto my-1 w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[var(--color-muted)]"
      >
        {message.text}
      </motion.p>
    );
  }

  const fromBot = message.from === "bot";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease }}
      className={`flex max-w-[88%] flex-col gap-1.5 ${fromBot ? "items-start" : "ml-auto items-end"}`}
    >
      <p
        className={`whitespace-pre-line rounded-2xl px-3.5 py-2 text-[14px] leading-snug ${
          fromBot
            ? "rounded-tl-sm bg-white text-[var(--color-ink)] shadow-[0_1px_1px_rgba(0,0,0,0.06)]"
            : "rounded-tr-sm bg-[var(--color-primary)] text-white"
        }`}
      >
        {message.text}
      </p>
      {message.card ? <DemoCard card={message.card} /> : null}
      {message.choices?.length && (active || !message.chosen) ? (
        <div className="flex flex-wrap gap-1.5">
          {message.choices.map((label) =>
            active ? (
              <motion.button
                key={label}
                type="button"
                onClick={() => onPick(label)}
                animate={label === suggested ? { scale: [1, 1.06, 1] } : undefined}
                transition={{ duration: 1.2, repeat: Infinity }}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-[13.5px] font-semibold transition-colors ${
                  label === suggested
                    ? "bg-[var(--color-primary)] text-white shadow-[0_0_0_4px_rgba(124,77,255,0.25)]"
                    : "bg-white text-[var(--color-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.12)] ring-1 ring-[var(--color-primary)]/30 hover:bg-[var(--color-primary-soft)]"
                }`}
              >
                {label === suggested ? "👆 " : ""}
                {label}
              </motion.button>
            ) : (
              <span
                key={label}
                className={`rounded-full px-3 py-1 text-[13px] font-semibold ${
                  label === message.chosen ? "bg-[var(--color-ink)] text-white" : "bg-white/60 text-[var(--color-muted)]"
                }`}
              >
                {label}
              </span>
            ),
          )}
        </div>
      ) : null}
    </motion.div>
  );
}

function DemoCard({ card }: { card: CardData }) {
  return (
    <div
      className={`w-[250px] max-w-full rounded-2xl bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.08)] ${
        card.kind === "calendar" ? "border-l-4 border-[var(--color-primary)]" : ""
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-primary)]">{card.title}</p>
      {/* Quotes: the item wraps and the price stays in its column. Calendar: the time stays and the detail wraps. */}
      <ul
        className={`mt-2 grid gap-x-3 gap-y-1.5 text-[12.5px] leading-snug text-[var(--color-ink)] ${
          card.kind === "quote" ? "grid-cols-[1fr_auto]" : "grid-cols-[auto_1fr]"
        }`}
      >
        {card.lines.map(([label, value]) => (
          <li key={label} className="contents">
            <span className={card.kind === "quote" ? "text-[var(--color-muted)]" : "whitespace-nowrap text-[var(--color-muted)]"}>
              {label}
            </span>
            <span className={`font-medium tabular-nums ${card.kind === "quote" ? "whitespace-nowrap text-right" : "text-right"}`}>
              {value}
            </span>
          </li>
        ))}
      </ul>
      {card.total ? (
        <p className="mt-2 flex justify-between gap-3 border-t border-[var(--color-border)] pt-2 text-[13px] font-semibold text-[var(--color-ink)]">
          <span>Total</span>
          <span className="tabular-nums">{card.total}</span>
        </p>
      ) : null}
    </div>
  );
}
