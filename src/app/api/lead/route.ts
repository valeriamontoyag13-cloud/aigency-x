import { NextResponse } from "next/server";
import { z } from "zod";
import es from "../../../../messages/es.json";

const originText = z.string().max(200).optional();

const leadSchema = z
  .object({
    // The questionnaire was replaced by a short contact form: these stay optional for older clients.
    businessType: z.enum(["beauty", "barber", "nails", "health", "restaurant", "retail", "services", "other"]).optional(),
    businessOther: z.string().max(200).optional().default(""),
    tasks: z.array(z.string().max(40)).optional().default([]),
    tasksOther: z.string().max(200).optional().default(""),
    clientSource: z.enum(["whatsapp", "instagram", "website", "referrals", "other", "none"]).optional(),
    website: z.enum(["works", "improve", "none", "unsure"]).optional(),
    hoursLost: z.enum(["lt2", "2to5", "5to10", "gt10"]).optional(),
    timeline: z.enum(["asap", "month", "later"]).optional(),
    interest: z
      .enum(["aiAgent", "chatbot", "appointments", "quotes", "website", "menu", "notSure"])
      .optional(),
    /** Business details the visitor typed in the demo (name, kind, services and prices). */
    demo: z.string().max(400).optional().default(""),
    /** What the visitor wrote about their business, or the button they came from. */
    notes: z.string().max(400).optional().default(""),
    channel: z.enum(["whatsapp", "email"]),
    name: z.string().min(1).max(120),
    phone: z.string().max(40).optional().default(""),
    email: z.string().max(200).optional().default(""),
    /** How many people serve clients: 2 or more is a qualified lead. Optional for older clients. */
    teamSize: z.enum(["solo", "small", "large"]).nullish(),
    /** Which ad brought the visitor (UTM tags, Meta's click id), as the browser remembered it. */
    origin: z
      .object({
        utm_source: originText,
        utm_medium: originText,
        utm_campaign: originText,
        utm_content: originText,
        utm_term: originText,
        fbclid: originText,
        landing: originText,
        referrer: originText,
        firstSeen: originText,
      })
      .optional()
      .default({}),
    locale: z.enum(["es", "en"]),
  })
  .refine((data) => data.businessType !== "other" || data.businessOther.trim().length > 0, {
    message: "missing_business_other",
    path: ["businessOther"],
  })
  .refine(
    (data) =>
      data.channel === "email"
        ? z.string().email().safeParse(data.email).success
        : data.phone.replace(/\D/g, "").length >= 7,
    { message: "invalid_contact_channel", path: ["channel"] },
  );

type Lead = z.infer<typeof leadSchema>;

const steps = es.form.steps;
// Service the visitor clicked before reaching the form, if any.
const interests: Record<string, string> = {
  aiAgent: "Agente de IA",
  chatbot: "Chatbot",
  appointments: "Sistema de citas",
  quotes: "Cotizaciones automatizadas",
  website: "Página web",
  menu: "Menú digital",
  notSure: "Aún no lo sabe",
};
const label = (map: Record<string, string>, key: string | undefined) => (key ? (map[key] ?? key) : "");

/**
 * Flat record with Spanish labels, shaped for an Airtable row: n8n can map
 * each key straight to a column. The raw option keys are kept alongside for
 * filtering or logic in the workflow.
 */
function toRecord(lead: Lead, country: string) {
  // "Other" is replaced by what the visitor typed, when they typed something.
  const customTask = lead.tasks.includes("other") ? lead.tasksOther.trim() : "";
  const tasks = lead.tasks
    .filter((task) => !(task === "other" && customTask))
    .map((task) => label(steps.tasks.options, task));
  if (customTask) tasks.push(customTask);
  const origin = lead.origin;

  return {
    submittedAt: new Date().toISOString(),
    name: lead.name.trim(),
    channel: label(es.form.contactStep.channel, lead.channel),
    phone: lead.channel === "whatsapp" ? lead.phone.trim() : "",
    email: lead.channel === "email" ? lead.email.trim() : "",
    business:
      lead.businessType === "other" ? lead.businessOther.trim() : label(steps.businessType.options, lead.businessType),
    tasks: tasks.join(", "),
    clientSource: label(steps.clientSource.options, lead.clientSource),
    website: label(steps.website.options, lead.website),
    hoursLost: label(steps.hoursLost.options, lead.hoursLost),
    timeline: label(es.form.contactStep.timeline, lead.timeline),
    interest: label(interests, lead.interest),
    demo: lead.demo.trim(),
    notes: lead.notes.trim(),
    teamSize: label(es.form.quick.teamOptions, lead.teamSize ?? undefined),
    // null when the visitor didn't answer (older clients), so it isn't counted as "no".
    qualified: lead.teamSize ? lead.teamSize !== "solo" : null,
    source: [origin.utm_source, origin.utm_medium].filter(Boolean).join(" / "),
    campaign: origin.utm_campaign ?? "",
    ad: origin.utm_content ?? "",
    adTerm: origin.utm_term ?? "",
    fbclid: origin.fbclid ?? "",
    referrer: origin.referrer ?? "",
    landing: origin.landing ?? "",
    firstSeen: origin.firstSeen ?? "",
    country,
    locale: lead.locale,
    raw: lead,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  // Country of the connection, as Vercel sees it (empty when running locally).
  const country = (request.headers.get("x-vercel-ip-country") ?? "").slice(0, 2).toUpperCase();
  const record = toRecord(parsed.data, country);
  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;

  // n8n receives the lead, saves it to Airtable and sends the emails. The URL
  // and secret live only in server env vars, never in the browser bundle.
  if (!webhookUrl) {
    if (process.env.NODE_ENV === "production") {
      console.error("[lead] N8N_LEAD_WEBHOOK_URL is not set; lead was not delivered.");
      return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
    }
    console.log("[lead] N8N_LEAD_WEBHOOK_URL not set (dev), lead:", record);
    return NextResponse.json({ ok: true });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(record),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`n8n responded ${response.status}`);
  } catch (error) {
    console.error("[lead] could not deliver lead to n8n:", error);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
