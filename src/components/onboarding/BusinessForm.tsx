"use client";

import { useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { AltaCopy } from "@/content/alta";

const DAYS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"] as const;
type Day = (typeof DAYS)[number];
type DayHours = { abierto: boolean; desde: string; hasta: string; pausa: boolean; pausa_desde: string; pausa_hasta: string };
type Service = { nombre: string; duracion_min: number; precio: string; descripcion: string };
type Person = { nombre: string; email: string; todos_los_servicios: boolean; servicios: number[]; dias_libres: Day[] };
export type AltaLink = { negocio: string; codigo: string };

const DURATIONS = [10, 15, 20, 30, 40, 45, 60, 75, 90, 120, 150, 180, 240];
const CHANGE_HOURS = [1, 2, 3, 4, 6, 12, 24, 48];
const day = (abierto: boolean, desde = "10:00", hasta = "20:00"): DayHours => ({ abierto, desde, hasta, pausa: false, pausa_desde: "14:00", pausa_hasta: "15:00" });
const newService = (): Service => ({ nombre: "", duracion_min: 30, precio: "", descripcion: "" });
const newPerson = (): Person => ({ nombre: "", email: "", todos_los_servicios: true, servicios: [], dias_libres: [] });

const input =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[var(--color-primary)]";

export function BusinessForm({ copy, link, locale }: { copy: AltaCopy; link: AltaLink | null; locale: string }) {
  const [form, setForm] = useState({
    nombre: "", nombre_dueno: "", telefono_dueno: "", zona: locale === "en" ? "au-bne" : "cl",
    direccion: "", link_maps: "", link_resena_google: "", medios_pago: ["efectivo"] as string[], medios_otro: "", info_extra: "",
    horas_minimas_cambio: 2, politica_extra: "", descuento_cumpleanos: "", tono: "cercano", usa_emojis: true,
  });
  const [hours, setHours] = useState<Record<Day, DayHours>>({
    lun: day(true), mar: day(true), mie: day(true), jue: day(true), vie: day(true), sab: day(true, "10:00", "18:00"), dom: day(false),
  });
  const [services, setServices] = useState<Service[]>([newService()]);
  const [team, setTeam] = useState<Person[]>([newPerson()]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "invalid" | "failed">("idle");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);

  if (!link || status === "invalid") return <Notice text={copy.invalidLink} />;
  if (status === "done") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-fog)] p-6">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[var(--color-success)]" aria-hidden />
        <div>
          <p className="font-[family-name:var(--font-jakarta)] text-lg font-semibold">{copy.done.title}</p>
          <p className="mt-2 leading-relaxed text-[var(--color-muted)]">{copy.done.text}</p>
        </div>
      </div>
    );
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setDay = (d: Day, patch: Partial<DayHours>) => setHours((h) => ({ ...h, [d]: { ...h[d], ...patch } }));
  const setService = (i: number, patch: Partial<Service>) => setServices((s) => s.map((x, n) => (n === i ? { ...x, ...patch } : x)));
  const setPerson = (i: number, patch: Partial<Person>) => setTeam((t) => t.map((x, n) => (n === i ? { ...x, ...patch } : x)));
  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  // Server error keys ("servicio_2", "horario_lun", "email_1"…) → plain words.
  const describe = (key: string) => {
    const [base, n] = key.split("_");
    if (copy.errors.fields[key]) return copy.errors.fields[key];
    if (base === "servicio") return `${copy.services.name} ${n}`;
    if (base === "equipo" || base === "email") return `${copy.sections.team} · ${n}${base === "email" ? ` (${copy.team.email})` : ""}`;
    if (base === "horario" && n) return `${copy.sections.hours} · ${copy.days[n] ?? n}`;
    return key;
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setFieldErrors([]);
    const horario = Object.fromEntries(
      DAYS.map((d) => {
        const h = hours[d];
        return [d, { abierto: h.abierto, desde: h.desde, hasta: h.hasta, pausa_desde: h.pausa ? h.pausa_desde : "", pausa_hasta: h.pausa ? h.pausa_hasta : "" }];
      }),
    );
    try {
      const response = await fetch("/api/negocio/alta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...link, ...form, horario, servicios: services, equipo: team }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 403) return setStatus("invalid");
      if (result.ok) return setStatus("done");
      setFieldErrors(Array.isArray(result.campos) ? result.campos : []);
      setStatus("failed");
    } catch {
      setStatus("failed");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form onSubmit={submit} className="space-y-12">
      {status === "failed" ? (
        <div role="alert" className="rounded-2xl border border-[var(--color-danger)]/40 bg-[var(--color-fog)] p-5">
          <p className="font-medium">{fieldErrors.length ? copy.errors.title : copy.errors.generic}</p>
          {fieldErrors.length ? (
            <ul className="mt-2 list-disc pl-5 text-[var(--color-muted)]">
              {fieldErrors.map((key) => (
                <li key={key}>{describe(key)}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Section title={copy.sections.business}>
        <Field label={copy.business.name} hint={copy.business.nameHint}>
          <input required maxLength={80} className={input} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.business.owner}>
            <input required maxLength={80} className={input} value={form.nombre_dueno} onChange={(e) => set("nombre_dueno", e.target.value)} />
          </Field>
          <Field label={copy.business.country}>
            <select className={input} value={form.zona} onChange={(e) => set("zona", e.target.value)}>
              {Object.entries(copy.zones).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label={copy.business.ownerPhone} hint={copy.business.ownerPhoneHint}>
          <input required type="tel" inputMode="tel" maxLength={25} placeholder={form.zona.startsWith("au") ? "0412 345 678" : "+56 9 1234 5678"} className={input}
            value={form.telefono_dueno} onChange={(e) => set("telefono_dueno", e.target.value)} />
        </Field>
        <Field label={copy.business.address}>
          <input required maxLength={200} className={input} value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={copy.business.maps} hint={copy.business.mapsHint} optional={copy.optional}>
            <input type="url" maxLength={300} placeholder="https://" className={input} value={form.link_maps} onChange={(e) => set("link_maps", e.target.value)} />
          </Field>
          <Field label={copy.business.reviews} hint={copy.business.reviewsHint} optional={copy.optional}>
            <input type="url" maxLength={300} placeholder="https://" className={input} value={form.link_resena_google} onChange={(e) => set("link_resena_google", e.target.value)} />
          </Field>
        </div>
        <Field label={copy.business.payments}>
          <div className="flex flex-wrap gap-2">
            {Object.entries(copy.payments).map(([key, label]) => (
              <Chip key={key} checked={form.medios_pago.includes(key)} onChange={() => set("medios_pago", toggle(form.medios_pago, key))}>{label}</Chip>
            ))}
          </div>
          <input maxLength={80} placeholder={copy.business.paymentsOther} className={`${input} mt-3`} value={form.medios_otro} onChange={(e) => set("medios_otro", e.target.value)} />
        </Field>
        <Field label={copy.business.extra} hint={copy.business.extraHint} optional={copy.optional}>
          <textarea rows={3} maxLength={1000} className={input} value={form.info_extra} onChange={(e) => set("info_extra", e.target.value)} />
        </Field>
      </Section>

      <Section title={copy.sections.hours}>
        <div className="divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)]">
          {DAYS.map((d) => {
            const h = hours[d];
            return (
              <div key={d} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <label className="flex w-36 items-center gap-2 font-medium">
                  <input type="checkbox" checked={h.abierto} onChange={(e) => setDay(d, { abierto: e.target.checked })} className="size-4 accent-[var(--color-primary)]" />
                  {copy.days[d]}
                </label>
                {h.abierto ? (
                  <>
                    <span className="flex items-center gap-2 text-sm">
                      <input type="time" aria-label={`${copy.days[d]} ${copy.hours.from}`} className={`${input} w-28`} value={h.desde} onChange={(e) => setDay(d, { desde: e.target.value })} />
                      –
                      <input type="time" aria-label={`${copy.days[d]} ${copy.hours.to}`} className={`${input} w-28`} value={h.hasta} onChange={(e) => setDay(d, { hasta: e.target.value })} />
                    </span>
                    <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                      <input type="checkbox" checked={h.pausa} onChange={(e) => setDay(d, { pausa: e.target.checked })} className="size-4 accent-[var(--color-primary)]" />
                      {copy.hours.addBreak}
                    </label>
                    {h.pausa ? (
                      <span className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                        {copy.hours.breakFrom}
                        <input type="time" className={`${input} w-28`} value={h.pausa_desde} onChange={(e) => setDay(d, { pausa_desde: e.target.value })} />
                        {copy.hours.breakTo}
                        <input type="time" className={`${input} w-28`} value={h.pausa_hasta} onChange={(e) => setDay(d, { pausa_hasta: e.target.value })} />
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-sm text-[var(--color-muted)]">{copy.hours.closed}</span>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section title={copy.sections.services}>
        {services.map((s, i) => (
          <div key={i} className="grid gap-3 rounded-2xl border border-[var(--color-border)] p-4 sm:grid-cols-[1fr_8rem_8rem_auto] sm:items-end">
            <Field label={`${copy.services.name} ${i + 1}`}>
              <input required maxLength={80} className={input} value={s.nombre} onChange={(e) => setService(i, { nombre: e.target.value })} />
            </Field>
            <Field label={copy.services.duration}>
              <select className={input} value={s.duracion_min} onChange={(e) => setService(i, { duracion_min: Number(e.target.value) })}>
                {DURATIONS.map((m) => (
                  <option key={m} value={m}>{m} {copy.services.minutes}</option>
                ))}
              </select>
            </Field>
            <Field label={copy.services.price}>
              <input required inputMode="numeric" maxLength={12} className={input} value={s.precio} onChange={(e) => setService(i, { precio: e.target.value.replace(/[^\d.]/g, "") })} />
            </Field>
            <RemoveButton
              label={copy.services.remove}
              disabled={services.length === 1}
              onClick={() => {
                setServices((list) => list.filter((_, n) => n !== i));
                // Team members point to services by position: keep their choices pointing at the same services.
                setTeam((list) => list.map((p) => ({ ...p, servicios: p.servicios.filter((n) => n !== i).map((n) => (n > i ? n - 1 : n)) })));
              }}
            />
            <input maxLength={300} placeholder={copy.services.description} className={`${input} sm:col-span-4`} value={s.descripcion} onChange={(e) => setService(i, { descripcion: e.target.value })} />
          </div>
        ))}
        <AddButton label={copy.services.add} onClick={() => setServices((list) => [...list, newService()])} />
      </Section>

      <Section title={copy.sections.team} intro={copy.team.intro}>
        {team.map((p, i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-[var(--color-border)] p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label={copy.team.name}>
                <input required maxLength={60} className={input} value={p.nombre} onChange={(e) => setPerson(i, { nombre: e.target.value })} />
              </Field>
              <Field label={copy.team.email} hint={copy.team.emailHint} optional={copy.optional}>
                <input type="email" maxLength={120} className={input} value={p.email} onChange={(e) => setPerson(i, { email: e.target.value })} />
              </Field>
              <RemoveButton label={copy.team.remove} disabled={team.length === 1} onClick={() => setTeam((list) => list.filter((_, n) => n !== i))} />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={p.todos_los_servicios} onChange={(e) => setPerson(i, { todos_los_servicios: e.target.checked })} className="size-4 accent-[var(--color-primary)]" />
                {copy.team.allServices}
              </label>
              {!p.todos_los_servicios ? (
                <div className="mt-2">
                  <p className="text-sm text-[var(--color-muted)]">{copy.team.someServices}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {services.map((s, n) =>
                      s.nombre.trim() ? (
                        <Chip key={n} checked={p.servicios.includes(n)} onChange={() => setPerson(i, { servicios: toggle(p.servicios, n) })}>{s.nombre}</Chip>
                      ) : null,
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <div>
              <p className="text-sm text-[var(--color-muted)]">{copy.team.daysOff}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <Chip key={d} checked={p.dias_libres.includes(d)} onChange={() => setPerson(i, { dias_libres: toggle(p.dias_libres, d) })}>{copy.days[d].slice(0, 3)}</Chip>
                ))}
              </div>
            </div>
          </div>
        ))}
        <AddButton label={copy.team.add} onClick={() => setTeam((list) => [...list, newPerson()])} />
      </Section>

      <Section title={copy.sections.rules}>
        <Field label={copy.rules.changes} hint={copy.rules.changesHint}>
          <select className={`${input} sm:w-56`} value={form.horas_minimas_cambio} onChange={(e) => set("horas_minimas_cambio", Number(e.target.value))}>
            {CHANGE_HOURS.map((h) => (
              <option key={h} value={h}>{h} {copy.rules.hoursBefore}</option>
            ))}
          </select>
        </Field>
        <Field label={copy.rules.extra}>
          <input maxLength={300} className={input} value={form.politica_extra} onChange={(e) => set("politica_extra", e.target.value)} />
        </Field>
        <Field label={copy.rules.birthday} hint={copy.rules.birthdayHint}>
          <input maxLength={80} className={input} value={form.descuento_cumpleanos} onChange={(e) => set("descuento_cumpleanos", e.target.value)} />
        </Field>
      </Section>

      <Section title={copy.sections.voice}>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(copy.voice.tones).map(([key, tone]) => (
            <label key={key} className={`cursor-pointer rounded-2xl border p-4 transition-colors ${form.tono === key ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]" : "border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}>
              <input type="radio" name="tono" value={key} checked={form.tono === key} onChange={() => set("tono", key)} className="sr-only" />
              <span className="block font-medium">{tone.title}</span>
              <span className="mt-1 block text-sm text-[var(--color-muted)]">{tone.text}</span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.usa_emojis} onChange={(e) => set("usa_emojis", e.target.checked)} className="size-4 accent-[var(--color-primary)]" />
          {copy.voice.emojis}
        </label>
      </Section>

      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {status === "sending" ? copy.sending : copy.submit}
      </Button>
    </form>
  );
}

function Section({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold">{title}</h2>
        {intro ? <p className="mt-1 text-[var(--color-muted)]">{intro}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, optional, children }: { label: string; hint?: string; optional?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label}
        {optional ? <span className="font-normal text-[var(--color-muted)]"> ({optional})</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1.5 block text-sm text-[var(--color-muted)]">{hint}</span> : null}
    </label>
  );
}

function Chip({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors ${checked ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]" : "border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
      <Plus className="size-4" aria-hidden />
      {label}
    </button>
  );
}

function RemoveButton({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label}
      className="inline-flex h-11 items-center justify-center rounded-xl px-3 text-[var(--color-muted)] hover:text-[var(--color-danger)] disabled:opacity-30">
      <Trash2 className="size-4" aria-hidden />
    </button>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-fog)] p-5">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--color-accent-warm)]" aria-hidden />
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
