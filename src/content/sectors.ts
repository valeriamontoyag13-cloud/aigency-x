import type { AppLocale } from "@/i18n/routing";

/**
 * Sample businesses for the "Try it" demo, one per beauty sector. The same
 * data drives the phone UI and the AI assistant's instructions
 * (api/demo-chat), so prices and hours always match what the chat says.
 */

export const sectorKeys = ["unas", "cabello", "estetica", "barberia", "tatuajes"] as const;
export type SectorKey = (typeof sectorKeys)[number];

export function isSectorKey(value: unknown): value is SectorKey {
  return typeof value === "string" && (sectorKeys as readonly string[]).includes(value);
}

type Localized = Record<AppLocale, string>;

export type SectorBusiness = {
  /** Tab label. */
  label: Localized;
  name: string;
  initials: string;
  /** Who works there; the assistant books with them. */
  team: string[];
  /** "Service: price, duration" lines, in Spanish (the assistant translates when needed). */
  services: string[];
  hours: string;
  address: string;
  /** Deposit policy, or null when the business doesn't charge one. */
  deposit: string | null;
  /** Free slots the assistant can offer. */
  slots: string[];
  /** Extra facts the assistant may share. */
  notes: string[];
  greeting: Localized;
  /** Suggested messages the visitor can tap. */
  quickReplies: Record<AppLocale, string[]>;
};

export const sectors: Record<SectorKey, SectorBusiness> = {
  unas: {
    label: { es: "Uñas", en: "Nails" },
    name: "Malva Nails",
    initials: "MN",
    team: ["Carla", "Fernanda"],
    services: [
      "Manicure semipermanente: $18.000, 1 hora",
      "Manicure tradicional: $10.000, 40 minutos",
      "Uñas acrílicas (set completo): $28.000, 2 horas",
      "Pedicure spa: $20.000, 1 hora",
      "Retiro de semipermanente: $5.000, 20 minutos",
    ],
    hours: "Lunes a sábado de 10:00 a 19:00. Domingo cerrado.",
    address: "Av. Providencia 1234, local 5",
    deposit: "Para uñas acrílicas se pide un abono de $8.000 por transferencia. El resto no lleva abono.",
    slots: ["mañana 10:00", "mañana 12:30", "mañana 16:00", "sábado 11:00", "sábado 15:30"],
    notes: ["Tenemos más de 80 colores de semipermanente.", "Si llegas más de 15 minutos tarde, la hora se reprograma."],
    greeting: { es: "¡Hola! 💅 Soy el asistente de Malva Nails. ¿En qué te ayudo?", en: "Hi! 💅 I'm the Malva Nails assistant. How can I help?" },
    quickReplies: {
      es: ["¿Cuánto sale el semipermanente?", "¿Tienen hora mañana?", "¿Dónde están?", "¿Eres un bot?"],
      en: ["How much is a gel manicure?", "Any slot tomorrow?", "Where are you?", "Are you a bot?"],
    },
  },
  cabello: {
    label: { es: "Cabello", en: "Hair" },
    name: "Salón Aura",
    initials: "SA",
    team: ["Valentina", "Diego"],
    services: [
      "Corte de mujer: $15.000, 45 minutos",
      "Brushing: $12.000, 40 minutos",
      "Tintura completa: desde $35.000, 2 horas",
      "Balayage: desde $65.000, 3 a 4 horas",
      "Keratina: desde $45.000, 2 horas y media",
    ],
    hours: "Martes a sábado de 10:00 a 20:00.",
    address: "Calle Los Leones 456",
    deposit: "Para balayage y keratina se pide un abono de $15.000 para reservar.",
    slots: ["mañana 11:00", "mañana 15:00", "viernes 10:30", "sábado 12:00"],
    notes: ["El precio final del color depende del largo del pelo; se confirma en el salón."],
    greeting: { es: "¡Hola! ✨ Soy el asistente de Salón Aura. ¿Qué te gustaría hacerte?", en: "Hi! ✨ I'm the Salón Aura assistant. What would you like done?" },
    quickReplies: {
      es: ["¿Cuánto sale un balayage?", "Quiero hora para corte", "¿Necesito abono?", "¿Atienden el sábado?"],
      en: ["How much is balayage?", "I want a haircut slot", "Do I need a deposit?", "Are you open Saturday?"],
    },
  },
  estetica: {
    label: { es: "Estética", en: "Aesthetics" },
    name: "Bella Forma Estética",
    initials: "BF",
    team: ["Camila", "Javiera"],
    services: [
      "Masaje reductor: $25.000 la sesión (50 minutos), pack de 10 sesiones $200.000",
      "Limpieza facial profunda: $30.000, 1 hora",
      "Drenaje linfático: $22.000, 50 minutos",
      "Depilación láser (axilas): $15.000 la sesión",
      "Masaje relajante: $28.000, 1 hora",
    ],
    hours: "Lunes a viernes de 9:00 a 20:00, sábado de 10:00 a 14:00.",
    address: "Av. Apoquindo 3100, oficina 204",
    deposit: "Los packs se reservan con un abono de $30.000.",
    slots: ["hoy 18:00", "mañana 9:30", "mañana 17:00", "jueves 12:00"],
    notes: ["La primera evaluación es gratis.", "Los resultados de los tratamientos varían según cada persona; no prometas resultados."],
    greeting: { es: "¡Hola! 🌿 Soy el asistente de Bella Forma. ¿En qué tratamiento estás pensando?", en: "Hi! 🌿 I'm the Bella Forma assistant. Which treatment are you thinking about?" },
    quickReplies: {
      es: ["¿Cuánto sale el masaje reductor?", "¿Tienen packs?", "¿La evaluación tiene costo?", "Quiero agendar"],
      en: ["How much is a body-contouring massage?", "Do you have packages?", "Is the assessment free?", "I want to book"],
    },
  },
  barberia: {
    label: { es: "Barbería", en: "Barbershop" },
    name: "Barbería El Clásico",
    initials: "EC",
    team: ["Matías", "Diego", "Tomás"],
    services: [
      "Corte: $12.000, 30 minutos",
      "Fade: $13.000, 40 minutos",
      "Corte + barba: $18.000, 45 minutos",
      "Perfilado de barba: $8.000, 20 minutos",
    ],
    hours: "Lunes a sábado de 10:00 a 21:00.",
    address: "Av. Italia 890",
    deposit: null,
    slots: ["hoy 17:00", "hoy 18:30", "hoy 19:15", "mañana 10:00", "mañana 12:00"],
    notes: ["Se puede pedir barbero de preferencia."],
    greeting: { es: "¡Hola! 💈 Soy el asistente de Barbería El Clásico. ¿Te agendo una hora?", en: "Hi! 💈 I'm the El Clásico assistant. Want me to book you in?" },
    quickReplies: {
      es: ["¿Cuánto sale corte con barba?", "¿Tienen hora hoy?", "Quiero con Matías", "¿Dónde están?"],
      en: ["How much is cut + beard?", "Any slot today?", "I want Matías", "Where are you?"],
    },
  },
  tatuajes: {
    label: { es: "Tatuajes", en: "Tattoos" },
    name: "Tinta Norte Tattoo",
    initials: "TN",
    team: ["Nico", "Sofía"],
    services: [
      "Tatuaje pequeño (hasta 5 cm): desde $40.000",
      "Tatuaje mediano: desde $80.000, se cotiza según diseño",
      "Sesión de 3 horas para piezas grandes: $150.000",
      "Retoque dentro de los 2 meses: gratis",
    ],
    hours: "Martes a sábado de 12:00 a 20:00, solo con cita.",
    address: "Calle Bandera 345, piso 2",
    deposit: "Toda cita se reserva con un abono de $20.000, que se descuenta del total.",
    slots: ["jueves 13:00", "viernes 16:00", "sábado 12:00"],
    notes: [
      "Para cotizar piden una foto o referencia del diseño, el tamaño y la zona del cuerpo.",
      "Solo se tatúa a mayores de 18 años.",
    ],
    greeting: { es: "¡Hola! 🖋️ Soy el asistente de Tinta Norte. ¿Qué te quieres tatuar?", en: "Hi! 🖋️ I'm the Tinta Norte assistant. What would you like tattooed?" },
    quickReplies: {
      es: ["Quiero cotizar un tatuaje", "¿Cuánto es el abono?", "¿Tienen hora esta semana?", "¿Hacen retoques?"],
      en: ["I want a tattoo quote", "How much is the deposit?", "Any slot this week?", "Do you do touch-ups?"],
    },
  },
};
