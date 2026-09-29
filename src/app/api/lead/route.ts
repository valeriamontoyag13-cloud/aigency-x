import { NextResponse } from "next/server";
import { z } from "zod";
import es from "../../../../messages/es.json";

const leadSchema = z
  .object({
    businessType: z.enum(["restaurant", "beauty", "health", "retail", "services", "other"]),
    businessOther: z.string().max(200).optional().default(""),
    tasks: z.array(z.string().max(40)).min(1),
    tasksOther: z.string().max(200).optional().default(""),
    clientSource: z.enum(["whatsapp", "instagram", "website", "referrals", "other", "none"]),
    website: z.enum(["works", "improve", "none", "unsure"]),
    hoursLost: z.enum(["lt2", "2to5", "5to10", "gt10"]),
    timeline: z.enum(["asap", "month", "later"]).optional(),
    interest: z
      .enum(["aiAgent", "chatbot", "appointments", "quotes", "website", "menu", "notSure"])
      .optional(),
    channel: z.enum(["whatsapp", "email"]),
    name: z.string().min(1).max(120),
    phone: z.string().max(40).optional().default(""),
    email: z.string().max(200).optional().default(""),
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
function toRecord(lead: Lead) {
  // "Other" is replaced by what the visitor typed, when they typed something.
  const customTask = lead.tasks.includes("other") ? lead.tasksOther.trim() : "";
  const tasks = lead.tasks
    .filter((task) => !(task === "other" && customTask))
    .map((task) => label(steps.tasks.options, task));
  if (customTask) tasks.push(customTask);

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

  const record = toRecord(parsed.data);
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
