"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Clock, Info, MessageCircle, Pencil, Timer, Trophy } from "lucide-react";
import type { BusinessKey, PainKey } from "@/content/demoBusinesses";
import { demoBusinesses } from "@/content/demoBusinesses";
import type { Currency } from "@/lib/money";

/** What the visitor told the demo: it travels to the moments demo in the iframe's hash. */
export type MomentosDemo = {
  key: BusinessKey;
  custom: string;
  name: string;
  owner: string;
  address?: string;
  currency: Currency;
  services: { name: string; amount: number }[];
  pains: PainKey[];
};

const ease = [0.22, 1, 0.36, 1] as const;

/** A moment the visitor finished, as the demo reports it: what the business gains and the minutes it saves. */
type Seen = { titulo: string; gana: string[]; min: number };
type DemoMessage =
  | { tipo: "aigx-demo-alto"; alto: number }
  | { tipo: "aigx-momentos"; total: number }
  | ({ tipo: "aigx-momento"; i: number } & Seen)
  | { tipo: "aigx-respuesta"; ms: number; promedio: number; ia: boolean };

/**
 * The visitor's demo as the moments of demo-citas (public/demo-momentos, built by
 * demo-citas/fuente-demo/build-web.js): the same scenes the real product runs, with
 * their business, services and prices, and a chat answered by the real assistant
 * in n8n. The demo lives in an iframe that reports its height.
 */
export function DemoMomentos({
  demo,
  onEdit,
  onQuote,
  whatsappHref,
}: {
  demo: MomentosDemo;
  onEdit: () => void;
  onQuote: () => void;
  whatsappHref: string;
}) {
  const t = useTranslations("myDemo");
  const reduce = useReducedMotion();
  const [height, setHeight] = useState(900);
  // The summary, as the visitor goes through the moments (the demo reports each one it finishes).
  const [total, setTotal] = useState(0);
  const [seen, setSeen] = useState<Record<number, Seen>>({});
  const [replySeconds, setReplySeconds] = useState<number | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as DemoMessage;
      if (data?.tipo === "aigx-demo-alto" && typeof data.alto === "number") setHeight(Math.max(480, data.alto));
      if (data?.tipo === "aigx-momentos") {
        setTotal(data.total);
        setSeen({});
        setReplySeconds(null);
      }
      if (data?.tipo === "aigx-momento" && Array.isArray(data.gana)) {
        setSeen((list) => ({ ...list, [data.i]: { titulo: String(data.titulo), gana: data.gana.map(String).slice(0, 3), min: Number(data.min) || 0 } }));
      }
      if (data?.tipo === "aigx-respuesta" && typeof data.promedio === "number") setReplySeconds(data.promedio);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const watched = Object.values(seen);
  const allSeen = total > 0 && watched.length >= total;
  const savedMinutes = watched.reduce((sum, m) => sum + m.min, 0);
  const gains = Array.from(new Set(watched.flatMap((m) => m.gana.slice(0, 2)))).slice(0, 8);

  const hash = encodeURIComponent(
    JSON.stringify({
      n: demo.name,
      d: demo.owner,
      dir: demo.address ?? "",
      r: demo.key,
      k: demo.custom,
      s: demo.services.map((s) => [s.name, s.amount]),
      c: demo.currency,
      p: demo.pains,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  );

  return (
    <motion.div
      key="stage-momentos"
      initial={reduce ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease }}
      className="overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(27,23,48,0.05)]"
    >
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#a57bff] to-[#7c4dff] text-xl">
            {demoBusinesses[demo.key].emoji}
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
            <p className="text-[13.5px] leading-snug text-[var(--color-muted)]">{t("momentosText")}</p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-2">
        <iframe
          key={hash}
          src={`/demo-momentos/index.html#${hash}`}
          title={t("momentosFrame", { name: demo.name })}
          className="block w-full border-0"
          style={{ height }}
        />
      </div>

      {watched.length ? (
        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="flex flex-col gap-4 border-t border-[var(--color-border)] p-4 md:px-6 md:py-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-success)]">
                <Trophy size={15} />
                {t("momentosProgress", { n: watched.length, total: Math.max(total, watched.length) })}
              </p>
              <p className="text-display mt-1 text-[1.4rem] font-semibold leading-tight text-[var(--color-ink)] md:text-[1.6rem]">
                {t(allSeen ? "summaryAllTitle" : "summaryTitle", { name: demo.name })}
              </p>
              <p className="mt-1 text-[15px] text-[var(--color-muted)]">{allSeen ? t("summaryText") : t("momentosMissing")}</p>
            </div>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {gains.map((gain) => (
              <li
                key={gain}
                className="flex items-start gap-2.5 rounded-2xl bg-[var(--color-fog)] p-3 text-[14.5px] font-medium leading-snug text-[var(--color-ink)] ring-1 ring-[var(--color-border)]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f7ef] text-[var(--color-success)]">
                  <Check size={14} strokeWidth={3} />
                </span>
                {gain}
              </li>
            ))}
          </ul>
          <div className="grid gap-2 sm:grid-cols-3">
            <p className="flex items-center gap-2 rounded-2xl bg-[var(--color-primary-soft)] px-4 py-3 text-[15px] font-semibold text-[var(--color-primary)]">
              <Clock size={17} className="shrink-0" />
              {t("summaryTime")}
            </p>
            <p className="flex items-center gap-2 rounded-2xl bg-[var(--color-primary-soft)] px-4 py-3 text-[15px] font-semibold text-[var(--color-primary)]">
              <Trophy size={17} className="shrink-0" />
              {t("momentosSaved", { min: savedMinutes })}
            </p>
            {replySeconds !== null ? (
              <p className="flex items-center gap-2 rounded-2xl bg-[var(--color-primary-soft)] px-4 py-3 text-[15px] font-semibold text-[var(--color-primary)]">
                <Timer size={17} className="shrink-0" />
                {t("momentosReply", { s: replySeconds })}
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : null}

      <div className="grid gap-3 border-t border-[var(--color-border)] p-4 md:grid-cols-[1fr_auto] md:items-center md:px-6">
        <p className="flex items-start gap-2 text-[14px] leading-snug text-[var(--color-ink)]">
          <Info size={17} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
          <span>
            <span className="font-semibold">{t("demoDisclaimerTitle")}</span> {t("demoDisclaimer")}
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="#contacto"
            onClick={onQuote}
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-primary)]"
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
    </motion.div>
  );
}
