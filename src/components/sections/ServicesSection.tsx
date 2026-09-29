"use client";

import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import {
  Bot,
  FileCheck2,
  Globe,
  QrCode,
  ArrowRight,
  Check,
  CalendarCheck,
  Clock,
  Send,
  Plus,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { useFormPrefill, type SolutionInterest } from "@/lib/FormPrefillContext";

export type ServiceKey = "web" | "agents" | "automation" | "menus";

const services = [
  { key: "web", solutionInterest: "website" },
  { key: "agents", solutionInterest: "aiAgent" },
  { key: "automation", solutionInterest: "quotes" },
  { key: "menus", solutionInterest: "menu" },
] satisfies { key: ServiceKey; solutionInterest: SolutionInterest }[];

// Each service gets its own color so the four offers are easy to tell apart at a
// glance. `strong` is used behind white text and meets 4.5:1 contrast.
export const themes: Record<ServiceKey, { accent: string; strong: string; soft: string; ink: string }> = {
  web: { accent: "#7c4dff", strong: "#6a3af0", soft: "#f1ebff", ink: "#4c25c9" },
  agents: { accent: "#2f7cf6", strong: "#2563eb", soft: "#e6f0ff", ink: "#1d4fb8" },
  automation: { accent: "#f59e0b", strong: "#b45309", soft: "#fff4e0", ink: "#92400e" },
  menus: { accent: "#1f9d63", strong: "#15803d", soft: "#e2f6ec", ink: "#14653f" },
};

export const serviceIcons = { web: Globe, agents: Bot, automation: FileCheck2, menus: QrCode };

export function WebVisual({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative w-full max-w-[300px]">
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[var(--shadow-float)]">
        <div className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex items-center gap-1 rounded-full bg-[var(--color-mist)] px-2 py-0.5 text-[11px] text-[var(--color-muted)]">
            <Globe size={10} />
            {t("items.web.visual.url")}
          </span>
        </div>
        <div className="space-y-1.5 p-4">
          <p className="text-base font-semibold text-[var(--color-ink)]">{t("items.web.visual.business")}</p>
          <p className="text-xs text-[var(--color-muted)]">{t("items.web.visual.tagline")}</p>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--svc-strong)] px-3.5 py-1.5 text-xs font-semibold text-white">
            <CalendarCheck size={13} />
            {t("items.web.visual.button")}
          </span>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-2 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] shadow-[var(--shadow-float)]">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
          <Check size={10} strokeWidth={3} />
        </span>
        {t("items.web.visual.badge")}
      </div>
    </div>
  );
}

export function AgentsVisual({ t, slots }: { t: (key: string) => string; slots: string[] }) {
  return (
    <div className="w-full max-w-[300px] space-y-2 rounded-2xl bg-white p-3.5 shadow-[var(--shadow-float)]">
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[var(--color-mist)] px-3 py-2 text-[13px] text-[var(--color-ink)]">
        {t("items.agents.visual.question")}
      </div>
      <div className="ml-auto max-w-[90%] space-y-2 rounded-2xl rounded-tr-sm bg-[var(--svc-strong)] px-3 py-2 text-[13px] text-white">
        <p>{t("items.agents.visual.answer")}</p>
        <div className="flex gap-1.5">
          {slots.map((slot) => (
            <span key={slot} className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
              {slot}
            </span>
          ))}
        </div>
      </div>
      <p className="flex items-center gap-1 pt-0.5 text-[11px] font-medium text-[var(--svc-ink)]">
        <Clock size={11} />
        {t("items.agents.visual.status")}
      </p>
    </div>
  );
}

export function QuoteVisual({ t, rows }: { t: (key: string) => string; rows: { label: string; value: string }[] }) {
  return (
    <div className="w-full max-w-[300px] rounded-2xl bg-white p-4 shadow-[var(--shadow-float)]">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--svc-soft)] text-[var(--svc-ink)]">
          <FileCheck2 size={14} />
        </span>
        <p className="text-sm font-semibold text-[var(--color-ink)]">{t("items.automation.visual.title")}</p>
      </div>
      <dl className="space-y-1.5 text-[13px]">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-3 border-b border-dashed border-black/10 pb-1.5">
            <dt className="text-[var(--color-muted)]">{row.label}</dt>
            <dd className="font-medium text-[var(--color-ink)]">{row.value}</dd>
          </div>
        ))}
      </dl>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--svc-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--svc-ink)]">
        <Send size={11} />
        {t("items.automation.visual.status")}
      </span>
    </div>
  );
}

export function MenuVisual({ t, items }: { t: (key: string) => string; items: string[] }) {
  return (
    <div className="flex w-full max-w-[300px] items-center gap-3">
      <div className="flex shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-white p-3 shadow-[var(--shadow-float)]">
        <QrCode size={44} className="text-[var(--color-ink)]" />
        <span className="max-w-[72px] text-center text-[10px] leading-tight text-[var(--color-muted)]">
          {t("items.menus.visual.scan")}
        </span>
      </div>
      <div className="flex-1 space-y-1.5 rounded-2xl bg-white p-2.5 shadow-[var(--shadow-float)]">
        {items.map((item) => (
          <div key={item} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--color-mist)] px-2.5 py-1.5">
            <span className="text-xs font-medium text-[var(--color-ink)]">{item}</span>
            <span className="flex items-center gap-0.5 rounded-full bg-[var(--svc-strong)] px-2 py-0.5 text-[10px] font-semibold text-white">
              <Plus size={10} strokeWidth={3} />
              {t("items.menus.visual.add")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServicesSection() {
  const t = useTranslations("services");
  const { requestContact } = useFormPrefill();

  function renderVisual(key: ServiceKey) {
    if (key === "web") return <WebVisual t={t} />;
    if (key === "agents") return <AgentsVisual t={t} slots={t.raw("items.agents.visual.slots") as string[]} />;
    if (key === "automation")
      return <QuoteVisual t={t} rows={t.raw("items.automation.visual.rows") as { label: string; value: string }[]} />;
    return <MenuVisual t={t} items={t.raw("items.menus.visual.items") as string[]} />;
  }

  return (
    <section id="servicios" className="py-16 md:py-24">
      <Container>
        <SectionHeading align="center" title={t("title")} description={t("subtitle")} />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {services.map(({ key, solutionInterest }, index) => {
            const Icon = serviceIcons[key];
            const theme = themes[key];
            const benefits = t.raw(`items.${key}.benefits`) as string[];
            const style = {
              "--svc-accent": theme.accent,
              "--svc-strong": theme.strong,
              "--svc-soft": theme.soft,
              "--svc-ink": theme.ink,
            } as CSSProperties;

            return (
              <Reveal key={key} delay={index * 0.06} className="h-full">
                <article
                  style={style}
                  className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]"
                >
                  {/* Example of the service in action, on the service's own color. */}
                  <div
                    aria-hidden="true"
                    className="relative flex min-h-[210px] items-center justify-center px-6 pb-9 pt-7"
                    style={{
                      background: `radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, ${theme.accent} 28%, transparent), transparent 60%), ${theme.soft}`,
                    }}
                  >
                    {renderVisual(key)}
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--svc-soft)] text-[var(--svc-ink)]">
                        <Icon size={20} />
                      </span>
                      <h3 className="text-xl font-semibold text-[var(--color-ink)]">{t(`items.${key}.name`)}</h3>
                    </div>

                    <p className="text-base leading-relaxed text-[var(--color-muted)]">
                      {t(`items.${key}.description`)}
                    </p>

                    <p className="flex items-start gap-2 text-sm text-[var(--color-ink)]">
                      <Users size={16} className="mt-0.5 shrink-0 text-[var(--svc-ink)]" />
                      <span>
                        <span className="font-semibold">{t("idealForLabel")}:</span> {t(`items.${key}.idealFor`)}
                      </span>
                    </p>

                    <ul className="space-y-2.5">
                      {benefits.map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2.5 text-[15px] text-[var(--color-ink)]">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--svc-soft)] text-[var(--svc-ink)]">
                            <Check size={12} strokeWidth={3} />
                          </span>
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <a
                      href="#contacto"
                      onClick={() =>
                        requestContact({
                          mainTask: t(`items.${key}.name`),
                          solutionInterest,
                        })
                      }
                      className="mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--svc-strong)] px-6 text-base font-semibold text-white transition-[filter,gap] hover:gap-3 hover:brightness-110 focus-visible:outline-offset-4 sm:w-fit"
                    >
                      {t(`items.${key}.cta`)}
                      <ArrowRight size={16} />
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
