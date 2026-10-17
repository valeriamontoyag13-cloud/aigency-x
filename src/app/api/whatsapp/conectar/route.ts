import { NextResponse } from "next/server";
import { z } from "zod";
import { n8nWebhookUrl } from "@/lib/n8nWebhook";

// What the /conectar page sends after Meta's Embedded Signup. n8n validates it again and checks the one-time link.
const connectSchema = z.object({
  negocio: z.string().regex(/^[a-z0-9-]{2,60}$/),
  codigo: z.string().regex(/^[a-f0-9]{24,64}$/),
  code: z.string().min(1).max(2000).regex(/^\S+$/),
  evento: z.enum(["FINISH", "FINISH_ONLY_WABA", "FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING"]),
  waba_id: z.string().regex(/^\d{5,25}$/),
  phone_number_id: z.string().regex(/^(\d{5,25})?$/),
  business_id: z.string().regex(/^(\d{5,25})?$/),
});

export async function POST(request: Request) {
  const parsed = connectSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const webhookUrl = n8nWebhookUrl("N8N_ONBOARDING_WEBHOOK_URL", "aigencyx-conectar-whatsapp");
  if (!webhookUrl) {
    console.error("[conectar] no n8n webhook URL (N8N_ONBOARDING_WEBHOOK_URL or N8N_LEAD_WEBHOOK_URL).");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Meta's code expires 30 s after it is issued, so it goes straight to n8n. It is never logged.
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(25_000),
    });
    const result = await response.json().catch(() => ({}));
    return NextResponse.json(
      { ok: Boolean(result.ok), resultado: result.resultado ?? "error", numero: result.numero ?? "", error: result.error },
      { status: response.ok ? 200 : response.status === 403 ? 403 : 502 },
    );
  } catch (error) {
    console.error("[conectar] could not reach n8n:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }
}
