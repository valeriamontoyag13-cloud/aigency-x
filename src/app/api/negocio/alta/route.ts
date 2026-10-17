import { NextResponse } from "next/server";
import { z } from "zod";
import { n8nWebhookUrl } from "@/lib/n8nWebhook";

// Shape check only (n8n validates every field again and checks the private link before saving anything).
const altaSchema = z.object({
  negocio: z.string().regex(/^[a-z0-9-]{2,60}$/),
  codigo: z.string().regex(/^[a-f0-9]{24,64}$/),
  horario: z.record(z.string(), z.unknown()),
  servicios: z.array(z.record(z.string(), z.unknown())).max(40),
  equipo: z.array(z.record(z.string(), z.unknown())).max(30),
}).passthrough();

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 100_000) {
    return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });
  }
  const parsed = altaSchema.safeParse((() => { try { return JSON.parse(raw); } catch { return null; } })());
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const webhookUrl = n8nWebhookUrl("N8N_ALTA_WEBHOOK_URL", "aigencyx-alta-negocio");
  if (!webhookUrl) {
    console.error("[alta] no n8n webhook URL (N8N_ALTA_WEBHOOK_URL or N8N_LEAD_WEBHOOK_URL).");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.N8N_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(parsed.data),
      signal: AbortSignal.timeout(20_000),
    });
    const result = await response.json().catch(() => ({}));
    return NextResponse.json(
      { ok: Boolean(result.ok), error: result.error, campos: Array.isArray(result.campos) ? result.campos : undefined },
      { status: response.ok ? 200 : [403, 422].includes(response.status) ? response.status : 502 },
    );
  } catch (error) {
    console.error("[alta] could not reach n8n:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }
}
