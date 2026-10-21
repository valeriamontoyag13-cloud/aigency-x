import type { AppLocale } from "@/i18n/routing";
import type { BusinessTexts, PainKey } from "@/content/demoBusinesses";
import { formatMoney, type Currency } from "@/lib/money";

/**
 * The guided demo as one WhatsApp conversation. Each situation the visitor
 * picked (answering, quoting, booking, rescheduling) is a chapter of the same
 * chat. Every answer the client can give is a real button: the visitor picks
 * one and the assistant replies to that choice; if they don't, the demo goes
 * on with the suggested one (always the first).
 *
 * What the client asks and how the assistant answers comes from a playbook
 * for the kind of business: what gets booked, whether services are quoted
 * together or one at a time, what to ask before quoting. For "Other" the
 * playbook is written by Claude (api/demo-playbook); otherwise, and as a
 * fallback, it is built here.
 */

export type DemoService = { name: string; amount: number };

/** What the visitor told us about their business. */
export type VisitorBusiness = { name: string; currency: Currency; services: DemoService[]; address?: string };

export type DemoCard = { kind: "quote" | "calendar"; title: string; lines: [string, string][]; total?: string };

/** How this kind of business works, in the visitor's language. */
export type Playbook = {
  /** What a client books ("hora", "fecha", "turno") and its article ("una", "un"). */
  unit: string;
  unitArticle: string;
  /** True when clients buy several services together (manicure + pedicure); false when they pick one (a wedding or a first communion). */
  combine: boolean;
  /** People in the quote answer, for services priced per person (0 if none). */
  people: number;
  /** For each service, in order: how a client says it ("una boda") and whether it's priced per person. */
  services: { mention: string; perPerson: boolean }[];
  /** The client's messages. */
  priceQuestion: string;
  quoteRequest: string;
  bookRequest: string;
  /** What the assistant asks before quoting, and a realistic answer. */
  quoteQuestion: string;
  quoteAnswer: string;
  /** How the assistant names the client's booking ("tu hora de manicure", "tu degustación"). */
  booking: string;
  /** Three free slots that make sense for this business. */
  slots: [string, string, string];
  client: string;
};

/** Goes on in the next situation: the client's message is its opening. */
export const NEXT = "next";

/** What the conversation remembers: the booked slot, the one that was freed. */
export type Memory = { slot?: string; oldSlot?: string; handoff?: boolean; rough?: boolean };

export type Choice = { label: string; to: string; set?: Partial<Memory>; outcome?: string };

/** One message of the assistant, what it shows the owner, and how the client can answer. */
export type Turn = {
  text: string;
  card?: DemoCard;
  caption: string;
  benefit: string;
  choices: Choice[];
  /** Without choices the situation ends here, with this result. */
  outcome?: string;
};

export type Opening = {
  note?: { text: string; caption: string };
  /** The client's first message, sent with a tap. Without it the assistant writes first. */
  client?: string;
  title: string;
  first: string;
};

export type Flow = {
  opening: (continued: boolean) => Opening;
  /** Where the assistant picks up when the previous situation handed over to this one. */
  entry: string;
  node: (id: string, memory: Memory) => Turn;
};

export type FlowContext = {
  business: VisitorBusiness;
  texts: BusinessTexts;
  /** What the visitor typed as their kind of business when they picked "Other". */
  kind: string;
  /** The situation that comes after this one, if any. */
  next: PainKey | null;
  /** Written by Claude for "Other"; built here otherwise. */
  playbook?: Playbook | null;
};

/** The order things happen with a real client. */
export const storyOrder: PainKey[] = ["responder", "cotizar", "agendar", "reprogramar"];

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Services priced per person (banquets, events, classes). */
export const perPerson = (name: string) =>
  /\b(por|x|c\/u)\s*(persona|invitado|cubierto)|\bper (person|guest|head)\b|\bpp\b|\bpax\b/i.test(name);
/** "Banquete por persona" -> "Banquete", for the calendar and the quote lines. */
const short = (name: string) =>
  name.replace(/\s*\b(por|x|c\/u|per)\s*(persona|invitado|cubierto|person|guest|head)\b/i, "").trim() || name;
/** The number of people in an answer like "Saturday the 20th, about 50 people". */
const peopleIn = (answer: string) => Number(answer.match(/(\d+)\s*(personas|invitados|people|guests)/i)?.[1] ?? 0);

/** The playbook when Claude didn't write one: the sample business's details, or careful defaults for "Other". */
export function defaultPlaybook(business: VisitorBusiness, texts: BusinessTexts, other: boolean, locale: AppLocale): Playbook {
  const [s1, s2] = business.services;
  const services = business.services.map((s) => ({ mention: lower(short(s.name)), perPerson: perPerson(s.name) }));
  const m1 = services[0].mention;
  const both = s2 ? (locale === "es" ? `${m1} y ${services[1].mention}` : `${m1} and ${services[1].mention}`) : m1;
  const withPeople = services.some((s) => s.perPerson);
  if (locale === "es") {
    // "Otro" in Spanish is another business with appointments (the demo only shows those for now).
    return other
      ? {
          unit: "hora",
          unitArticle: "una",
          combine: false,
          people: withPeople ? 50 : 0,
          services,
          priceQuestion: `¿Cuánto sale ${m1}?`,
          quoteRequest: `Hola, quiero cotizar: ${s1.name}`,
          bookRequest: `Hola, ¿tienen hora para ${m1} esta semana?`,
          quoteQuestion: withPeople ? "¡Claro! 😊 ¿Para qué fecha y cuántas personas serían?" : "¡Claro! 😊 ¿Para qué fecha lo necesitas?",
          quoteAnswer: withPeople ? "Sábado 20, unas 50 personas" : "Para el sábado 20",
          booking: `tu hora de ${m1}`,
          slots: texts.slots,
          client: texts.client,
        }
      : {
          unit: "hora",
          unitArticle: "una",
          combine: true,
          people: peopleIn(texts.quote.answer),
          services,
          priceQuestion: `¿Cuánto sale ${m1}?`,
          quoteRequest: `Hola, ¿me cotizan ${both}?`,
          bookRequest: `Hola, ¿tienen hora para ${m1} esta semana?`,
          quoteQuestion: texts.quote.question,
          quoteAnswer: texts.quote.answer,
          booking: `tu hora de ${m1}`,
          slots: texts.slots,
          client: texts.client,
        };
  }
  return other
    ? {
        unit: "date",
        unitArticle: "a",
        combine: false,
        people: withPeople ? 50 : 0,
        services,
        priceQuestion: "What are your prices?",
        quoteRequest: `Hi, I'd like a quote for: ${s1.name}`,
        bookRequest: `Hi, do you have a date available for ${s1.name}?`,
        quoteQuestion: withPeople ? "Sure! 😊 What date, and how many people?" : "Sure! 😊 What date do you need it for?",
        quoteAnswer: withPeople ? "Saturday the 20th, about 50 people" : "Saturday the 20th",
        booking: `your booking (${s1.name})`,
        slots: texts.slots,
        client: texts.client,
      }
    : {
        unit: "slot",
        unitArticle: "a",
        combine: true,
        people: peopleIn(texts.quote.answer),
        services,
        priceQuestion: `How much is ${m1}?`,
        quoteRequest: `Hi, can I get a quote for ${both}?`,
        bookRequest: `Hi, any slot for ${m1} this week?`,
        quoteQuestion: texts.quote.question,
        quoteAnswer: texts.quote.answer,
        booking: `your ${m1} appointment`,
        slots: texts.slots,
        client: texts.client,
      };
}

/** Claude's playbook, checked against the visitor's services; the default one if it doesn't fit. */
export function playbookFor(ctx: FlowContext, locale: AppLocale): Playbook {
  const base = defaultPlaybook(ctx.business, ctx.texts, Boolean(ctx.kind), locale);
  const pb = ctx.playbook;
  if (!pb || pb.services.length !== ctx.business.services.length || pb.slots.length !== 3) return base;
  return pb;
}

function shared(ctx: FlowContext, locale: AppLocale) {
  const { business } = ctx;
  const pb = playbookFor(ctx, locale);
  const [s1, s2] = business.services;
  const money = (n: number) => formatMoney(n, business.currency);
  const each = locale === "es" ? " por persona" : " per person";
  const price = (i: number) => `${money(business.services[i].amount)}${pb.services[i].perPerson ? each : ""}`;
  return {
    pb,
    s1,
    s2,
    money,
    price,
    name: business.name,
    // Only the visitor's own address: a sample one would show a street in another country.
    address: business.address ?? "",
    slots: pb.slots,
    client: pb.client,
    custom: Boolean(ctx.kind),
  };
}

/**
 * The quote card. Businesses where clients pick one service (a wedding or a
 * first communion) quote that one; the rest add up what was asked. Services
 * priced per person are multiplied by the people in the answer.
 */
function quoteCard(ctx: FlowContext, locale: AppLocale, rough: boolean, title: string, peopleWord: string): DemoCard {
  const { pb, money } = shared(ctx, locale);
  const picked = ctx.business.services.slice(0, pb.combine ? 2 : 1);
  let total = 0;
  const lines = picked.map(({ name, amount }, i): [string, string] => {
    const times = pb.services[i].perPerson && !rough && pb.people > 1 ? pb.people : 1;
    total += amount * times;
    return [times > 1 ? `${short(name)} × ${times} ${peopleWord}` : name, money(amount * times)];
  });
  return { kind: "quote", title, lines, total: money(total) };
}

/** "Hola, ¿tienen…?" -> "Hola otra vez, ¿tienen…?" when the same client comes back. */
function again(text: string, locale: AppLocale) {
  if (locale === "es") return /^hola\b/i.test(text) ? text.replace(/^hola\b,?/i, "Hola otra vez,") : `Hola otra vez 😊 ${text}`;
  return /^hi\b/i.test(text) ? text.replace(/^hi\b,?/i, "Hi again,") : `Hi again 😊 ${text}`;
}

function es(ctx: FlowContext): Record<PainKey, Flow> {
  const { pb, s1, s2, price, name, address, slots, client, custom } = shared(ctx, "es");
  const { texts, next } = ctx;
  const [m1, m2] = pb.services.map((s) => s.mention);
  const unitA = `${pb.unitArticle} ${pb.unit}`;
  const it = pb.unitArticle === "un" ? "lo" : "la";
  const kindTag = custom ? ` (${lower(ctx.kind)})` : "";
  const calendar = (lines: [string, string][]): DemoCard => ({ kind: "calendar", title: `Agenda · ${name}`, lines });
  const prices = s2 ? `${cap(m1)} sale ${price(0)} y ${m2}, ${price(1)}.` : `${cap(m1)} sale ${price(0)}.`;

  // Booking inside a situation, when no booking situation comes next.
  const slotsTurn = (benefit: string): Turn => ({
    text: "¡Genial! Tengo libre:",
    caption: "Ofrece solo horarios libres de tu agenda",
    benefit,
    choices: slots.map((slot) => ({ label: slot, to: "booked", set: { slot } })),
  });
  const bookedTurn = (m: Memory, benefit: string, outcome: string): Turn => ({
    text: `¡Listo! Quedaste ${m.slot} ✅ Te recordaré un día antes.`,
    card: calendar([[m.slot ?? slots[0], `${short(s1.name)} · ${client}`]]),
    caption: "La reserva queda en tu agenda, sola",
    benefit,
    outcome,
    choices: [],
  });

  const responderEnd = (): Choice[] =>
    next === "cotizar"
      ? [
          { label: "Sí, cotízame", to: NEXT, outcome: "Pidió una cotización" },
          { label: "Prefiero reservar", to: "slots" },
          { label: "Lo voy a pensar", to: "later" },
        ]
      : next === "agendar"
        ? [
            { label: "Sí, reservar", to: NEXT, outcome: "Listo para reservar" },
            { label: "Ver horarios", to: NEXT, outcome: "Listo para reservar" },
            { label: "Lo voy a pensar", to: "later" },
          ]
        : [
            { label: "Sí, reservar", to: "slots" },
            { label: "Ver horarios", to: "slots" },
            { label: "Lo voy a pensar", to: "later" },
          ];
  const responderAsk = next === "cotizar" ? "¿Quieres que te arme una cotización?" : `¿Te reservo ${unitA}?`;
  const book: Choice = next === "agendar" ? { label: "Sí, agendar", to: NEXT, outcome: "Cotización aceptada" } : { label: "Sí, agendar", to: "slots" };

  return {
    responder: {
      opening: (continued) => ({
        note: { text: continued ? "Otra noche, 11:40 p. m." : "11:40 p. m.", caption: `Es de noche y ${name} está cerrado` },
        client: address ? "¡Hola! ¿Atienden mañana? ¿Dónde están?" : "¡Hola! ¿Atienden mañana?",
        title: `Es de noche y un cliente le escribe a ${name}`,
        first: "hello",
      }),
      entry: "hello",
      node: (id, m) => {
        switch (id) {
          case "hello":
            return {
              text: `¡Hola! 😊 Te escribe el asistente de ${name}${kindTag}. Atendemos ${texts.hours}${address ? ` y estamos en ${address}` : ""}.`,
              caption: "Responde al instante, aunque estés durmiendo",
              benefit: "Nadie se queda sin respuesta, ni de noche ni el fin de semana.",
              choices: [
                { label: pb.priceQuestion, to: "price" },
                { label: "¿Qué servicios tienen?", to: "menu" },
              ],
            };
          case "price":
            return {
              text: `${prices} ${responderAsk}`,
              caption: "Da tus precios y lo invita a avanzar",
              benefit: "Da tus precios exactos al momento: una venta que no se pierde.",
              choices: responderEnd(),
            };
          case "menu":
            return {
              text: `Te cuento 😊\n${ctx.business.services.map((s, i) => `• ${s.name}: ${price(i)}`).join("\n")}\n${responderAsk}`,
              caption: "Muestra tu catálogo con precios",
              benefit: "Muestra todos tus servicios con precio, sin que tengas que escribirlos.",
              choices: responderEnd(),
            };
          case "slots":
            return slotsTurn("Pasa de pregunta a reserva en el mismo chat, sin esperarte.");
          case "booked":
            return bookedTurn(m, "La reserva queda hecha de noche, sin que tú despiertes.", "Reserva hecha");
          default:
            return {
              text: "¡Claro, sin apuro! 😊 Aquí estoy 24/7: cuando quieras me escribes y te reservo.",
              caption: "No presiona, pero deja la puerta abierta",
              benefit: "Aunque no reserve hoy, quedó atendido y con tus precios: no se va con la competencia.",
              outcome: "Cliente atendido",
              choices: [],
            };
        }
      },
    },

    cotizar: {
      opening: (continued) => ({
        note: continued ? { text: "Al día siguiente", caption: "Al día siguiente, el mismo cliente vuelve" } : undefined,
        client: continued ? again(pb.quoteRequest, "es") : pb.quoteRequest,
        title: "Ahora un cliente pide una cotización",
        first: "ask",
      }),
      entry: "ask",
      node: (id, m) => {
        switch (id) {
          case "ask":
            return {
              text: pb.quoteQuestion,
              caption: "Pide solo el dato que necesita",
              benefit: "Pide solo lo que necesita para cotizar, sin idas y vueltas.",
              choices: [
                { label: pb.quoteAnswer, to: "quote" },
                { label: "Dame un valor aproximado", to: "quote", set: { rough: true } },
              ],
            };
          case "quote":
            return {
              text: `${m.rough ? "¡Claro! Aquí tienes un valor de referencia 👇" : "¡Gracias! Aquí está tu cotización 👇"} ¿Lo agendamos?`,
              card: quoteCard(ctx, "es", Boolean(m.rough), `Cotización · ${name}`, "personas"),
              caption: "Arma la cotización con tus precios, en segundos",
              benefit: "La cotización sale en segundos, con tus precios y el total.",
              choices: [book, { label: "¿Tienen descuento?", to: "discount" }, { label: "Lo pienso y te aviso", to: "later" }],
            };
          case "discount":
            return {
              text: `Eso lo decide el equipo de ${name}: ya les dejé tu consulta y te responden hoy 🙌 ¿Quieres que te reserve mientras tanto?`,
              caption: "Lo que no sabe, se lo pasa a tu equipo",
              benefit: "No inventa precios ni descuentos: le pasa la consulta a tu equipo y sigue vendiendo.",
              choices: [book, { label: "Lo pienso y te aviso", to: "later" }],
            };
          case "slots":
            return slotsTurn("Y la convierte en una reserva: de pregunta a venta.");
          case "booked":
            return bookedTurn(m, "La cotización terminó en venta, sin que movieras un dedo.", "Venta cerrada");
          default:
            return {
              text: "¡Perfecto! Te dejo la cotización guardada aquí. Mañana te escribo para ver si te animas 😊",
              caption: "Hace el seguimiento por ti",
              benefit: "Hace el seguimiento solo: la cotización no queda en el olvido.",
              outcome: "Cotización enviada",
              choices: [],
            };
        }
      },
    },

    agendar: {
      opening: (continued) => ({
        note: continued ? { text: "Al día siguiente", caption: "Al día siguiente, el cliente quiere reservar" } : undefined,
        client: continued ? again(pb.bookRequest, "es") : pb.bookRequest,
        title: `Un cliente quiere reservar en ${name}`,
        first: "slots",
      }),
      entry: "slots",
      node: (id, m) => {
        switch (id) {
          case "slots":
            return {
              text: m.handoff ? "¡Genial! 🙌 Tengo libre:" : `¡Hola! Claro 😊 ${cap(m1)} sale ${price(0)}. Tengo libre:`,
              caption: "Revisa tu agenda y ofrece solo horarios libres",
              benefit: "Solo ofrece horarios libres: cero choques en tu agenda.",
              choices: [
                { label: slots[0], to: "name", set: { slot: slots[0] } },
                { label: slots[1], to: "name", set: { slot: slots[1] } },
                { label: "Otro día", to: "other" },
              ],
            };
          case "other":
            return {
              text: `Sin problema 😊 También tengo ${slots[2]}. ¿Te sirve?`,
              caption: "Busca otra opción por ti",
              benefit: "Busca otra opción solo: el cliente no se va sin reservar.",
              choices: [
                { label: slots[2], to: "name", set: { slot: slots[2] } },
                { label: "Avísame si se libera algo", to: "waitlist" },
              ],
            };
          case "name":
            return {
              text: `¡Perfecto! ¿A nombre de quién ${it} dejo?`,
              caption: "Pide los datos que necesitas",
              benefit: "Pide los datos por ti, sin idas y vueltas.",
              choices: [{ label: client, to: "done" }],
            };
          case "waitlist":
            return {
              text: `¡Listo! Te anoto en la lista de espera y te aviso apenas se libere ${unitA} 🔔`,
              caption: "Lo anota en lista de espera",
              benefit: "Si no hay espacio, lo anota en lista de espera: no pierdes al cliente.",
              outcome: "En lista de espera",
              choices: [],
            };
          default:
            return {
              text: `¡Listo, ${client}! Quedaste ${m.slot} ✅ Te recordaré un día antes.`,
              card: calendar([[m.slot ?? slots[0], `${short(s1.name)} · ${client}`]]),
              caption: "La reserva queda en tu agenda, sin que hagas nada",
              benefit: "La reserva queda guardada y el recordatorio programado.",
              outcome: "Reserva agendada",
              choices: [],
            };
        }
      },
    },

    reprogramar: {
      opening: () => ({
        note: { text: "Un día antes", caption: "Un día antes de la reserva" },
        title: "Un día antes, tu asistente escribe solo",
        first: "remind",
      }),
      entry: "remind",
      node: (id, m) => {
        const booked = m.slot ?? slots[0];
        const free = slots.filter((s) => s !== (m.oldSlot ?? booked)).slice(0, 2);
        switch (id) {
          case "remind":
            return {
              text: `Hola ${client} 👋 Te recordamos ${pb.booking}: ${booked} en ${name}. ¿Confirmas?`,
              caption: "Envía el recordatorio solo",
              benefit: "El recordatorio sale solo: menos clientes que no llegan.",
              choices: [
                { label: `Necesito cambiar${it}`, to: "slots", set: { oldSlot: booked } },
                { label: "Confirmo", to: "confirmed", set: { slot: booked } },
                { label: "Quiero cancelar", to: "cancel", set: { oldSlot: booked } },
              ],
            };
          case "slots":
            return {
              text: "Sin problema 😊 Tengo libre:",
              caption: "Le ofrece otros horarios libres",
              benefit: "Ofrece otros horarios sin que tengas que llamar a nadie.",
              choices: free.map((slot) => ({ label: slot, to: "moved", set: { slot } })),
            };
          case "moved":
            return {
              text: `¡Listo! Te cambié a ${m.slot} ✅ El horario anterior quedó libre para otra persona.`,
              card: calendar([
                [m.oldSlot ?? slots[0], "Liberado"],
                [m.slot ?? slots[1], `${short(s1.name)} · ${client}`],
              ]),
              caption: "Tu agenda se actualiza sola",
              benefit: "El horario que quedó libre se vuelve a ofrecer a otro cliente.",
              outcome: "Reserva cambiada",
              choices: [],
            };
          case "confirmed":
            return {
              text: `¡Gracias, ${client}! Te esperamos ${booked} 😊`,
              card: calendar([[booked, "Confirmada ✅"]]),
              caption: "La confirmación queda anotada",
              benefit: "Sabes quién viene, sin llamar a nadie.",
              outcome: "Reserva confirmada",
              choices: [],
            };
          case "cancel":
            return {
              text: `Qué pena 😕 ¿Prefieres que te ${it} cambie a otro día en vez de cancelar?`,
              caption: "Intenta salvar la reserva antes de cancelarla",
              benefit: "Antes de cancelar, ofrece cambiar el día: salva reservas que se perdían.",
              choices: [
                { label: "Sí, cambiar de día", to: "slots" },
                { label: "No, cancela", to: "cancelled", set: { slot: "" } },
              ],
            };
          default:
            return {
              text: "Listo, cancelé tu reserva ✅ Ese horario ya está libre y se lo ofrezco a quien esté en lista de espera.",
              card: calendar([[m.oldSlot ?? booked, "Liberado"]]),
              caption: "Libera el horario y lo vuelve a ofrecer",
              benefit: "El horario cancelado se vuelve a ofrecer: tu agenda no queda con huecos.",
              outcome: "Horario liberado",
              choices: [],
            };
        }
      },
    },
  };
}

function en(ctx: FlowContext): Record<PainKey, Flow> {
  const { pb, s1, s2, price, name, address, slots, client, custom } = shared(ctx, "en");
  const { texts, next } = ctx;
  const [m1, m2] = pb.services.map((s) => s.mention);
  const unitA = `${pb.unitArticle} ${pb.unit}`;
  const kindTag = custom ? ` (${lower(ctx.kind)})` : "";
  const calendar = (lines: [string, string][]): DemoCard => ({ kind: "calendar", title: `Calendar · ${name}`, lines });
  const prices = s2 ? `${cap(m1)} is ${price(0)} and ${m2} is ${price(1)}.` : `${cap(m1)} is ${price(0)}.`;

  const slotsTurn = (benefit: string): Turn => ({
    text: "Great! I have:",
    caption: "It only offers free times from your calendar",
    benefit,
    choices: slots.map((slot) => ({ label: slot, to: "booked", set: { slot } })),
  });
  const bookedTurn = (m: Memory, benefit: string, outcome: string): Turn => ({
    text: `Done! You're booked ${m.slot} ✅ I'll remind you the day before.`,
    card: calendar([[m.slot ?? slots[0], `${short(s1.name)} · ${client}`]]),
    caption: "The booking lands in your calendar by itself",
    benefit,
    outcome,
    choices: [],
  });

  const responderEnd = (): Choice[] =>
    next === "cotizar"
      ? [
          { label: "Yes, quote me", to: NEXT, outcome: "Asked for a quote" },
          { label: "I'd rather book", to: "slots" },
          { label: "I'll think about it", to: "later" },
        ]
      : next === "agendar"
        ? [
            { label: "Yes, book", to: NEXT, outcome: "Ready to book" },
            { label: "See times", to: NEXT, outcome: "Ready to book" },
            { label: "I'll think about it", to: "later" },
          ]
        : [
            { label: "Yes, book", to: "slots" },
            { label: "See times", to: "slots" },
            { label: "I'll think about it", to: "later" },
          ];
  const responderAsk = next === "cotizar" ? "Want me to put a quote together?" : `Want me to book you ${unitA}?`;
  const book: Choice = next === "agendar" ? { label: "Yes, book it", to: NEXT, outcome: "Quote accepted" } : { label: "Yes, book it", to: "slots" };

  return {
    responder: {
      opening: (continued) => ({
        note: { text: continued ? "Another night, 11:40 PM" : "11:40 PM", caption: `It's night and ${name} is closed` },
        client: address ? "Hi! Are you open tomorrow? Where are you?" : "Hi! Are you open tomorrow?",
        title: `It's night and a client writes to ${name}`,
        first: "hello",
      }),
      entry: "hello",
      node: (id, m) => {
        switch (id) {
          case "hello":
            return {
              text: `Hi! 😊 This is ${name}'s assistant${kindTag}. We're open ${texts.hours}${address ? ` at ${address}` : ""}.`,
              caption: "It answers instantly, even while you sleep",
              benefit: "Nobody goes unanswered, not even at night or on weekends.",
              choices: [
                { label: pb.priceQuestion, to: "price" },
                { label: "What services do you have?", to: "menu" },
              ],
            };
          case "price":
            return {
              text: `${prices} ${responderAsk}`,
              caption: "It shares your prices and moves things forward",
              benefit: "It gives your exact prices right away: a sale you don't lose.",
              choices: responderEnd(),
            };
          case "menu":
            return {
              text: `Here you go 😊\n${ctx.business.services.map((s, i) => `• ${s.name}: ${price(i)}`).join("\n")}\n${responderAsk}`,
              caption: "It shows your menu with prices",
              benefit: "It shows all your services with prices, without you typing them.",
              choices: responderEnd(),
            };
          case "slots":
            return slotsTurn("From question to booking in the same chat, without waiting for you.");
          case "booked":
            return bookedTurn(m, "The booking is made at night, without waking you up.", "Booked");
          default:
            return {
              text: "Sure, no rush! 😊 I'm here 24/7: write whenever you like and I'll book you in.",
              caption: "No pressure, but the door stays open",
              benefit: "Even if they don't book today, they got your prices: they don't go to a competitor.",
              outcome: "Client answered",
              choices: [],
            };
        }
      },
    },

    cotizar: {
      opening: (continued) => ({
        note: continued ? { text: "The next day", caption: "The next day, the same client comes back" } : undefined,
        client: continued ? again(pb.quoteRequest, "en") : pb.quoteRequest,
        title: "Now a client asks for a quote",
        first: "ask",
      }),
      entry: "ask",
      node: (id, m) => {
        switch (id) {
          case "ask":
            return {
              text: pb.quoteQuestion,
              caption: "It asks only for what it needs",
              benefit: "It asks only for what it needs to quote, no back and forth.",
              choices: [
                { label: pb.quoteAnswer, to: "quote" },
                { label: "Just a rough price", to: "quote", set: { rough: true } },
              ],
            };
          case "quote":
            return {
              text: `${m.rough ? "Sure! Here's a ballpark 👇" : "Thanks! Here's your quote 👇"} Shall we book it?`,
              card: quoteCard(ctx, "en", Boolean(m.rough), `Quote · ${name}`, "people"),
              caption: "It builds the quote with your prices, in seconds",
              benefit: "The quote is ready in seconds, with your prices and the total.",
              choices: [book, { label: "Any discount?", to: "discount" }, { label: "I'll think and let you know", to: "later" }],
            };
          case "discount":
            return {
              text: `That's up to the ${name} team: I've passed on your question and they'll reply today 🙌 Want me to hold ${unitA} meanwhile?`,
              caption: "What it doesn't know, it passes to your team",
              benefit: "It never makes up prices or discounts: it hands the question to your team and keeps selling.",
              choices: [book, { label: "I'll think and let you know", to: "later" }],
            };
          case "slots":
            return slotsTurn("And turns it into a booking: from question to sale.");
          case "booked":
            return bookedTurn(m, "The quote turned into a sale without you lifting a finger.", "Sale closed");
          default:
            return {
              text: "Perfect! I'll keep the quote here for you. I'll check in tomorrow to see if you're in 😊",
              caption: "It follows up for you",
              benefit: "It follows up by itself: the quote isn't forgotten.",
              outcome: "Quote sent",
              choices: [],
            };
        }
      },
    },

    agendar: {
      opening: (continued) => ({
        note: continued ? { text: "The next day", caption: "The next day, the client wants to book" } : undefined,
        client: continued ? again(pb.bookRequest, "en") : pb.bookRequest,
        title: `A client wants to book at ${name}`,
        first: "slots",
      }),
      entry: "slots",
      node: (id, m) => {
        switch (id) {
          case "slots":
            return {
              text: m.handoff ? "Great! 🙌 I have:" : `Hi! Sure 😊 ${cap(m1)} is ${price(0)}. I have:`,
              caption: "It checks your calendar and only offers free times",
              benefit: "It only offers free times: no clashes in your calendar.",
              choices: [
                { label: slots[0], to: "name", set: { slot: slots[0] } },
                { label: slots[1], to: "name", set: { slot: slots[1] } },
                { label: "Another day", to: "other" },
              ],
            };
          case "other":
            return {
              text: `No problem 😊 I also have ${slots[2]}. Does that work?`,
              caption: "It looks for another option for you",
              benefit: "It finds another option by itself: the client doesn't leave without booking.",
              choices: [
                { label: slots[2], to: "name", set: { slot: slots[2] } },
                { label: "Let me know if one frees up", to: "waitlist" },
              ],
            };
          case "name":
            return {
              text: "Perfect! What name should I book it under?",
              caption: "It asks for the details you need",
              benefit: "It collects the details for you, no back and forth.",
              choices: [{ label: client, to: "done" }],
            };
          case "waitlist":
            return {
              text: `Done! You're on the waiting list and I'll message you as soon as ${unitA} frees up 🔔`,
              caption: "It puts them on the waiting list",
              benefit: "If nothing is free, it puts them on a waiting list: you don't lose the client.",
              outcome: "On the waiting list",
              choices: [],
            };
          default:
            return {
              text: `Done, ${client}! You're booked ${m.slot} ✅ I'll remind you the day before.`,
              card: calendar([[m.slot ?? slots[0], `${short(s1.name)} · ${client}`]]),
              caption: "The booking lands in your calendar without you lifting a finger",
              benefit: "The booking is saved and the reminder scheduled.",
              outcome: "Booked",
              choices: [],
            };
        }
      },
    },

    reprogramar: {
      opening: () => ({
        note: { text: "One day before", caption: "One day before the booking" },
        title: "One day before, your assistant writes by itself",
        first: "remind",
      }),
      entry: "remind",
      node: (id, m) => {
        const booked = m.slot ?? slots[0];
        const free = slots.filter((s) => s !== (m.oldSlot ?? booked)).slice(0, 2);
        switch (id) {
          case "remind":
            return {
              text: `Hi ${client} 👋 Reminder of ${pb.booking}: ${booked} at ${name}. Can you confirm?`,
              caption: "It sends the reminder by itself",
              benefit: "The reminder goes out on its own: fewer no-shows.",
              choices: [
                { label: "I need to change it", to: "slots", set: { oldSlot: booked } },
                { label: "Confirmed", to: "confirmed", set: { slot: booked } },
                { label: "I want to cancel", to: "cancel", set: { oldSlot: booked } },
              ],
            };
          case "slots":
            return {
              text: "No problem 😊 I have:",
              caption: "It offers other free times",
              benefit: "It offers other times without you calling anyone.",
              choices: free.map((slot) => ({ label: slot, to: "moved", set: { slot } })),
            };
          case "moved":
            return {
              text: `Done! Moved you to ${m.slot} ✅ The previous time is free for someone else.`,
              card: calendar([
                [m.oldSlot ?? slots[0], "Freed up"],
                [m.slot ?? slots[1], `${short(s1.name)} · ${client}`],
              ]),
              caption: "Your calendar updates itself",
              benefit: "The freed time is offered to another client.",
              outcome: "Rescheduled",
              choices: [],
            };
          case "confirmed":
            return {
              text: `Thanks, ${client}! See you ${booked} 😊`,
              card: calendar([[booked, "Confirmed ✅"]]),
              caption: "The confirmation is noted",
              benefit: "You know who's coming, without calling anyone.",
              outcome: "Confirmed",
              choices: [],
            };
          case "cancel":
            return {
              text: "Oh no 😕 Would you rather move it to another day instead of cancelling?",
              caption: "It tries to save the booking first",
              benefit: "Before cancelling, it offers another day: it saves bookings you used to lose.",
              choices: [
                { label: "Yes, move it", to: "slots" },
                { label: "No, cancel it", to: "cancelled", set: { slot: "" } },
              ],
            };
          default:
            return {
              text: "Done, your booking is cancelled ✅ That time is free again and I'll offer it to whoever is on the waiting list.",
              card: calendar([[m.oldSlot ?? booked, "Freed up"]]),
              caption: "It frees the time and offers it again",
              benefit: "The cancelled time is offered again: no gaps in your calendar.",
              outcome: "Time freed",
              choices: [],
            };
        }
      },
    },
  };
}

export function buildFlow(pain: PainKey, ctx: FlowContext, locale: AppLocale): Flow {
  return (locale === "es" ? es : en)(ctx)[pain];
}

// ---- Playing the conversation -------------------------------------------------

export type ChatMessage = {
  from: "note" | "client" | "bot";
  text: string;
  chapter: number;
  card?: DemoCard;
  /** For the assistant: the answers the client could tap, and the one they picked. */
  choices?: string[];
  chosen?: string;
  caption?: string;
  benefit?: string;
  /** Written by the visitor (or answered by the AI), outside the guided demo. */
  live?: boolean;
};

export type Pending = { kind: "note"; text: string; caption: string } | { kind: "bot"; id: string } | { kind: "choose"; choices: Choice[] };

export type Engine = {
  log: ChatMessage[];
  pending: Pending[];
  memory: Memory;
  chapter: number;
  /** Set when the situation is over. `handoff`: the next situation picks up the client's last message. */
  end: { outcome: string; handoff: boolean } | null;
};

export const emptyEngine: Engine = { log: [], pending: [], memory: {}, chapter: 0, end: null };

/** Starts a situation after whatever is already in the chat. */
export function openChapter(engine: Engine, flow: Flow, chapter: number, handoff: boolean): Engine {
  const pending: Pending[] = [];
  if (handoff) {
    pending.push({ kind: "bot", id: flow.entry });
  } else {
    const opening = flow.opening(engine.log.length > 0);
    if (opening.note) pending.push({ kind: "note", ...opening.note });
    pending.push(opening.client ? { kind: "choose", choices: [{ label: opening.client, to: opening.first }] } : { kind: "bot", id: opening.first });
  }
  return { ...engine, chapter, pending, memory: { ...engine.memory, handoff, rough: false }, end: null };
}

/** Shows the next note or assistant message. */
export function advance(engine: Engine, flow: Flow): Engine {
  const [head, ...rest] = engine.pending;
  if (!head || head.kind === "choose") return engine;
  if (head.kind === "note") {
    return { ...engine, pending: rest, log: [...engine.log, { from: "note", text: head.text, caption: head.caption, chapter: engine.chapter }] };
  }
  const turn = flow.node(head.id, engine.memory);
  const message: ChatMessage = {
    from: "bot",
    text: turn.text,
    card: turn.card,
    caption: turn.caption,
    benefit: turn.benefit,
    choices: turn.choices.map((c) => c.label),
    chapter: engine.chapter,
  };
  return {
    ...engine,
    log: [...engine.log, message],
    pending: turn.choices.length ? [{ kind: "choose", choices: turn.choices }] : [],
    end: turn.choices.length ? null : { outcome: turn.outcome ?? "", handoff: false },
  };
}

/** The client answers with one of the options. */
export function choose(engine: Engine, choice: Choice): Engine {
  const head = engine.pending[0];
  if (head?.kind !== "choose" || !head.choices.some((c) => c.label === choice.label)) return engine;
  const log = [...engine.log];
  const last = log.at(-1);
  if (last?.from === "bot" && last.choices?.length && !last.chosen) log[log.length - 1] = { ...last, chosen: choice.label };
  log.push({ from: "client", text: choice.label, chapter: engine.chapter });
  const memory = { ...engine.memory, ...choice.set };
  if (choice.to === NEXT) return { ...engine, log, memory, pending: [], end: { outcome: choice.outcome ?? "", handoff: true } };
  return { ...engine, log, memory, pending: [{ kind: "bot", id: choice.to }] };
}

/** Plays the rest of the situation with the suggested answers. */
export function fastForward(engine: Engine, flow: Flow): Engine {
  let current = engine;
  for (let i = 0; i < 40 && !current.end && current.pending.length; i++) {
    const head = current.pending[0];
    current = head.kind === "choose" ? choose(current, head.choices[0]) : advance(current, flow);
  }
  return current;
}

/** How many more answers the client gives on the suggested path. */
export function answersLeft(engine: Engine, flow: Flow) {
  const before = engine.log.filter((m) => m.from === "client").length;
  return fastForward(engine, flow).log.filter((m) => m.from === "client").length - before;
}
