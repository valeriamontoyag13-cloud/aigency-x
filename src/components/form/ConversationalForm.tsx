"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Loader2, Mail, MessageCircle, Rocket, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/config/contact";
import { trackStandard } from "@/lib/metaPixel";
import { useFormPrefill, type SolutionInterest } from "@/lib/FormPrefillContext";
import {
  DEMO_PICK_EVENT,
  LEAD_SENT_KEY,
  SERVICES_PICK_EVENT,
  serviceKeys,
  type DemoPickDetail,
  type ServiceKey,
  type ServicesPickDetail,
} from "@/lib/demoEvents";
import { contactChannels, type ContactChannel } from "./formSteps";

type Contact = { name: string; channel: ContactChannel; phone: string; email: string };
/** What the visitor is interested in: AIgency's services, or "not sure yet". */
type Pick = ServiceKey | "unsure";

const emptyContact: Contact = { name: "", channel: "whatsapp", phone: "", email: "" };
const picks: Pick[] = [...serviceKeys, "unsure"];
const interestFor: Record<Pick, SolutionInterest> = {
  assistant: "aiAgent",
  agenda: "appointments",
  quotes: "quotes",
  website: "website",
  unsure: "notSure",
};
const channelIcons: Record<ContactChannel, LucideIcon> = { whatsapp: MessageCircle, email: Mail };

const inputClass =
  "h-12 w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-[15px] text-[var(--color-ink)] outline-none transition-colors placeholder:text-[var(--color-muted)]/70 focus:border-[var(--color-primary)] aria-[invalid=true]:border-[var(--color-danger)]";

/** The field that needs fixing, so the message shows right under it. */
type Field = "name" | "phone" | "email";

/**
 * Contact: a call to action and the path with AIgency next to a short form
 * (name and WhatsApp or email). What the visitor already told the demo, or the
 * button they came from, travels with the lead so we can quote right away.
 */
export function ConversationalForm() {
  const t = useTranslations("form");
  const reduce = useReducedMotion();
  const services = useTranslations("services2.items");
  const locale = useLocale();
  const { prefill } = useFormPrefill();

  const [contact, setContact] = useState<Contact>(emptyContact);
  const [interest, setInterest] = useState<SolutionInterest | null>(null);
  const [demoSummary, setDemoSummary] = useState("");
  // Only the business name shows; the whole summary travels with the contact.
  const [demoName, setDemoName] = useState("");
  const [cameFor, setCameFor] = useState("");
  // Filled in by what the visitor chose on the page; they can change it with a tap.
  const [picked, setPicked] = useState<Pick[]>([]);
  const [fromPage, setFromPage] = useState(false);

  // Whatever the visitor did on the page travels with the contact, even if they
  // scroll down here by themselves instead of pressing a button.
  useEffect(() => {
    function onDemo(event: Event) {
      const { summary, name } = (event as CustomEvent<DemoPickDetail>).detail;
      if (summary) setDemoSummary(summary);
      if (name) setDemoName(name);
    }
    function onServices(event: Event) {
      const { services: chosen } = (event as CustomEvent<ServicesPickDetail>).detail;
      setPicked(chosen);
      setFromPage(chosen.length > 0);
    }
    window.addEventListener(DEMO_PICK_EVENT, onDemo);
    window.addEventListener(SERVICES_PICK_EVENT, onServices);
    return () => {
      window.removeEventListener(DEMO_PICK_EVENT, onDemo);
      window.removeEventListener(SERVICES_PICK_EVENT, onServices);
    };
  }, []);

  function togglePick(key: Pick) {
    setFromPage(false);
    setPicked((list) => {
      if (key === "unsure") return list.includes("unsure") ? [] : ["unsure"];
      const rest = list.filter((k) => k !== "unsure");
      return rest.includes(key) ? rest.filter((k) => k !== key) : [...rest, key];
    });
  }

  const pickLabel = (key: Pick) => (key === "unsure" ? t("quick.unsure") : services(`${key}.name`));
  const [invalid, setInvalid] = useState<{ field: Field; message: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    // `prefill` is a command from a CTA elsewhere on the page; this effect
    // reacts to that external event.
    if (!prefill) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (prefill.solutionInterest) setInterest(prefill.solutionInterest);
    if (prefill.demoSummary) setDemoSummary(prefill.demoSummary);
    if (prefill.mainTask) setCameFor(prefill.mainTask);
  }, [prefill]);

  function update(patch: Partial<Contact>) {
    setContact((c) => ({ ...c, ...patch }));
    setInvalid(null);
  }

  function validate(): { field: Field; message: string } | null {
    if (!contact.name.trim()) return { field: "name", message: t("validation.name") };
    if (contact.channel === "email") {
      return /^\S+@\S+\.\S+$/.test(contact.email) ? null : { field: "email", message: t("validation.email") };
    }
    return contact.phone.replace(/\D/g, "").length >= 7 ? null : { field: "phone", message: t("validation.phone") };
  }

  /** Props for a field: marks it and points to its message when it needs fixing. */
  const fieldProps = (field: Field) => ({
    id: `lead-${field}`,
    "aria-invalid": invalid?.field === field,
    "aria-describedby": invalid?.field === field ? "lead-error" : undefined,
  });
  const fieldError = (field: Field) =>
    invalid?.field === field ? (
      <p id="lead-error" role="alert" className="-mt-1.5 px-1 text-[13px] text-[var(--color-danger)]">
        {invalid.message}
      </p>
    ) : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setInvalid(problem);
      // Take the visitor to the field, wherever they are in the form.
      const input = document.getElementById(`lead-${problem.field}`);
      input?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      input?.focus({ preventScroll: true });
      return;
    }
    setStatus("submitting");
    try {
      const wants = picked.length ? `${t("quick.interestedIn")}: ${picked.map(pickLabel).join(", ")}` : "";
      const notes = [wants, cameFor && cameFor !== demoSummary ? cameFor : ""].filter(Boolean).join(" · ");
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interest: interest ?? (picked[0] ? interestFor[picked[0]] : undefined),
          demo: demoSummary || undefined,
          notes: notes || undefined,
          channel: contact.channel,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          locale,
        }),
      });
      if (!response.ok) throw new Error("submit_failed");
      setStatus("success");
      trackStandard("Lead", { con_demo: Boolean(demoSummary) });
      try {
        sessionStorage.setItem(LEAD_SENT_KEY, "1");
      } catch {
        // Ignore: only used to stop the "before you go" offer.
      }
    } catch {
      setStatus("error");
    }
  }

  function restart() {
    setStatus("idle");
    setContact(emptyContact);
    setInterest(null);
    setDemoSummary("");
    setCameFor("");
    setPicked([]);
    setFromPage(false);
  }

  // After sending the form, the chat opens saying who is writing, so it matches the contact that just came in.
  const firstName = contact.name.trim().split(" ")[0];
  const successLink = buildWhatsAppLink(
    demoName ? t("successWhatsappFor", { name: firstName, business: demoName }) : t("successWhatsapp", { name: firstName }),
  );

  return (
    <section id="contacto" className="bg-[var(--color-fog)] py-14 md:py-20">
      <Container>
        {/* Phones: call to action, form, questions, then the steps. Desktop: text and questions on the left, form on the right. */}
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-6">
          <ContactIntro />

          <div className="relative rounded-[28px] border border-[var(--color-border)] bg-white p-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 shadow-[0_30px_60px_-40px_rgba(27,23,48,0.45)] md:p-8">
            {status === "success" ? (
              <SuccessView
                name={contact.name.trim().split(" ")[0]}
                channel={t(`contactStep.channel.${contact.channel}`)}
                whatsappLink={successLink}
                onRestart={restart}
              />
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-mist)] px-3 py-1 text-[13px] font-medium text-[var(--color-ink)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    {t("eyebrow")}
                  </span>
                  <span className="text-[13px] text-[var(--color-muted)]">{t("meta")}</span>
                </div>

                <h3 className="text-display mt-5 text-[1.45rem] font-medium leading-tight text-[var(--color-ink)] md:text-[1.65rem]">
                  {t("quick.title")}
                </h3>

                {demoSummary ? (
                  <p className="mt-3 flex items-center gap-1.5 text-[13.5px] font-medium text-[var(--color-primary)]">
                    <Check size={15} strokeWidth={2.5} className="shrink-0" />
                    {demoName ? t("fromDemo", { name: demoName }) : t("fromDemoAny")}
                  </p>
                ) : null}

                <div className="mt-5 space-y-3">
                  <input
                    type="text"
                    autoComplete="name"
                    value={contact.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder={t("contactStep.name")}
                    aria-label={t("contactStep.name")}
                    maxLength={120}
                    className={inputClass}
                    {...fieldProps("name")}
                  />
                  {fieldError("name")}

                  <div role="radiogroup" aria-label={t("contactStep.label")} className="grid grid-cols-2 gap-1 rounded-full bg-[var(--color-mist)] p-1">
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
                          <span className="relative">{t(`contactStep.channel.${ch}`)}</span>
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
                      placeholder={t("contactStep.email")}
                      aria-label={t("contactStep.email")}
                      maxLength={200}
                      className={inputClass}
                      {...fieldProps("email")}
                    />
                  ) : (
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={contact.phone}
                      onChange={(e) => update({ phone: e.target.value })}
                      placeholder={t("contactStep.phone")}
                      aria-label={t("contactStep.phone")}
                      maxLength={40}
                      className={inputClass}
                      {...fieldProps("phone")}
                    />
                  )}
                  {fieldError(contact.channel === "email" ? "email" : "phone")}

                </div>

                <fieldset className="mt-5">
                  <legend className="text-[14px] font-semibold text-[var(--color-ink)]">
                    {t("quick.interestLabel")} <span className="font-normal text-[var(--color-muted)]">{t("quick.optional")}</span>
                  </legend>
                  {fromPage ? <p className="mt-0.5 text-[12.5px] text-[var(--color-primary)]">{t("quick.fromPage")}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {picks.map((key) => {
                      const on = picked.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => togglePick(key)}
                          aria-pressed={on}
                          className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-[14px] font-medium transition-colors ${
                            on
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                              : "border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-primary)]/40"
                          }`}
                        >
                          {on ? <Check size={14} strokeWidth={3} /> : null}
                          {pickLabel(key)}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                {status === "error" ? (
                  <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
                    {t("errorText")}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t("submitting")}
                    </>
                  ) : (
                    <>
                      {t("quick.submit")}
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
                <Team />
              </form>
            )}
          </div>

          <ContactFaq />
        </div>

        <ContactSteps className="mt-12" />
      </Container>
    </section>
  );
}

// Photos of the founders: put the files in public/team/ and set the paths here.
const teamPhotos: Record<string, string | null> = { Valeria: null, Tomás: null };

/** Who answers: the founders, right under the button, so people know there are people behind it. */
function Team() {
  const t = useTranslations("form.team");
  const members = t.raw("members") as string[];
  const names = members.length > 1 ? `${members.slice(0, -1).join(", ")} ${t("and")} ${members.at(-1)}` : members[0];

  return (
    <div className="mt-5 flex items-center gap-3 border-t border-[var(--color-border)] pt-4">
      <div className="flex shrink-0 -space-x-2.5">
        {members.map((member) => {
          const photo = teamPhotos[member];
          return photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- small static avatar
            <img key={member} src={photo} alt={member} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
          ) : (
            <span
              key={member}
              aria-label={member}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#a57bff] to-[#ff8a65] text-[14px] font-semibold text-white ring-2 ring-white"
            >
              {member.charAt(0)}
            </span>
          );
        })}
      </div>
      <p className="text-[13px] leading-snug text-[var(--color-muted)]">{t("text", { names })}</p>
    </div>
  );
}

/** Call to action next to the form. */
function ContactIntro() {
  const t = useTranslations("contactIntro");

  return (
    <div>
      <p className="text-sm font-medium text-[var(--color-primary)]">{t("eyebrow")}</p>
      <h2 className="text-display mt-2 max-w-[480px] text-[1.9rem] font-semibold leading-[1.1] text-[var(--color-ink)] md:text-[2.25rem]">{t("title")}</h2>
      <p className="mt-3 max-w-[480px] text-[16px] leading-relaxed text-[var(--color-muted)]">{t("subtitle")}</p>
    </div>
  );
}

/** The doubts that stop people from writing, answered in one line each. On phones they come after the form. */
function ContactFaq() {
  const t = useTranslations("contactIntro");
  const faq = t.raw("faq") as { q: string; a: string }[];

  return (
    <div className="lg:col-start-1 lg:row-start-2">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t("faqTitle")}</p>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2">
        {faq.map((item) => (
          <div key={item.q} className="rounded-2xl bg-white p-3.5 ring-1 ring-[var(--color-border)]">
            <dt className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--color-ink)]">
              <Check size={14} strokeWidth={2.5} className="shrink-0 text-[var(--color-primary)]" />
              {item.q}
            </dt>
            <dd className="mt-1 text-[13.5px] leading-snug text-[var(--color-muted)]">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const stepIcons = [MessageCircle, Mail, Wrench, ShieldCheck, Rocket];

/**
 * The path with AIgency, step by step, left to right: a line draws itself from
 * one step to the next as the section comes into view. Phones scroll it
 * sideways, one step at a time.
 */
function ContactSteps({ className }: { className: string }) {
  const t = useTranslations("contactIntro");
  const reduce = useReducedMotion();
  const steps = t.raw("steps") as { title: string; text: string; tag?: string }[];
  const stepDelay = 0.45;

  return (
    <div className={className}>
      <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t("stepsTitle")}</p>
      <ol className="-mx-4 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {steps.map((step, i) => {
          const Icon = stepIcons[i % stepIcons.length];
          const last = i === steps.length - 1;
          return (
            <motion.li
              key={step.title}
              className="relative w-[72%] shrink-0 snap-start sm:w-[44%] md:w-auto"
              initial={reduce ? undefined : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * stepDelay, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Connector to the next step, drawn after this one appears */}
              {last ? null : (
                <span aria-hidden="true" className="absolute left-12 right-[-0.75rem] top-[21px] h-[3px] overflow-hidden rounded-full bg-[var(--color-border)] md:right-[-1rem]">
                  <motion.span
                    className="block h-full origin-left rounded-full bg-gradient-to-r from-[#7c4dff] to-[#ff8a65]"
                    initial={reduce ? undefined : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: stepDelay, delay: i * stepDelay + 0.3, ease: "easeInOut" }}
                  />
                </span>
              )}
              <motion.span
                className="relative flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-[0_10px_20px_-10px_rgba(124,77,255,0.9)]"
                initial={reduce ? undefined : { scale: 0.6, backgroundColor: "#d9d5e6" }}
                whileInView={{ scale: 1, backgroundColor: last ? "#ff8a65" : "#7c4dff" }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: i * stepDelay, type: "spring", stiffness: 300, damping: 18 }}
              >
                <Icon size={19} />
              </motion.span>
              <div className="mt-3 h-full rounded-2xl bg-white p-3.5 ring-1 ring-[var(--color-border)]">
                <p className="flex flex-wrap items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                  {t("stepLabel", { n: i + 1 })}
                  {step.tag ? (
                    <span className="rounded-full bg-[var(--color-primary-soft)] px-2 py-px normal-case tracking-normal">{step.tag}</span>
                  ) : null}
                </p>
                <p className="mt-1 text-[15px] font-semibold leading-snug text-[var(--color-ink)]">{step.title}</p>
                <p className="mt-1 text-[13.5px] leading-snug text-[var(--color-muted)]">{step.text}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
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
