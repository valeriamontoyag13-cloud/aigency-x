import type { BusinessKey, PainKey } from "@/content/demoBusinesses";
import { demoBusinesses } from "@/content/demoBusinesses";
import { formatMoney, type Currency } from "@/lib/money";

/**
 * The moments of the demo in Spanish: the same scenes as demo-citas
 * (demo-citas/fuente-demo/momentos.js), told step by step in the guided
 * design. They only show what the real product already does: it answers,
 * books on each professional's calendar, holds a slot while the deposit is
 * paid (the owner confirms it), frees unpaid slots for the waiting list,
 * sends reminders, steps aside when the owner answers, and sends a summary
 * every morning.
 */

/** What the real assistant knows from a moment on: the client's name and bookings ("yyyy-MM-dd HH:mm"). */
export type AssistantState = {
  nombre: string;
  reservas: {
    reserva_id: string;
    inicio: string;
    servicio_id: string;
    servicio_nombre: string;
    barbero_id: string;
    barbero_nombre: string;
    nombre: string;
  }[];
};

export type Step =
  /** A date line in the chat ("HOY · 11:40 P. M."). */
  | { k: "time"; text: string }
  /** What happens behind the chat (calendar, notices). */
  | { k: "sys"; text: string }
  /** The person holding the phone sends this message with a tap. */
  | { k: "send"; text: string }
  /** The business writes: the assistant, or the owner when `by` is set. */
  | { k: "bot"; text: string; by?: string }
  /** The person holding the phone picks an answer; each one goes on its own way. */
  | { k: "choose"; options: { label: string; then: Step[] }[] }
  /** The story jumps ahead ("Pasan 2 horas"). */
  | { k: "next"; label: string }
  /** Another phone: the client's chat with the business, or the owner's chat with the assistant. */
  | { k: "scene"; owner: boolean }
  /** A transfer receipt sent by the client. */
  | { k: "receipt"; amount: string }
  /** From here on the real assistant knows this (so the visitor can keep the chat going). */
  | { k: "state"; state: AssistantState | null };

export type Moment = {
  id: number;
  /** Short name for the tab. */
  tab: string;
  tag: string;
  title: string;
  text: string;
  /** How it works, for the curious. */
  behind: string;
  gains: string[];
  /** Minutes it would have taken by hand. */
  minutes: number;
  /** The chat is open: the visitor writes and the real assistant answers. */
  open?: boolean;
  /** Questions to try in the open chat. */
  tries?: string[];
  /** Who holds the phone in this moment ("la clienta"). */
  holder: string;
  steps: Step[];
};

export type MomentsInput = {
  key: BusinessKey;
  custom: string;
  name: string;
  owner: string;
  address?: string;
  currency: Currency;
  services: { name: string; amount: number }[];
  pains: PainKey[];
};

type Words = {
  fem: boolean;
  client: string;
  emoji: string;
  icon: string;
  names: { night: string; deposit: string; freed: string; waiting: string; reminder: string; control: string };
  ask: (service: string) => string;
  tip: string;
  control: {
    forWho: string;
    hello: (owner: string) => string;
    owner1: string;
    ask: (service: string) => string;
    owner2: string;
    again: string;
  };
};

const words: Record<BusinessKey, Words> = {
  salon: {
    fem: true,
    client: "clienta",
    emoji: "💕",
    icon: "💇‍♀️",
    names: { night: "Josefa Muñoz", deposit: "Valentina", freed: "Fernanda", waiting: "Javiera", reminder: "Daniela", control: "Coni" },
    ask: (s) => `hola! tienen hora mañana para ${s}? 💕`,
    tip: "Llega 5 minutos antes para hacerlo todo con calma ✨",
    control: {
      forWho: "tu mamá",
      hello: (d) => `Hola ${d}!! soy la Coni, la del matrimonio 💕 te quería contar algo`,
      owner1: "¡Coni! 💕 Cuéntame, ¿cómo te fue en el matri? Vi las fotos, ¡estaban preciosas!",
      ask: (s) => `Increíble!! oye y te quería pedir hora para mi mamá, ${s}, el sábado tienes?`,
      owner2: "Mmm el sábado está llenito 😅 déjame ver y te escribo más rato",
      again: "Holi, al final pudiste ver lo de mi mamá? 🙏",
    },
  },
  barberia: {
    fem: false,
    client: "cliente",
    emoji: "💈",
    icon: "💈",
    names: { night: "Diego Rojas", deposit: "Tomás", freed: "Felipe", waiting: "Ignacio", reminder: "Martín", control: "Pancho" },
    ask: (s) => `wena! tienen hora mañana para ${s}?`,
    tip: "Llega 5 minutos antes y salimos al tiro 💈",
    control: {
      forWho: "tu papá",
      hello: (d) => `${d}!! soy el Pancho, el del corte pal matri 💈 te tengo que contar algo`,
      owner1: "¡Pancho! ¿Cómo estuvo el matri? Quedaste impecable en las fotos 🔥",
      ask: (s) => `Brutal!! oye y te quería pedir hora para mi papá, ${s}, el sábado tienes?`,
      owner2: "Uff el sábado está lleno 😅 déjame ver y te escribo más rato",
      again: "Wena, al final pudiste ver lo de mi papá?",
    },
  },
  unas: {
    fem: true,
    client: "clienta",
    emoji: "💅",
    icon: "💅",
    names: { night: "Antonia Soto", deposit: "Valentina", freed: "Fernanda", waiting: "Javiera", reminder: "Daniela", control: "Coni" },
    ask: (s) => `holaa! tienen hora mañana para ${s}? 💅`,
    tip: "Ven con las uñas sin esmalte, así quedan perfectas 💅",
    control: {
      forWho: "tu hermana",
      hello: (d) => `Holaa ${d}!! soy la Coni, la de las uñas para el matri 💅 te quería contar algo`,
      owner1: "¡Coni! ¿Cómo te fue? ¿Aguantaron las uñas toda la fiesta? 😍",
      ask: (s) => `Siii perfectas!! oye y te quería pedir hora para mi hermana, ${s}, el sábado tienes?`,
      owner2: "Mmm el sábado está llenito 😅 déjame ver y te escribo más rato",
      again: "Holi, al final pudiste ver lo de mi hermana? 🙏",
    },
  },
  pestanas: {
    fem: true,
    client: "clienta",
    emoji: "✨",
    icon: "👁️",
    names: { night: "Catalina Reyes", deposit: "Valentina", freed: "Fernanda", waiting: "Javiera", reminder: "Daniela", control: "Coni" },
    ask: (s) => `hola! tienen hora mañana para ${s}? ✨`,
    tip: "Ven sin maquillaje en los ojos, así duran mucho más ✨",
    control: {
      forWho: "tu prima",
      hello: (d) => `Hola ${d}!! soy la Coni, la de las pestañas para la gradu ✨ te quería contar algo`,
      owner1: "¡Coni! ¿Cómo te fue en la gradu? ¡Te vi en las fotos, quedaste regia! 😍",
      ask: (s) => `Increíble!! oye y te quería pedir hora para mi prima, ${s}, el sábado tienes?`,
      owner2: "Mmm el sábado está llenito 😅 déjame ver y te escribo más rato",
      again: "Holi, al final pudiste ver lo de mi prima? 🙏",
    },
  },
  clinica: {
    fem: false,
    client: "paciente",
    emoji: "🙂",
    icon: "🩺",
    names: { night: "Ignacio Pérez", deposit: "Andrés", freed: "Claudia", waiting: "Rodrigo", reminder: "Patricia", control: "Marcela" },
    ask: (s) => `Hola, buenas noches. ¿Tienen hora mañana para ${s}?`,
    tip: "Si tienes exámenes anteriores, tráelos ese día 🙏",
    control: {
      forWho: "tu mamá",
      hello: (d) => `Hola ${d}, soy Marcela, la paciente del martes 😊 le quería comentar algo`,
      owner1: "¡Hola, Marcela! Qué gusto. Cuénteme, ¿cómo se ha sentido?",
      ask: (s) => `Mucho mejor, gracias! Oiga, le quería pedir hora para mi mamá, ${s}, ¿el sábado tiene?`,
      owner2: "El sábado está completo 😅 déjeme revisar y le escribo más tarde",
      again: "Hola, ¿pudo revisar lo de mi mamá? 🙏",
    },
  },
  veterinaria: {
    fem: false,
    client: "cliente",
    emoji: "🐾",
    icon: "🐾",
    names: { night: "Sofía Lagos", deposit: "Camila", freed: "Matías", waiting: "Paula", reminder: "Andrea", control: "Vale" },
    ask: (s) => `Hola! tienen hora mañana para ${s}? es para mi perrita 🐶`,
    tip: "Trae su carnet de vacunas, por favor 🐾",
    control: {
      forWho: "tu otro perrito",
      hello: (d) => `Hola ${d}! soy la Vale, la dueña de la Luna 🐶 te quería contar algo`,
      owner1: "¡Vale! ¿Cómo sigue la Luna? 🐾",
      ask: (s) => `Súper bien, ya come de todo 🙌 oye y te quería pedir hora para mi otro perrito, ${s}, el sábado tienes?`,
      owner2: "El sábado está lleno 😅 déjame ver y te escribo más rato",
      again: "Hola, al final pudiste ver lo de mi otro perrito? 🙏",
    },
  },
  otro: {
    fem: false,
    client: "cliente",
    emoji: "✨",
    icon: "✨",
    names: { night: "Tomás Torres", deposit: "Matías", freed: "Paulina", waiting: "Cristián", reminder: "Gabriela", control: "Pía" },
    ask: (s) => `Hola! tienen hora mañana para ${s}?`,
    tip: "Te esperamos 5 minutos antes ✨",
    control: {
      forWho: "tu mamá",
      hello: (d) => `Hola ${d}! soy la Pía, la de la semana pasada 😊 te quería contar algo`,
      owner1: "¡Pía! Qué gusto, cuéntame",
      ask: (s) => `Todo increíble! oye y te quería pedir hora para mi mamá, ${s}, el sábado tienes?`,
      owner2: "El sábado está lleno 😅 déjame ver y te escribo más rato",
      again: "Hola, al final pudiste ver lo de mi mamá? 🙏",
    },
  },
};

/** Which moments each answer of "what takes most of your time" shows; the open chat always goes first. */
const momentsFor: Record<PainKey, number[]> = { responder: [5], agendar: [1, 2, 3, 6], reprogramar: [4], cotizar: [] };

const low = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const hh = (h: number) => `${h}:00`;
/** "Round" amounts for the examples (deposits, sales): 2 significant digits. */
const round = (v: number) => {
  if (v <= 0) return 0;
  const step = Math.pow(10, Math.max(0, Math.floor(Math.log10(v)) - 1));
  return Math.max(step, Math.round(v / step) * step);
};
const pad = (n: number) => String(n).padStart(2, "0");
/** The next given weekday (0 = Sunday) at this hour, as the assistant's calendar writes it. */
function next(weekday: number, hour: number) {
  const day = new Date();
  day.setDate(day.getDate() + ((weekday - day.getDay() + 7) % 7 || 7));
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())} ${pad(hour)}:00`;
}
const WEEKDAY: Record<string, number> = { lunes: 1, martes: 2, miércoles: 3, jueves: 4, viernes: 5, sábado: 6 };

export function buildMoments(demo: MomentsInput): Moment[] {
  const sample = demoBusinesses[demo.key];
  const team = sample.assistant;
  const w = words[demo.key];
  const N = demo.name;
  const D = demo.owner || team.owner;
  const pros = team.team;
  const H = team.hours;
  const money = (n: number) => formatMoney(n, demo.currency);
  // Only the visitor's own address: a sample one would be a street in another country.
  const where = demo.address ?? "";
  const [A, B = A] = demo.services;
  const pricey = [...demo.services].sort((x, y) => y.amount - x.amount);
  const [C1, C2 = C1] = pricey;
  const deposit = (p: number) => round(p * 0.3);
  const aClient = `${w.fem ? "una" : "un"} ${w.client}`;
  const theClient = `${w.fem ? "la" : "el"} ${w.client}`;
  const booked = w.fem ? "agendada" : "agendado";
  const welcome = w.fem ? "Bienvenida" : "Bienvenido";
  const holder = `Tú eres ${theClient}`;
  const tap: Step = { k: "sys", text: `👇 Tú eres ${theClient}: toca el mensaje de abajo para escribirlo.` };
  // What the real assistant knows after each booking, so the visitor can keep chatting as that client.
  const booking = (client: string, start: string, service: MomentsInput["services"][number], pro: string): Step => ({
    k: "state",
    state: {
      nombre: client,
      reservas: [
        {
          reserva_id: "D-demo",
          inicio: start,
          servicio_id: `srv${demo.services.indexOf(service) + 1}`,
          servicio_nombre: service.name,
          barbero_id: `pro${pros.indexOf(pro) + 1 || 1}`,
          barbero_nombre: pro,
          nombre: client,
        },
      ],
    },
  });
  const saturday = (h: number) => next(6, h);

  // 1 · Booked at night
  const nightHours = [H[0], H[2], H[H.length - 3]];
  const nightName = w.names.night;
  const nightFirst = nightName.split(" ")[0];
  const night: Step[] = [
    { k: "time", text: "HOY · 11:40 P. M." },
    tap,
    { k: "send", text: w.ask(low(A.name)) },
    {
      k: "bot",
      text: `¡Hola! 👋 ${welcome} a *${N}* ${w.emoji}\n\nSí, mañana sábado me quedan estas horas para *${A.name}* (${money(A.amount)}):`,
    },
    {
      k: "choose",
      options: nightHours.map((h) => ({
        label: hh(h),
        then: [
          { k: "bot", text: "¡Perfecto! ¿A nombre de quién dejo la hora?" },
          { k: "send", text: nightName },
          {
            k: "bot",
            text: `¡Listo, ${nightFirst}! ✅ Quedaste ${booked}:\n\n${w.icon} ${A.name} · ${money(A.amount)}\n🗓 Mañana sábado · ${hh(h)}\n👤 Te atiende ${pros[0]}\n🙋 A nombre de *${nightName}*${where ? `\n📍 ${where}` : ""}\n\nMañana, 2 horas antes, te llega un recordatorio por aquí. ¡Te esperamos! ${w.emoji}`,
          },
          booking(nightName, saturday(h), A, pros[0]),
          { k: "sys", text: `📅 La hora entró al calendario de ${pros[0]} a nombre de ${nightName}. ${D} estaba durmiendo y no tuvo que contestar nada.` },
        ],
      })),
    },
  ];

  // 2 · Deposit the owner confirms
  const dep = { name: w.names.deposit, amount: deposit(C1.amount) };
  const depHours: [string, string, number, number][] = [
    [`Sábado ${hh(H[1])}`, `el sábado a las ${hh(H[1])}`, 6, H[1]],
    [`Martes ${hh(H[4] ?? H[1])}`, `el martes a las ${hh(H[4] ?? H[1])}`, 2, H[4] ?? H[1]],
  ];
  const depService = `${w.icon} ${C1.name} con ${pros[1]}`;
  const depositSteps: Step[] = [
    { k: "time", text: "HOY · 1:05 P. M." },
    tap,
    { k: "send", text: `Hola! quería consultar por ${low(C1.name)}, cuánto sale? 🙈` },
    {
      k: "bot",
      text: `¡Hola, ${dep.name}! ✨ *${C1.name}* tiene un valor de *${money(C1.amount)}*.\n\nPara asegurar la hora se pide un abono de *${money(dep.amount)}* que se descuenta del total. Tengo estas horas con ${pros[1]}:`,
    },
    {
      k: "choose",
      options: depHours.map(([label, when, day, hour]) => ({
        label,
        then: [
          {
            k: "bot",
            text: `¡Te la aparté! ⏳\n\n${depService} · ${when}\n💳 Abono: *${money(dep.amount)}* (se descuenta del total)\n\nTransfiere a la cuenta de *${N}* (te dejo los datos abajo) y mándame el comprobante por aquí. Tienes *2 horas* para pagarlo; después la hora se libera.\n\n🏦 Banco de ejemplo · Cuenta 00000000`,
          },
          booking(dep.name, next(day, hour), C1, pros[1]),
          { k: "sys", text: `📅 En el calendario aparece "⏳ Abono pendiente · ${dep.name}": nadie más puede tomar esa hora mientras tanto.` },
          { k: "next", label: `${dep.name} transfiere y manda el comprobante` },
          { k: "receipt", amount: money(dep.amount) },
          { k: "bot", text: `¡Gracias, ${dep.name}! 🙌 Le pasé tu comprobante a ${D} para que lo confirme. Te aviso apenas lo vea.` },
          { k: "next", label: `Mientras tanto, en el WhatsApp de ${D}` },
          { k: "scene", owner: true },
          { k: "time", text: "HOY" },
          {
            k: "bot",
            text: `💳 *Abono por revisar en ${N}*\n\n${dep.name} (+56 9 ···· 4821) avisa que pagó el abono de *${money(dep.amount)}* para su hora del ${when.replace(/^el /, "")}.\n\nRevisa tu cuenta y responde tocando Recibido o No llegó.`,
          },
          {
            k: "choose",
            options: [
              {
                label: "Recibido",
                then: [
                  { k: "bot", text: `✅ Listo. La hora de ${dep.name} quedó confirmada y ya le avisé.` },
                  { k: "next", label: `Lo que le llega a ${dep.name}` },
                  { k: "scene", owner: false },
                  { k: "time", text: "HOY" },
                  {
                    k: "bot",
                    text: `✅ *¡Abono recibido!* Tu hora quedó confirmada:\n\n${depService} · ${when}\n💰 El resto (${money(C1.amount - dep.amount)}) lo pagas el día de tu hora\n\n${w.tip} Un día antes te llega un recordatorio.`,
                  },
                  { k: "sys", text: '📅 En el calendario, la hora pasó de "⏳ Abono pendiente" a confirmada.' },
                ],
              },
              {
                label: "No llegó",
                then: [
                  { k: "bot", text: `Anotado. Le aviso a ${dep.name} que todavía no ves el pago. La hora sigue apartada hasta que se cumpla el plazo.` },
                  { k: "next", label: `Lo que le llega a ${dep.name}` },
                  { k: "scene", owner: false },
                  { k: "time", text: "HOY" },
                  {
                    k: "bot",
                    text: `Hola, ${dep.name} 👋 ${D} todavía no ve tu transferencia de ${money(dep.amount)}. ¿Me confirmas que salió a la cuenta de *${N}*? Si fue a otra, mándame el comprobante nuevo y se lo paso de nuevo 🙏`,
                  },
                ],
              },
            ],
          },
        ],
      })),
    },
  ];

  // 3 · Unpaid slot goes back by itself
  const freedHour = H[5] ?? H[H.length - 1];
  const freedWhen = `jueves a las ${hh(freedHour)}`;
  const freedService = `${w.icon} ${C2.name}`;
  const freed: Step[] = [
    { k: "time", text: "HOY · 3:00 P. M." },
    { k: "sys", text: `📝 ${w.names.freed} apartó una hora para ${C2.name} el ${freedWhen} y quedó de pagar el abono.` },
    {
      k: "bot",
      text: `¡Te la aparté! ⏳\n\n${freedService} · ${freedWhen}\n💳 Abono: *${money(deposit(C2.amount))}*\n\nTienes *2 horas* para pagarlo; después la hora se libera.`,
    },
    { k: "next", label: "Pasan 2 horas y no llega el abono" },
    { k: "time", text: "HOY · 5:00 P. M." },
    {
      k: "bot",
      text: `Hola, ${w.names.freed} 👋 Como no recibimos el abono a tiempo, liberamos la hora que tenías apartada para el ${freedWhen} en ${N}. Si todavía quieres venir, escríbenos por aquí y buscamos otro horario.`,
    },
    { k: "sys", text: `🔔 El ${freedWhen} volvió a la agenda y se le ofreció a quienes estaban en lista de espera.` },
    { k: "next", label: `Lo que le llega a ${w.names.waiting}, que estaba en lista de espera` },
    { k: "scene", owner: false },
    { k: "time", text: "HOY · 5:01 P. M." },
    {
      k: "bot",
      text: `Hola, ${w.names.waiting} 👋 Se liberó una hora en *${N}*: ${freedWhen} con ${pros[1]}. Estabas en nuestra lista de espera. Si la quieres, tócala abajo: se la damos a quien confirme primero.`,
    },
    {
      k: "choose",
      options: [
        {
          label: "La quiero",
          then: [
            { k: "bot", text: `¡Es tuya! ✅ ${cap(freedWhen)} con ${pros[1]}. Te llega un recordatorio el día antes ${w.emoji}` },
            booking(w.names.waiting, next(4, freedHour), C2, pros[1]),
            { k: "sys", text: "📅 La hora que se iba a perder se volvió a ocupar en 1 minuto." },
          ],
        },
        {
          label: "No, gracias",
          then: [
            { k: "bot", text: `¡Sin problema! Si se libera otra, te aviso ${w.emoji}` },
            { k: "sys", text: "🔔 La hora se le ofrece a la siguiente persona de la lista." },
          ],
        },
      ],
    },
  ];

  // 4 · Reminder with confirmation
  const rem = { name: w.names.reminder, hour: H[3], pro: pros[0], service: B };
  const others = [`Lunes ${hh(H[1])}`, `Martes ${hh(H[5] ?? H[2])}`, `Miércoles ${hh(H[3])}`];
  const twoBefore = rem.hour - 2;
  const twoBeforeText = `${twoBefore % 12 || 12}:00 ${twoBefore < 12 ? "A. M." : "P. M."}`;
  const reminder: Step[] = [
    booking(rem.name, saturday(rem.hour), rem.service, rem.pro),
    { k: "time", text: "VIERNES · 10:00 A. M." },
    {
      k: "bot",
      text: `Hola, ${rem.name} 👋 Te recordamos tu hora en *${N}* para mañana sábado a las ${hh(rem.hour)}. Te atiende ${rem.pro} y el servicio reservado es *${rem.service.name}*. ¿Nos confirmas que vienes? Si necesitas cambiarla, toca Reprogramar.`,
    },
    {
      k: "choose",
      options: [
        {
          label: "Confirmo",
          then: [
            { k: "bot", text: `¡Gracias, ${rem.name}! Te esperamos mañana ${w.emoji}` },
            { k: "next", label: "Sábado, 2 horas antes" },
            { k: "time", text: `SÁBADO · ${twoBeforeText}` },
            {
              k: "bot",
              text: `Hola, ${rem.name}, te esperamos hoy a las ${hh(rem.hour)} en *${N}*, donde te atiende ${rem.pro}.${where ? ` La dirección es ${where}.` : ""} Si no alcanzas a llegar, avísanos por aquí para darle la hora a otra persona.`,
            },
            { k: "sys", text: `✅ ${rem.name} confirmó. Si no hubiera confirmado, ${D} lo vería en su resumen de la mañana.` },
          ],
        },
        {
          label: "Reprogramar",
          then: [
            { k: "bot", text: `¡Sin problema! Estas horas tiene ${rem.pro}:` },
            {
              k: "choose",
              options: others.map((label) => {
                const [day, time] = label.toLowerCase().split(" ");
                return {
                  label,
                  then: [
                    { k: "bot", text: `¡Listo! ✅ Tu *${rem.service.name}* quedó para el *${label.toLowerCase()}* ${w.emoji}` },
                    booking(rem.name, next(WEEKDAY[day], Number(time.split(":")[0])), rem.service, rem.pro),
                    { k: "sys", text: `🔔 Se liberó el sábado ${hh(rem.hour)} con ${rem.pro} → se le ofrece a la lista de espera.` },
                  ],
                };
              }),
            },
          ],
        },
        {
          label: "Cancelar",
          then: [
            { k: "bot", text: "Gracias por avisar con tiempo 🙌 Tu hora quedó cancelada. Cuando quieras volver, me escribes por aquí." },
            { k: "state", state: { nombre: rem.name, reservas: [] } },
            { k: "sys", text: `🔔 Se liberó el sábado ${hh(rem.hour)} con ${rem.pro} → se le ofrece a la lista de espera.` },
          ],
        },
      ],
    },
  ];

  // 5 · The owner answers and the assistant steps aside
  const C = w.control;
  const controlHours: [string, number, number][] = [
    [`Sábado ${hh(H[H.length - 2])}`, 6, H[H.length - 2]],
    [`Lunes ${hh(H[1])}`, 1, H[1]],
  ];
  const control: Step[] = [
    { k: "time", text: "HOY · 4:20 P. M." },
    tap,
    { k: "send", text: C.hello(D) },
    { k: "next", label: `${D} ve el mensaje y contesta desde su celular` },
    { k: "sys", text: `📱 ${D} respondió desde la app de WhatsApp Business de su celular, como siempre.` },
    { k: "bot", by: D, text: C.owner1 },
    { k: "sys", text: `⏸️ El asistente vio que ${D} tomó la conversación y se quedó en silencio en este chat por 12 horas.` },
    { k: "send", text: C.ask(low(A.name)) },
    { k: "bot", by: D, text: C.owner2 },
    { k: "next", label: `Pasan 12 horas y ${D} no alcanzó a responder` },
    { k: "time", text: "MAÑANA · 9:00 A. M." },
    { k: "send", text: C.again },
    {
      k: "bot",
      text: `¡Hola, ${w.names.control}! 👋 Soy el asistente de *${N}*. Para ${C.forWho}, *${A.name}* (${money(A.amount)}) tengo libre el *sábado a las ${hh(H[H.length - 2])}* (se acaba de liberar) o el *lunes a las ${hh(H[1])}*. ¿Cuál le acomoda?`,
    },
    {
      k: "choose",
      options: controlHours.map(([label, day, hour]) => ({
        label,
        then: [
          { k: "bot", text: `¡Listo! ✅ Quedó agendada para el *${label.toLowerCase()}*.${where ? ` Te dejo la dirección por si viene sola: ${where}` : " Un día antes le llega un recordatorio."} ${w.emoji}` },
          booking(w.names.control, next(day, hour), A, pros[0]),
          { k: "sys", text: `📲 ${D} ve la reserva nueva en su calendario. Nadie quedó esperando respuesta.` },
        ],
      })),
    },
  ];

  // 6 · The morning summary
  const people = [w.names.reminder, w.names.deposit, nightFirst, w.names.waiting, w.names.control];
  const agenda = people
    .map((p, i) => `${hh(H[i] ?? H[0])} · ${demo.services[i % demo.services.length].name} · ${p} · ${pros[i % 2]}${i === 4 ? " ⏳ sin confirmar" : " ✅"}`)
    .join("\n");
  const average = demo.services.reduce((t, s) => t + s.amount, 0) / demo.services.length;
  const morning: Step[] = [
    { k: "scene", owner: true },
    { k: "time", text: "SÁBADO · 8:30 A. M." },
    {
      k: "bot",
      text: `Resumen del día en *${N}*: tienes *12 reservas* para hoy, *1 cancelación* en las últimas 24 horas y *${money(round(average * 12))}* de venta esperada. Tu primera hora del día es a las ${hh(H[0])} con ${pros[0]}. Toca Ver detalle para recibir la agenda completa.`,
    },
    {
      k: "choose",
      options: [
        {
          label: "Ver detalle",
          then: [
            { k: "bot", text: `📋 *Agenda de hoy · ${N}*\n\n${agenda}\n\n_…y 7 reservas más._` },
            { k: "sys", text: `☕ ${D} sabe cómo viene el día antes de abrir, sin revisar nada.` },
          ],
        },
      ],
    },
  ];

  const all: Moment[] = [
    {
      id: 0,
      tab: "Escríbele tú",
      tag: "Pruébalo tú",
      title: `Escríbele a ${N} como si fueras ${aClient}`,
      text: `Pregúntale lo que ${aClient} preguntaría: precios, horas, dónde están o si es un bot. Te responde el asistente con IA, con tus servicios y tus precios.`,
      behind: `El asistente conoce tus servicios, precios, horarios y equipo. Responde al instante, recomienda, agenda en el calendario de cada ${team.pro} y te pasa a ti los reclamos o lo que no sabe. No inventa: si no sabe algo, te lo pregunta.`,
      gains: ["Responde al instante, a cualquier hora", "Contesta con tus servicios y tus precios, sin inventar"],
      minutes: 5,
      open: true,
      tries: [`¿Cuánto sale ${low(A.name)}?`, "¿Tienen hora mañana?", "¿Dónde están?", "¿Eres un bot?"],
      holder,
      steps: [{ k: "time", text: "HOY · 10:47 P. M." }],
    },
    {
      id: 1,
      tab: "Reserva de noche",
      tag: "Mientras duermes",
      title: "Te escriben a las 11:40 de la noche",
      text: `Mientras duermes, ${theClient} queda con hora y tú no tocaste el celular.`,
      behind: `El asistente lee el calendario de cada ${team.pro}, ofrece solo horas libres de verdad y anota la reserva. Nunca da una hora ocupada: el sistema bloquea los choques. Después programa solo los recordatorios.`,
      gains: ["Agenda de noche sin que tú toques el celular", "Solo ofrece horas libres de verdad"],
      minutes: 8,
      holder,
      steps: night,
    },
    {
      id: 2,
      tab: "Abono",
      tag: "Cero horas perdidas",
      title: "Reserva con abono: lo apruebas con un toque",
      text: "La hora queda apartada y tú confirmas el pago desde tu WhatsApp.",
      behind: `El asistente aparta la hora, da los datos de pago y el plazo. Cuando ${theClient} avisa que pagó, a ti te llega un WhatsApp con dos botones: Recibido o No llegó. Tú revisas tu cuenta: el asistente nunca da un pago por recibido sin ti. Tú eliges el monto del abono y el plazo para pagarlo.`,
      gains: ["La hora queda apartada mientras pagan", "Tú confirmas el pago con un toque"],
      minutes: 10,
      holder,
      steps: depositSteps,
    },
    {
      id: 3,
      tab: "Hora liberada",
      tag: "Agenda siempre al día",
      title: "Si no paga el abono, la hora vuelve sola",
      text: "Nadie tiene que perseguir a nadie: la hora se libera y se le ofrece a otra persona.",
      behind: `Si el abono no llega en el plazo que tú eliges, la hora se libera sola y se le avisa. Si ${theClient} ya avisó que pagó, nunca se cancela sola: espera tu Recibido. La hora libre se le ofrece a quienes están en lista de espera, y la toma quien confirme primero.`,
      gains: ["La hora sin pagar se libera sola", "Se le ofrece a la lista de espera y se vuelve a ocupar"],
      minutes: 15,
      holder,
      steps: freed,
    },
    {
      id: 4,
      tab: "Recordatorio",
      tag: "Menos inasistencias",
      title: "Recordatorio con confirmación",
      text: "Un día antes confirma con un botón; 2 horas antes le llega la dirección.",
      behind: "24 horas antes llega un recordatorio con botones y, 2 horas antes, otro con la dirección. Si reprograma o cancela, el asistente mueve la hora y la libera para otra persona. Tú no escribes nada.",
      gains: ["Recordatorios solos: menos clientes que no llegan", "Si reprograman, la hora queda libre para otro"],
      minutes: 6,
      holder,
      steps: reminder,
    },
    {
      id: 5,
      tab: "Tú tienes el control",
      tag: "Tú tienes el control",
      title: "Tú contestas y el asistente se hace a un lado",
      text: "Sigues usando tu WhatsApp en tu celular. Cuando tú escribes, el asistente se calla.",
      behind: "Tu número sigue en la app de WhatsApp Business de tu celular, como siempre. Cuando tú respondes un chat, el asistente se pausa en esa conversación (12 horas, o lo que tú elijas) y después vuelve solo. También se pausa y te avisa si alguien pide hablar contigo o tiene un reclamo.",
      gains: ["Contestas tú cuando quieras", "Si no alcanzas, el asistente retoma y nadie queda esperando"],
      minutes: 5,
      holder,
      steps: control,
    },
    {
      id: 6,
      tab: "Resumen diario",
      tag: `Para ${D}`,
      title: "Tu resumen de cada mañana",
      text: "Tu día completo en un mensaje: reservas, cancelaciones y venta esperada.",
      behind: "Cada mañana te llega por WhatsApp el resumen del día: cuántas reservas tienes, las cancelaciones de las últimas 24 horas, la venta esperada y tu primera hora. Con un toque, la agenda completa. Las cifras son de ejemplo.",
      gains: ["Sabes cómo viene el día antes de abrir", "Reservas, cancelaciones y venta esperada en un mensaje"],
      minutes: 15,
      holder: `Ahora eres ${D}`,
      steps: morning,
    },
  ];
  const picked = new Set(demo.pains.flatMap((p) => momentsFor[p]));
  return all.filter((m) => m.id === 0 || picked.has(m.id));
}
