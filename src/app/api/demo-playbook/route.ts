import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Playbook } from "@/lib/demoFlow";

/**
 * For a business that isn't one of our samples ("Other"), Claude writes how
 * the demo conversation should go: what gets booked, whether clients buy the
 * services together or one at a time, what to ask before quoting, and how a
 * client would name each service. The demo plays the same guided chat with
 * these details. Without an API key, or if anything fails, it answers
 * `{ playbook: null }` and the demo uses careful defaults.
 */

const RATE_LIMIT = { requests: 10, windowMs: 10 * 60 * 1000 }; // per IP

const bodySchema = z.object({
  kind: z.string().trim().min(1).max(60),
  name: z.string().max(40).optional().default(""),
  services: z
    .array(z.object({ name: z.string().trim().min(1).max(60), price: z.string().max(30) }))
    .min(1)
    .max(3),
  locale: z.enum(["es", "en"]),
});

const text = (max: number) => z.string().trim().min(1).max(max);

const outputSchema = z.object({
  unit: text(20),
  unit_article: text(5),
  combine: z.boolean(),
  people: z.number().int().min(0).max(5000),
  services: z.array(z.object({ mention: text(60), per_person: z.boolean() })),
  price_question: text(90),
  quote_request: text(120),
  book_request: text(120),
  quote_question: text(140),
  quote_answer: text(80),
  booking: text(60),
  slots: z.array(text(30)),
  client: text(20),
});

const jsonSchema = {
  type: "object",
  properties: {
    unit: { type: "string" },
    unit_article: { type: "string" },
    combine: { type: "boolean" },
    people: { type: "integer" },
    services: {
      type: "array",
      items: {
        type: "object",
        properties: { mention: { type: "string" }, per_person: { type: "boolean" } },
        required: ["mention", "per_person"],
        additionalProperties: false,
      },
    },
    price_question: { type: "string" },
    quote_request: { type: "string" },
    book_request: { type: "string" },
    quote_question: { type: "string" },
    quote_answer: { type: "string" },
    booking: { type: "string" },
    slots: { type: "array", items: { type: "string" } },
    client: { type: "string" },
  },
  required: [
    "unit",
    "unit_article",
    "combine",
    "people",
    "services",
    "price_question",
    "quote_request",
    "book_request",
    "quote_question",
    "quote_answer",
    "booking",
    "slots",
    "client",
  ],
  additionalProperties: false,
} as const;

const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT.requests;
}

function systemPrompt(locale: "es" | "en") {
  const language = locale === "es" ? "neutral Latin American Spanish" : "English";
  return `You set up a short demo of a WhatsApp assistant for a small business. The demo plays a conversation between the assistant and one client: the client asks prices, asks for a quote, books, and gets a reminder one day before. Given the business, decide how that conversation should sound so it makes sense for THIS kind of business. Write every text in ${language}.

Fields:
- unit: the one word for what a client books in this kind of business (examples in Spanish: "hora" for a salon, "fecha" for a banquet hall or event venue, "turno", "cita", "mesa"; in English: "slot", "date", "appointment", "table"). unit_article: its indefinite article ("una", "un", "a", "an").
- combine: true if clients usually buy several of these services together in one order or quote (manicure + pedicure; oil change + brake check). false if they normally choose one of them (a wedding OR a first communion at a banquet hall; one tattoo size).
- services: one entry per service, in the same order as given. mention: how a client would say it inside a sentence, with an article when natural ("una boda", "la primera comunión", "a wedding"); expand abbreviations and fix typos ("P. Comunion" -> "una primera comunión"). per_person: true only if the service is clearly priced per person or guest (by its name, or a price that only makes sense per person). A large total like 50.000.000 for a wedding is not per person.
- price_question: a short client message asking the price of the first service.
- quote_request: a client message asking for a quote: for the first service only when combine is false, for the first two when it is true.
- book_request: a client message asking for availability to book the first service.
- quote_question: what the assistant asks before quoting: the one or two details this business really needs (date and number of guests for events, make and model for a mechanic, size for a tattoo). Friendly, start like "¡Claro! 😊" or "Sure! 😊", at most one emoji.
- quote_answer: a short, realistic answer from the client to quote_question.
- people: the number of people or guests in quote_answer when per-person prices apply; otherwise 0.
- booking: how the assistant names the client's upcoming booking in a reminder sent one day before, with a possessive ("tu hora de manicure", "tu reunión de degustación", "tu evento", "your tasting meeting").
- slots: exactly three free times or dates the client could book, short (under 22 characters), realistic for this business (dates for events like "sábado 14 de dic.", times for appointments like "mañana 10:00").
- client: a common first name for a client in Latin America (or the US for English).

Keep every message short and natural, like real WhatsApp messages.`;
}

let client: Anthropic | null = null;

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  const { kind, name, services, locale } = parsed.data;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!process.env.ANTHROPIC_API_KEY || rateLimited(ip)) return NextResponse.json({ playbook: null });

  try {
    client ??= new Anthropic();
    const response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 2000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: jsonSchema } },
      system: systemPrompt(locale),
      messages: [
        {
          role: "user",
          content: `Business: "${name || kind}". Kind of business: ${kind}.\nServices with prices:\n${services
            .map((s, i) => `${i + 1}. ${s.name}: ${s.price || "no price"}`)
            .join("\n")}`,
        },
      ],
    });
    if (response.stop_reason === "refusal") return NextResponse.json({ playbook: null });
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return NextResponse.json({ playbook: null });
    const out = outputSchema.safeParse(JSON.parse(block.text));
    if (!out.success || out.data.services.length !== services.length || out.data.slots.length < 3) {
      return NextResponse.json({ playbook: null });
    }
    const o = out.data;
    const playbook: Playbook = {
      unit: o.unit,
      unitArticle: o.unit_article,
      combine: o.combine,
      people: o.people,
      services: o.services.map((s) => ({ mention: s.mention, perPerson: s.per_person })),
      priceQuestion: o.price_question,
      quoteRequest: o.quote_request,
      bookRequest: o.book_request,
      quoteQuestion: o.quote_question,
      quoteAnswer: o.quote_answer,
      booking: o.booking,
      slots: [o.slots[0], o.slots[1], o.slots[2]],
      client: o.client,
    };
    return NextResponse.json({ playbook });
  } catch (error) {
    if (error instanceof Anthropic.APIError) console.error(`demo-playbook: Claude API error ${error.status}`, error.message);
    else console.error("demo-playbook: unexpected error", error);
    return NextResponse.json({ playbook: null });
  }
}
