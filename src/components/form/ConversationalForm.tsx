"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Loader2, Mail, MessageCircle, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildGmailLink, buildWhatsAppLink } from "@/config/contact";
import { useFormPrefill, type SolutionInterest } from "@/lib/FormPrefillContext";
import {
  contactChannels,
  formSteps,
  interestToTasks,
  tasksByBusiness,
  optionEmoji,
  timelines,
  type ContactChannel,
  type FormStepKey,
} from "./formSteps";

const LEGACY_DRAFT_KEYS = [
  "aigencyx_form_draft",
  "iagencyx_form_draft_v2",
  "iagencyx_form_draft_v3",
  "iagencyx_form_draft_v4",
];
const CONTACT_INDEX = formSteps.length;
const TOTAL = formSteps.length + 1;

type Answers = Record<FormStepKey, string[]> & { businessOther: string; tasksOther: string };
type Contact = { name: string; channel: ContactChannel; phone: string; email: string; timeline: string };

const emptyAnswers: Answers = {
  businessType: [],
  tasks: [],
  clientSource: [],
  website: [],
  hoursLost: [],
  businessOther: "",
  tasksOther: "",
};
const emptyContact: Contact = { name: "", channel: "whatsapp", phone: "", email: "", timeline: "" };
const otherField: Partial<Record<FormStepKey, "businessOther" | "tasksOther">> = {
  businessType: "businessOther",
  tasks: "tasksOther",
};
const channelIcons: Record<ContactChannel, LucideIcon> = { whatsapp: MessageCircle, email: Mail };

const inputClass =
  "w-full rounded-2xl border border-black/10 bg-white px-5 py-4 text-[16px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)]";

export function ConversationalForm() {
  const t = useTranslations("form");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const { prefill } = useFormPrefill();

  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [contact, setContact] = useState<Contact>(emptyContact);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [interest, setInterest] = useState<SolutionInterest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    // The form always starts empty. Earlier versions saved drafts in the
    // browser, which made old answers show up pre-selected; clear them.
    try {
      for (const key of LEGACY_DRAFT_KEYS) window.localStorage.removeItem(key);
    } catch {
      // Storage may be unavailable (private mode); nothing to clean up then.
    }
  }, []);

  useEffect(() => {
    // `prefill` is a command from a CTA elsewhere on the page; this effect
    // reacts to that external event.
    if (!prefill?.solutionInterest) return;
    const preset = interestToTasks[prefill.solutionInterest] ?? [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInterest(prefill.solutionInterest);
    setAnswers((prev) => ({ ...prev, tasks: Array.from(new Set([...prev.tasks, ...preset])) }));
  }, [prefill]);

  useEffect(
    () => () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    },
    [],
  );

  const isContactStep = index === CONTACT_INDEX;
  const step = isContactStep ? null : formSteps[index];
  const taskOptions = tasksByBusiness[answers.businessType[0] ?? "other"] ?? tasksByBusiness.other;
  const stepOptions = step?.key === "tasks" ? taskOptions : (step?.options ?? []);

  function goTo(next: number) {
    setDirection(next > index ? 1 : -1);
    setError(null);
    setIndex(Math.max(0, Math.min(next, CONTACT_INDEX)));
  }

  function validate(): string | null {
    if (isContactStep) {
      if (!contact.name.trim()) return t("validation.required");
      if (contact.channel === "email") return /^\S+@\S+\.\S+$/.test(contact.email) ? null : t("validation.email");
      return contact.phone.replace(/\D/g, "").length >= 7 ? null : t("validation.phone");
    }
    if (!step) return null;
    const selected = answers[step.key].filter((o) => stepOptions.includes(o));
    if (!selected.length) return t("validation.choose");
    const field = otherField[step.key];
    // "Other" on the business question needs a description; on tasks it's optional.
    if (step.key === "businessType" && field && selected.includes("other") && !answers[field].trim()) {
      return t("validation.required");
    }
    return null;
  }

  function goNext() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (isContactStep) {
      void submit();
      return;
    }
    goTo(index + 1);
  }

  function choose(option: string) {
    if (!step) return;
    setError(null);
    if (step.multi) {
      setAnswers((prev) => {
        const current = prev[step.key];
        const next = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
        return { ...prev, [step.key]: next };
      });
      return;
    }
    setAnswers((prev) =>
      step.key === "businessType"
        ? // Keep only the tasks that still exist for the newly chosen business.
          { ...prev, businessType: [option], tasks: prev.tasks.filter((task) => tasksByBusiness[option].includes(task)) }
        : { ...prev, [step.key]: [option] },
    );
    // Single answers move on by themselves, except "Other", which needs typing.
    if (option === step.other) return;
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => goTo(index + 1), 420);
  }

  async function submit() {
    setStatus("submitting");
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: answers.businessType[0],
          businessOther: answers.businessOther,
          tasks: answers.tasks.filter((task) => taskOptions.includes(task)),
          tasksOther: answers.tasksOther,
          clientSource: answers.clientSource[0],
          website: answers.website[0],
          hoursLost: answers.hoursLost[0],
          timeline: contact.timeline || undefined,
          interest: interest ?? undefined,
          channel: contact.channel,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          locale,
        }),
      });
      if (!response.ok) throw new Error("submit_failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function restart() {
    setStatus("idle");
    setAnswers(emptyAnswers);
    setContact(emptyContact);
    setInterest(null);
    setDirection(-1);
    setIndex(0);
  }

  const whatsappLink = buildWhatsAppLink(t("whatsappMessage"));
  const slide = reduce
    ? undefined
    : {
        initial: { opacity: 0, x: direction * 40 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: direction * -40 },
      };

  return (
    <section id="contacto" className="py-20 md:py-28">
      <Container>
        <div className="relative">

          <div className="relative mx-auto max-w-[660px]">
            {status === "success" ? (
              <SuccessView
                name={contact.name.trim().split(" ")[0]}
                channel={t(`contactStep.channel.${contact.channel}`)}
                whatsappLink={whatsappLink}
                onRestart={restart}
              />
            ) : (
              <>
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-mist)] px-3.5 py-1 text-sm text-[var(--color-ink)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    {t("eyebrow")}
                  </span>
                  <h2 className="text-display mt-4 text-2xl font-medium text-[var(--color-ink)] md:text-3xl">{t("title")}</h2>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{t("meta")}</p>
                </div>

                {/* Back + progress dots */}
                <div className="mt-8 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => goTo(index - 1)}
                    aria-label={t("back")}
                    disabled={index === 0}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--color-mist)] text-[var(--color-ink)] transition-opacity hover:bg-[var(--color-primary-soft)] disabled:pointer-events-none disabled:opacity-0"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="flex flex-1 gap-1.5" aria-hidden="true">
                    {Array.from({ length: TOTAL }).map((_, i) => (
                      <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-mist)]">
                        <motion.span
                          className="block h-full rounded-full bg-[var(--color-primary)]"
                          initial={false}
                          animate={{ width: i <= index ? "100%" : "0%" }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </span>
                    ))}
                  </div>
                  <span className="w-9 shrink-0 text-right text-sm tabular-nums text-[var(--color-muted)]">
                    {index + 1}/{TOTAL}
                  </span>
                </div>

                <div
                  className="mt-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
                      e.preventDefault();
                      goNext();
                    }
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={isContactStep ? "contact" : step!.key}
                      {...slide}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {isContactStep ? (
                        <ContactStep
                          contact={contact}
                          update={(patch) => {
                            setContact((c) => ({ ...c, ...patch }));
                            setError(null);
                          }}
                        />
                      ) : (
                        <QuestionStep
                          stepKey={step!.key}
                          options={stepOptions}
                          multi={step!.multi}
                          other={step!.other}
                          selected={answers[step!.key]}
                          otherValue={otherField[step!.key] ? answers[otherField[step!.key]!] : ""}
                          onChoose={choose}
                          onOtherChange={(v) => {
                            const field = otherField[step!.key];
                            if (field) setAnswers((prev) => ({ ...prev, [field]: v }));
                            setError(null);
                          }}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {error || status === "error" ? (
                    <p className="mt-4 text-center text-sm text-[var(--color-danger)]" role="alert">
                      {error ?? t("errorText")}
                    </p>
                  ) : null}

                  {/* Single-choice questions advance on tap; the rest need a button. */}
                  {isContactStep ||
                  step!.multi ||
                  (step!.other !== undefined && answers[step!.key].includes(step!.other)) ? (
                    <div className="mt-6 flex justify-center">
                      <Button variant="primary" onClick={goNext} disabled={status === "submitting"} className="min-w-[180px]">
                        {status === "submitting" ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            {t("submitting")}
                          </>
                        ) : (
                          <>
                            {isContactStep ? t("submit") : t("next")}
                            <ArrowRight size={16} />
                          </>
                        )}
                      </Button>
                    </div>
                  ) : null}
                </div>
              </>
            )}

            {/* Direct channels */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-[var(--color-muted)]">{t("direct")}</p>
              <div className="flex gap-3">
                <DirectLink href={whatsappLink} icon={MessageCircle} label={t("channels.whatsapp")} tint="text-[#15803d]" />
                <DirectLink
                  href={buildGmailLink(t("emailSubject"), t("emailBody"))}
                  icon={Mail}
                  label={t("channels.email")}
                  tint="text-[#c5221f]"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function QuestionStep({
  stepKey,
  options,
  multi,
  other,
  selected,
  otherValue,
  onChoose,
  onOtherChange,
}: {
  stepKey: FormStepKey;
  options: string[];
  multi: boolean;
  other?: string;
  selected: string[];
  otherValue: string;
  onChoose: (option: string) => void;
  onOtherChange: (value: string) => void;
}) {
  const t = useTranslations(`form.steps.${stepKey}`);
  const hint = useTranslations("form")("multiHint");
  const reduce = useReducedMotion();

  return (
    <div>
      <h3 className="text-display text-center text-[1.75rem] font-medium leading-tight text-[var(--color-ink)] md:text-[2.4rem]">
        {t("label")}
      </h3>
      {multi ? <p className="mt-2 text-center text-sm text-[var(--color-muted)]">{hint}</p> : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          const isSelected = selected.includes(option);
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => onChoose(option)}
              aria-pressed={isSelected}
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, scale: isSelected ? 1.02 : 1 }}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.04 }}
              // States use rings (box-shadow) rather than border colors so they stay visible
              // regardless of the global border color rule.
              className={`relative flex cursor-pointer items-center gap-4 rounded-2xl border px-5 py-4 text-left text-[16px] transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/40 ${
                isSelected
                  ? "bg-[var(--color-primary)] font-medium text-white shadow-[0_0_0_2px_var(--color-primary),0_12px_28px_-8px_rgba(124,77,255,0.65)]"
                  : "bg-white text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)] hover:shadow-[0_0_0_2px_var(--color-primary)]"
              }`}
            >
              <motion.span
                aria-hidden="true"
                className="text-[1.6rem] leading-none"
                animate={isSelected && !reduce ? { scale: [1, 1.35, 1], rotate: [0, -10, 0] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                {optionEmoji[stepKey][option]}
              </motion.span>
              <span className="flex-1">{t(`options.${option}`)}</span>
              <AnimatePresence>
                {isSelected ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-primary)]"
                  >
                    <Check size={14} strokeWidth={3} />
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {other && selected.includes(other) ? (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <input
              autoFocus
              type="text"
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder={t("otherPlaceholder")}
              aria-label={t("otherPlaceholder")}
              className={`mt-4 ${inputClass}`}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ContactStep({ contact, update }: { contact: Contact; update: (patch: Partial<Contact>) => void }) {
  const t = useTranslations("form.contactStep");

  return (
    <div>
      <h3 className="text-display text-center text-[1.75rem] font-medium leading-tight text-[var(--color-ink)] md:text-[2.4rem]">
        {t("label")}
      </h3>

      <div className="mx-auto mt-8 max-w-[460px] space-y-3">
        <input
          type="text"
          autoComplete="name"
          value={contact.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder={t("name")}
          aria-label={t("name")}
          className={inputClass}
        />

        <div role="radiogroup" aria-label={t("label")} className="grid grid-cols-2 gap-1 rounded-full bg-[var(--color-mist)] p-1">
          {contactChannels.map((ch) => {
            const Icon = channelIcons[ch];
            const selected = contact.channel === ch;
            return (
              <button
                key={ch}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => update({ channel: ch })}
                className={`relative flex cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-sm transition-colors ${
                  selected ? "text-white" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="contact-channel-pill"
                    className="absolute inset-0 rounded-full bg-[var(--color-ink)]"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                ) : null}
                <Icon size={15} className="relative" />
                <span className="relative">{t(`channel.${ch}`)}</span>
              </button>
            );
          })}
        </div>

        {contact.channel === "email" ? (
          <input
            type="email"
            autoComplete="email"
            value={contact.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder={t("email")}
            aria-label={t("email")}
            className={inputClass}
          />
        ) : (
          <input
            type="tel"
            autoComplete="tel"
            value={contact.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder={t("phone")}
            aria-label={t("phone")}
            className={inputClass}
          />
        )}

        <div className="pt-2 text-center">
          <p className="text-sm text-[var(--color-muted)]">{t("timelineLabel")}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {timelines.map((key) => {
              const selected = contact.timeline === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update({ timeline: selected ? "" : key })}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-[background-color,color,box-shadow] ${
                    selected
                      ? "bg-[var(--color-primary)] font-medium text-white shadow-[0_0_0_2px_var(--color-primary)]"
                      : "bg-white text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)] hover:shadow-[0_0_0_2px_var(--color-primary)]"
                  }`}
                >
                  {t(`timeline.${key}`)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const confetti = ["🎉", "✨", "💜", "🚀", "⭐", "🎊", "✨", "💜", "🎉", "⭐"];

function SuccessView({
  name,
  channel,
  whatsappLink,
  onRestart,
}: {
  name: string;
  channel: string;
  whatsappLink: string;
  onRestart: () => void;
}) {
  const t = useTranslations("form.success");
  const reduce = useReducedMotion();

  return (
    <div className="relative py-10 text-center">
      {!reduce
        ? confetti.map((emoji, i) => {
            const angle = (i / confetti.length) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-16 text-2xl"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{ x: Math.cos(angle) * 170, y: Math.sin(angle) * 110, opacity: 0, scale: 1.2 }}
                transition={{ duration: 1.3, ease: "easeOut" }}
              >
                {emoji}
              </motion.span>
            );
          })
        : null}
      <motion.div
        initial={reduce ? undefined : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
        className="text-6xl"
        aria-hidden="true"
      >
        🥳
      </motion.div>
      <h2 className="text-display mt-6 text-3xl font-medium text-[var(--color-ink)] md:text-4xl">{t("title", { name })}</h2>
      <p className="mx-auto mt-3 max-w-[420px] text-[17px] text-[var(--color-muted)]">{t("text", { channel })}</p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button href={whatsappLink} target="_blank" rel="noopener noreferrer" variant="primary">
          <MessageCircle size={16} />
          {t("whatsapp")}
        </Button>
        <button
          type="button"
          onClick={onRestart}
          className="cursor-pointer text-sm text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-ink)] hover:underline"
        >
          {t("restart")}
        </button>
      </div>
    </div>
  );
}

function DirectLink({
  href,
  icon: Icon,
  label,
  tint,
  sameTab = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  tint: string;
  sameTab?: boolean;
}) {
  return (
    <a
      href={href}
      {...(sameTab ? {} : { target: "_blank", rel: "noopener noreferrer" })}
      className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40"
    >
      <Icon size={16} className={tint} />
      {label}
    </a>
  );
}
