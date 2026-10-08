import type { AppLocale } from "@/i18n/routing";

/** Copy for the private onboarding form each client fills in from their own link. */
export type AltaCopy = {
  metaTitle: string;
  title: string;
  intro: string;
  required: string;
  optional: string;
  sections: { business: string; hours: string; services: string; team: string; rules: string; voice: string };
  business: {
    name: string; nameHint: string; owner: string; ownerPhone: string; ownerPhoneHint: string; country: string;
    address: string; maps: string; mapsHint: string; reviews: string; reviewsHint: string; payments: string; paymentsOther: string; extra: string; extraHint: string;
  };
  zones: Record<string, string>;
  payments: Record<string, string>;
  days: Record<string, string>;
  hours: { open: string; from: string; to: string; addBreak: string; breakFrom: string; breakTo: string; closed: string };
  services: { name: string; duration: string; price: string; description: string; add: string; remove: string; minutes: string };
  team: { intro: string; name: string; email: string; emailHint: string; allServices: string; someServices: string; daysOff: string; add: string; remove: string };
  rules: { changes: string; changesHint: string; hoursBefore: string; extra: string; birthday: string; birthdayHint: string };
  voice: { tone: string; tones: Record<string, { title: string; text: string }>; emojis: string };
  submit: string;
  sending: string;
  done: { title: string; text: string };
  errors: { title: string; fields: Record<string, string>; generic: string };
  invalidLink: string;
};

const DAYS_ES = { lun: "Lunes", mar: "Martes", mie: "Miércoles", jue: "Jueves", vie: "Viernes", sab: "Sábado", dom: "Domingo" };
const DAYS_EN = { lun: "Monday", mar: "Tuesday", mie: "Wednesday", jue: "Thursday", vie: "Friday", sab: "Saturday", dom: "Sunday" };
const ZONES = {
  cl: "Chile", co: "Colombia", mx: "México", pe: "Perú", ar: "Argentina",
  "au-bne": "Australia · Brisbane (QLD)", "au-syd": "Australia · Sydney / Melbourne", "au-per": "Australia · Perth",
};

export const altaContent: Record<AppLocale, AltaCopy> = {
  es: {
    metaTitle: "Datos de tu negocio | AIgency.X",
    title: "Cuéntanos cómo funciona tu negocio",
    intro: "Con esto tu asistente sabe qué ofreces, cuánto cobras, quién atiende y cuándo. Te toma unos 10 minutos y puedes volver a este link para corregir lo que quieras.",
    required: "obligatorio",
    optional: "opcional",
    sections: { business: "Tu negocio", hours: "Horario de atención", services: "Servicios", team: "Equipo", rules: "Reglas", voice: "Cómo habla tu asistente" },
    business: {
      name: "Nombre del negocio", nameHint: "Como quieres que aparezca en los mensajes.", owner: "Tu nombre", ownerPhone: "Tu WhatsApp personal",
      ownerPhoneHint: "Aquí te avisamos cuando un cliente necesite hablar con una persona y te llega el resumen del día.", country: "País",
      address: "Dirección", maps: "Link de Google Maps", mapsHint: "En Google Maps: tu negocio → Compartir → Copiar link.",
      reviews: "Link para dejar reseñas en Google", reviewsHint: "En tu Perfil de Empresa de Google: Pedir reseñas → copiar link.",
      payments: "Medios de pago", paymentsOther: "Otro medio de pago", extra: "Algo más que deban saber tus clientes",
      extraHint: "Estacionamiento, cómo llegar, si atienden niños, mascotas, etc.",
    },
    zones: ZONES,
    payments: { efectivo: "Efectivo", debito: "Débito", credito: "Crédito", transferencia: "Transferencia" },
    days: DAYS_ES,
    hours: { open: "Abierto", from: "Desde", to: "Hasta", addBreak: "Tiene pausa (colación)", breakFrom: "Pausa desde", breakTo: "hasta", closed: "Cerrado" },
    services: { name: "Servicio", duration: "Duración", price: "Precio", description: "Detalle (opcional)", add: "Agregar servicio", remove: "Quitar", minutes: "min" },
    team: {
      intro: "Cada persona que atiende tiene su propia agenda. Si eres solo tú, agrégate a ti.",
      name: "Nombre", email: "Gmail", emailHint: "Para crearle o compartirle su calendario de Google.",
      allServices: "Hace todos los servicios", someServices: "Solo estos servicios:", daysOff: "Días que no trabaja", add: "Agregar persona", remove: "Quitar",
    },
    rules: {
      changes: "¿Hasta cuántas horas antes se puede cambiar o cancelar sin costo?", changesHint: "Dentro de ese plazo, el asistente no cambia la hora: le pasa el caso a una persona.",
      hoursBefore: "horas antes", extra: "Algo más sobre cancelaciones (opcional)", birthday: "Regalo de cumpleaños (opcional)",
      birthdayHint: "Ejemplo: 15% de descuento. Si lo dejas vacío, no se mandan saludos de cumpleaños.",
    },
    voice: {
      tone: "Tono",
      tones: {
        cercano: { title: "Cercano", text: "Trata de tú, amable y natural." },
        profesional: { title: "Profesional", text: "Trata de usted, cordial y claro." },
        relajado: { title: "Relajado", text: "Con buena onda y expresiones informales suaves." },
      },
      emojis: "Puede usar emojis",
    },
    submit: "Enviar datos",
    sending: "Guardando…",
    done: { title: "¡Listo, recibimos tus datos!", text: "Los revisamos y te escribimos con el siguiente paso. Si quieres cambiar algo, vuelve a este mismo link." },
    errors: {
      title: "Revisa estos datos:",
      fields: {
        nombre: "El nombre del negocio", telefono_dueno: "Tu WhatsApp (con código de país)", direccion: "La dirección", medios_pago: "Al menos un medio de pago",
        horario: "El horario (al menos un día abierto)", servicios: "Al menos un servicio con duración y precio", equipo: "Al menos una persona en el equipo", zona: "El país",
      },
      generic: "No pudimos guardar tus datos. Inténtalo de nuevo en unos minutos o escríbenos.",
    },
    invalidLink: "Este link no es válido. Pídele a AIgency.X tu link para cargar los datos de tu negocio.",
  },
  en: {
    metaTitle: "Your business details | AIgency.X",
    title: "Tell us how your business works",
    intro: "This tells your assistant what you offer, what you charge, who serves clients and when. It takes about 10 minutes, and you can come back to this link to change anything.",
    required: "required",
    optional: "optional",
    sections: { business: "Your business", hours: "Opening hours", services: "Services", team: "Team", rules: "Rules", voice: "How your assistant talks" },
    business: {
      name: "Business name", nameHint: "As it should appear in messages.", owner: "Your name", ownerPhone: "Your personal WhatsApp",
      ownerPhoneHint: "We'll alert you here when a client needs a person, and send you the daily summary.", country: "Country",
      address: "Address", maps: "Google Maps link", mapsHint: "In Google Maps: your business → Share → Copy link.",
      reviews: "Google review link", reviewsHint: "In your Google Business Profile: Ask for reviews → copy link.",
      payments: "Payment methods", paymentsOther: "Other payment method", extra: "Anything else your clients should know",
      extraHint: "Parking, how to get there, kids, pets, etc.",
    },
    zones: ZONES,
    payments: { efectivo: "Cash", debito: "Debit card", credito: "Credit card", transferencia: "Bank transfer" },
    days: DAYS_EN,
    hours: { open: "Open", from: "From", to: "To", addBreak: "Has a break", breakFrom: "Break from", breakTo: "to", closed: "Closed" },
    services: { name: "Service", duration: "Duration", price: "Price", description: "Details (optional)", add: "Add service", remove: "Remove", minutes: "min" },
    team: {
      intro: "Each person who serves clients has their own calendar. If it's just you, add yourself.",
      name: "Name", email: "Gmail", emailHint: "To create or share their Google Calendar.",
      allServices: "Does all services", someServices: "Only these services:", daysOff: "Days off", add: "Add person", remove: "Remove",
    },
    rules: {
      changes: "Up to how many hours before can clients change or cancel for free?", changesHint: "Within that window the assistant won't move the booking: it hands the case to a person.",
      hoursBefore: "hours before", extra: "Anything else about cancellations (optional)", birthday: "Birthday gift (optional)",
      birthdayHint: "For example: 15% off. Leave it empty to skip birthday messages.",
    },
    voice: {
      tone: "Tone",
      tones: {
        cercano: { title: "Friendly", text: "Warm and natural." },
        profesional: { title: "Professional", text: "Polite and clear." },
        relajado: { title: "Relaxed", text: "Fun, with light casual expressions." },
      },
      emojis: "Can use emojis",
    },
    submit: "Send details",
    sending: "Saving…",
    done: { title: "Done, we got your details!", text: "We'll review them and message you with the next step. To change anything, come back to this same link." },
    errors: {
      title: "Please check:",
      fields: {
        nombre: "The business name", telefono_dueno: "Your WhatsApp (with country code)", direccion: "The address", medios_pago: "At least one payment method",
        horario: "Opening hours (at least one open day)", servicios: "At least one service with duration and price", equipo: "At least one team member", zona: "The country",
      },
      generic: "We couldn't save your details. Please try again in a few minutes or contact us.",
    },
    invalidLink: "This link isn't valid. Ask AIgency.X for your business details link.",
  },
};
