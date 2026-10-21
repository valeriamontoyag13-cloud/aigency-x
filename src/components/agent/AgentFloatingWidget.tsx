"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ArrowRight, MessageCircle } from "lucide-react";
import { AgentOrb } from "./AgentOrb";
import { buildWhatsAppLink } from "@/config/contact";
import { useFormPrefill, type SolutionInterest } from "@/lib/FormPrefillContext";

const options = [
  { key: "customerService", solutionInterest: "chatbot" },
  { key: "appointments", solutionInterest: "appointments" },
  { key: "website", solutionInterest: "website" },
  { key: "notSure", solutionInterest: "notSure" },
] satisfies { key: string; solutionInterest: SolutionInterest }[];

type Option = (typeof options)[number];
type Line = { from: "agent" | "user"; text: string };

/** Fired by any "ask our agent" button on the page to open this chat. */
export const OPEN_AGENT_EVENT = "aigency:open-agent";

const TEASER_KEY = "aigencyx_agent_teaser_seen";

/**
 * AIgency's floating agent: a small chat that answers the frequent questions
 * and, when asked, helps the visitor pick where to start. A teaser bubble
 * lets people know they can ask it anything.
 */
export function AgentFloatingWidget() {
  const t = useTranslations("agentFloating");
  const faq = useTranslations("faq");
  const form = useTranslations("form");
  const reduce = useReducedMotion();
  const { requestContact } = useFormPrefill();
  const questions = faq.raw("items") as { q: string; a: string }[];

  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [demoInView, setDemoInView] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<"faq" | "improve">("faq");
  const [asked, setAsked] = useState<string[]>([]);
  const [selected, setSelected] = useState<Option | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Show the teaser once per visit, a few seconds after the page loads.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(TEASER_KEY) === "1";
    } catch {}
    if (seen) return;
    const id = window.setTimeout(() => setTeaser(true), 6000);
    return () => window.clearTimeout(id);
  }, []);

  // The teaser says hello and goes away by itself, so it never sits over the page on phones.
  useEffect(() => {
    if (!teaser) return;
    const id = window.setTimeout(() => setTeaser(false), 10000);
    return () => window.clearTimeout(id);
  }, [teaser]);

  // Keep the teaser out of the way while the visitor is using the hero's
  // "try it" card, the demo phone or the contact form.
  useEffect(() => {
    const targets = [...document.querySelectorAll("#top form, #prueba, #contacto")];
    if (!targets.length) return;
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
        setDemoInView(visible.size > 0);
      },
      { threshold: 0.2 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onOpen() {
      openChat();
    }
    window.addEventListener(OPEN_AGENT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_AGENT_EVENT, onOpen);
  });

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [lines, typing, reduce]);

  function dismissTeaser() {
    setTeaser(false);
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {}
  }

  function openChat() {
    dismissTeaser();
    if (open) return;
    setOpen(true);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 650);
    if (lines.length === 0) setLines([{ from: "agent", text: t("greeting") }]);
  }

  function closeChat() {
    setOpen(false);
  }

  /** Adds the visitor's message, then the agent's answer after a short "typing". */
  function say(question: string, answer: string) {
    setLines((l) => [...l, { from: "user", text: question }]);
    if (reduce) {
      setLines((l) => [...l, { from: "agent", text: answer }]);
      return;
    }
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setLines((l) => [...l, { from: "agent", text: answer }]);
    }, 700);
  }

  function askFaq(item: { q: string; a: string }) {
    setAsked((a) => [...a, item.q]);
    say(item.q, item.a);
  }

  function startImprove() {
    setMode("improve");
    say(t("improveChip"), t("title"));
  }

  function pickOption(option: Option) {
    setSelected(option);
    setMode("faq");
    say(t(`options.${option.key}`), t(`responses.${option.key}`));
  }

  function goToForm() {
    requestContact({
      mainTask: selected ? t(`options.${selected.key}`) : t("formTask"),
      solutionInterest: selected?.solutionInterest ?? "notSure",
    });
    document.querySelector("#contacto")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    setOpen(false);
  }

  const pending = questions.filter((item) => !asked.includes(item.q));
  const chip =
    "rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-left text-[13px] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] cursor-pointer";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="flex max-h-[min(560px,calc(100svh-120px))] w-[340px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-[var(--radius-floating)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-float)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
              <AgentOrb size={32} label={t("agentLabel")} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-ink)]">{t("agentLabel")}</p>
                <p className="text-xs text-[var(--color-success)]">{typing ? t("typing") : t("online")}</p>
              </div>
              <button
                type="button"
                onClick={closeChat}
                aria-label={t("close")}
                className="cursor-pointer text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conversation */}
            <div ref={bodyRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
              {lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={reduce ? undefined : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`w-fit max-w-[88%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed ${
                    line.from === "agent"
                      ? "rounded-tl-sm bg-[var(--color-mist)] text-[var(--color-ink)]"
                      : "ml-auto rounded-tr-sm bg-[var(--color-primary)] text-white"
                  }`}
                >
                  {line.text}
                </motion.p>
              ))}
              {typing ? (
                <div className="flex w-fit gap-1 rounded-2xl rounded-tl-sm bg-[var(--color-mist)] px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-[var(--color-muted)]"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              ) : null}

              {/* Suggested questions */}
              {!typing ? (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {mode === "improve"
                    ? options.map((option) => (
                        <button key={option.key} type="button" onClick={() => pickOption(option)} className={chip}>
                          {t(`options.${option.key}`)}
                        </button>
                      ))
                    : (
                      <>
                        {pending.map((item) => (
                          <button key={item.q} type="button" onClick={() => askFaq(item)} className={chip}>
                            {item.q}
                          </button>
                        ))}
                        <button type="button" onClick={startImprove} className={chip}>
                          {t("improveChip")}
                        </button>
                      </>
                    )}
                </div>
              ) : null}
            </div>

            {/* Talk to a person */}
            <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-border)] p-3">
              <a
                href={buildWhatsAppLink(form("whatsappMessage"))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
              >
                <MessageCircle size={13} />
                {t("actions.whatsapp")}
              </a>
              <button
                type="button"
                onClick={goToForm}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--color-primary)]"
              >
                {t("actions.form")}
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <AnimatePresence>
          {teaser && !open && !demoInView ? (
            <motion.div
              initial={reduce ? undefined : { opacity: 0, x: 12, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, x: 12, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative flex items-center gap-2 rounded-2xl rounded-br-sm bg-white py-2.5 pl-4 pr-2 shadow-[var(--shadow-float)]"
            >
              <button type="button" onClick={openChat} className="cursor-pointer text-left text-sm font-medium text-[var(--color-ink)]">
                {t("teaser")}
              </button>
              <button
                type="button"
                onClick={dismissTeaser}
                aria-label={t("close")}
                className="cursor-pointer rounded-full p-1 text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                <X size={14} />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => (open ? closeChat() : openChat())}
          aria-label={t("ariaLabel")}
          aria-expanded={open}
          className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-[var(--color-surface)] shadow-[var(--shadow-float)] transition-transform hover:scale-105"
        >
          {open ? (
            <X size={20} className="text-[var(--color-ink)]" />
          ) : (
            <AgentOrb size={44} pulse={pulse} label={t("agentLabel")} />
          )}
        </button>
      </div>
    </div>
  );
}
