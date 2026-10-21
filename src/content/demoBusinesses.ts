import type { AppLocale } from "@/i18n/routing";

/**
 * Sample businesses for the personalized demo. The visitor picks the kind of
 * business they run and what takes most of their time; the demo then plays a
 * WhatsApp conversation built from these details (see lib/demoFlow.ts) and
 * the AI assistant (api/demo-chat) answers with the same facts.
 */

// Only businesses that live on appointments and reminders.
export const businessKeys = ["salon", "barberia", "unas", "pestanas", "clinica", "veterinaria", "otro"] as const;
export type BusinessKey = (typeof businessKeys)[number];

export const painKeys = ["responder", "agendar", "reprogramar", "cotizar"] as const;
export type PainKey = (typeof painKeys)[number];

/** What the demo shows for now: quotes come back once the assistant quotes reliably. */
export const offeredPains: PainKey[] = ["responder", "agendar", "reprogramar"];

export function isBusinessKey(value: unknown): value is BusinessKey {
  return typeof value === "string" && (businessKeys as readonly string[]).includes(value);
}

export function isPainKey(value: unknown): value is PainKey {
  return typeof value === "string" && (painKeys as readonly string[]).includes(value);
}

export type BusinessTexts = {
  /** Option label in the picker. */
  label: string;
  /** Sample client and the professional who serves them. */
  client: string;
  pro: string;
  /** Main service the client asks about. */
  service: string;
  price: string;
  duration: string;
  /** Other services and prices the assistant knows. */
  menu: string[];
  hours: string;
  address: string;
  /** Three free slots, e.g. "mañana 10:00". */
  slots: [string, string, string];
  /** Questions a client would send at night. */
  nightQuestion: string;
  /** Quote flow: what is asked, what the assistant needs, the client's details and the result. */
  quote: {
    request: string;
    question: string;
    answer: string;
    lines: [string, string][];
    total: string;
  };
  /** Suggestions for the visitor's own turn. */
  tryIt: string[];
};

export type DemoBusiness = {
  key: BusinessKey;
  emoji: string;
  name: string;
  initials: string;
  /** Form answer this business maps to (see form/formSteps.ts). */
  formType: "beauty" | "health" | "services" | "other";
  /** For the real assistant in n8n (it speaks Spanish): the kind of business, its team and the hours it books. */
  assistant: { kind: string; pro: string; team: [string, string]; owner: string; hours: number[] };
  texts: Record<AppLocale, BusinessTexts>;
};

export const demoBusinesses: Record<BusinessKey, DemoBusiness> = {
  salon: {
    key: "salon",
    emoji: "💇‍♀️",
    name: "Estudio Malva",
    initials: "EM",
    formType: "beauty",
    assistant: { kind: "salón de belleza", pro: "profesional", team: ["Camila", "Sofía"], owner: "Carla", hours: [10, 11, 12, 13, 15, 16, 17, 18] },
    texts: {
      es: {
        label: "Salón o estética",
        client: "Ana",
        pro: "Carla",
        service: "manicure semipermanente",
        price: "$18.000",
        duration: "1 hora",
        menu: ["Corte de pelo: $15.000", "Pedicure spa: $20.000", "Limpieza facial: $30.000"],
        hours: "lunes a sábado de 10:00 a 19:00",
        address: "Av. Providencia 1234",
        slots: ["mañana 10:00", "mañana 12:30", "jueves 16:00"],
        nightQuestion: "Hola! ¿Atienden el sábado? ¿Dónde están?",
        quote: {
          request: "Hola, quiero cotizar maquillaje y peinado para un matrimonio, somos 3",
          question: "¡Qué lindo! 💐 ¿Para qué fecha y a qué hora tendrían que estar listas?",
          answer: "Sábado 20, a las 15:00",
          lines: [["Maquillaje social x3", "$75.000"], ["Peinado x3", "$60.000"], ["Descuento grupo", "-$10.000"]],
          total: "$125.000",
        },
        tryIt: ["¿Cuánto sale un corte?", "Quiero cambiar mi hora", "¿Eres un bot?"],
      },
      en: {
        label: "Salon or spa",
        client: "Ana",
        pro: "Carla",
        service: "gel manicure",
        price: "$25",
        duration: "1 hour",
        menu: ["Haircut: $30", "Spa pedicure: $35", "Facial: $50"],
        hours: "Monday to Saturday, 10:00 to 19:00",
        address: "1234 Main St",
        slots: ["tomorrow 10:00", "tomorrow 12:30", "Thursday 16:00"],
        nightQuestion: "Hi! Are you open on Saturday? Where are you?",
        quote: {
          request: "Hi, I'd like a quote for wedding makeup and hair, 3 of us",
          question: "Lovely! 💐 What date and what time do you need to be ready?",
          answer: "Saturday the 20th, at 15:00",
          lines: [["Makeup x3", "$150"], ["Hair styling x3", "$120"], ["Group discount", "-$20"]],
          total: "$250",
        },
        tryIt: ["How much is a haircut?", "I need to change my time", "Are you a bot?"],
      },
    },
  },
  barberia: {
    key: "barberia",
    emoji: "💈",
    name: "Barbería El Clásico",
    initials: "EC",
    formType: "beauty",
    assistant: { kind: "barbería", pro: "barbero", team: ["Matías", "Benja"], owner: "Nico", hours: [10, 11, 12, 13, 15, 16, 17, 18, 19, 20] },
    texts: {
      es: {
        label: "Barbería",
        client: "Juan",
        pro: "Matías",
        service: "corte + barba",
        price: "$18.000",
        duration: "45 minutos",
        menu: ["Corte: $12.000", "Fade: $13.000", "Perfilado de barba: $8.000"],
        hours: "lunes a sábado de 10:00 a 21:00",
        address: "Av. Italia 890",
        slots: ["hoy 18:30", "hoy 19:15", "mañana 11:00"],
        nightQuestion: "Buenas! ¿Atienden mañana temprano? ¿Cuánto sale el fade?",
        quote: {
          request: "Hola, quiero cotizar cortes para un evento de empresa, somos 12",
          question: "¡Bacán! 💈 ¿Sería en la barbería o vamos nosotros? ¿Qué día?",
          answer: "En nuestra oficina, el viernes en la tarde",
          lines: [["Cortes x12", "$144.000"], ["Traslado de 2 barberos", "$20.000"], ["Descuento grupo", "-$14.000"]],
          total: "$150.000",
        },
        tryIt: ["¿Tienen hora hoy?", "Quiero con Matías", "¿Cuánto sale el fade?"],
      },
      en: {
        label: "Barbershop",
        client: "John",
        pro: "Matías",
        service: "cut + beard",
        price: "$30",
        duration: "45 minutes",
        menu: ["Cut: $20", "Fade: $22", "Beard trim: $12"],
        hours: "Monday to Saturday, 10:00 to 21:00",
        address: "890 Italia Ave",
        slots: ["today 18:30", "today 19:15", "tomorrow 11:00"],
        nightQuestion: "Hey! Are you open early tomorrow? How much is a fade?",
        quote: {
          request: "Hi, I'd like a quote for haircuts at a company event, 12 people",
          question: "Nice! 💈 At the shop or should we come to you? Which day?",
          answer: "At our office, Friday afternoon",
          lines: [["Cuts x12", "$240"], ["2 barbers on site", "$40"], ["Group discount", "-$30"]],
          total: "$250",
        },
        tryIt: ["Any slot today?", "I want Matías", "How much is a fade?"],
      },
    },
  },
  unas: {
    key: "unas",
    emoji: "💅",
    name: "Estudio Lila",
    initials: "EL",
    formType: "beauty",
    assistant: { kind: "estudio de uñas", pro: "manicurista", team: ["Fran", "Belén"], owner: "Daniela", hours: [10, 11, 12, 13, 15, 16, 17, 18] },
    texts: {
      es: {
        label: "Uñas",
        client: "Fernanda",
        pro: "Belén",
        service: "uñas acrílicas",
        price: "$25.000",
        duration: "1 hora y media",
        menu: ["Manicure semipermanente: $15.000", "Pedicure semipermanente: $18.000", "Polygel: $28.000"],
        hours: "lunes a sábado de 10:00 a 19:00",
        address: "Av. Providencia 2150",
        slots: ["mañana 11:00", "mañana 16:00", "viernes 12:00"],
        nightQuestion: "Hola! ¿Tienen hora mañana para acrílicas? ¿Cuánto sale?",
        quote: {
          request: "Hola, quiero cotizar manos y pies para mí y mi hermana",
          question: "¡Qué lindo! 💅 ¿Para qué día lo necesitan?",
          answer: "Para el sábado en la mañana",
          lines: [["Manicure semipermanente x2", "$30.000"], ["Pedicure semipermanente x2", "$36.000"], ["Descuento dúo", "-$6.000"]],
          total: "$60.000",
        },
        tryIt: ["¿Tienen hora mañana?", "¿Cuánto sale el polygel?", "Quiero cambiar mi hora"],
      },
      en: {
        label: "Nails",
        client: "Fernanda",
        pro: "Belén",
        service: "acrylic nails",
        price: "$50",
        duration: "1.5 hours",
        menu: ["Gel manicure: $30", "Gel pedicure: $35", "Polygel: $55"],
        hours: "Monday to Saturday, 10:00 to 19:00",
        address: "2150 Main St",
        slots: ["tomorrow 11:00", "tomorrow 16:00", "Friday 12:00"],
        nightQuestion: "Hi! Any slot tomorrow for acrylics? How much is it?",
        quote: {
          request: "Hi, I'd like a quote for hands and feet for me and my sister",
          question: "Lovely! 💅 What day do you need it?",
          answer: "Saturday morning",
          lines: [["Gel manicure x2", "$60"], ["Gel pedicure x2", "$70"], ["Duo discount", "-$10"]],
          total: "$120",
        },
        tryIt: ["Any slot tomorrow?", "How much is polygel?", "I need to change my time"],
      },
    },
  },
  pestanas: {
    key: "pestanas",
    emoji: "👁️",
    name: "Brisa Lash Studio",
    initials: "BL",
    formType: "beauty",
    assistant: { kind: "estudio de pestañas y cejas", pro: "lashista", team: ["Javi", "Antonia"], owner: "Catalina", hours: [10, 11, 12, 13, 15, 16, 17, 18] },
    texts: {
      es: {
        label: "Pestañas y cejas",
        client: "Javiera",
        pro: "Antonia",
        service: "extensiones de pestañas clásicas",
        price: "$25.000",
        duration: "2 horas",
        menu: ["Lifting de pestañas: $20.000", "Volumen ruso: $35.000", "Laminado de cejas: $18.000"],
        hours: "lunes a sábado de 10:00 a 19:00",
        address: "Av. Las Condes 9020",
        slots: ["mañana 10:00", "mañana 15:00", "sábado 11:00"],
        nightQuestion: "Hola! ¿Cuánto sale el lifting? ¿Tienen hora esta semana?",
        quote: {
          request: "Hola, quiero cotizar pestañas y cejas para mi matrimonio",
          question: "¡Felicidades! ✨ ¿Para qué fecha es el matrimonio?",
          answer: "Para el sábado 20",
          lines: [["Volumen ruso", "$35.000"], ["Laminado de cejas", "$18.000"], ["Descuento novia", "-$5.000"]],
          total: "$48.000",
        },
        tryIt: ["¿Cuánto sale el lifting?", "¿Tienen hora el sábado?", "Necesito cambiar mi hora"],
      },
      en: {
        label: "Lashes and brows",
        client: "Javiera",
        pro: "Antonia",
        service: "classic lash extensions",
        price: "$60",
        duration: "2 hours",
        menu: ["Lash lift: $50", "Russian volume: $85", "Brow lamination: $45"],
        hours: "Monday to Saturday, 10:00 to 19:00",
        address: "9020 Las Condes Ave",
        slots: ["tomorrow 10:00", "tomorrow 15:00", "Saturday 11:00"],
        nightQuestion: "Hi! How much is a lash lift? Any slot this week?",
        quote: {
          request: "Hi, I'd like a quote for lashes and brows for my wedding",
          question: "Congratulations! ✨ What's the wedding date?",
          answer: "Saturday the 20th",
          lines: [["Russian volume", "$85"], ["Brow lamination", "$45"], ["Bridal discount", "-$10"]],
          total: "$120",
        },
        tryIt: ["How much is a lash lift?", "Any slot on Saturday?", "I need to change my time"],
      },
    },
  },
  clinica: {
    key: "clinica",
    emoji: "🩺",
    name: "Centro Médico Vida",
    initials: "CV",
    formType: "health",
    assistant: { kind: "consulta médica", pro: "profesional", team: ["Dr. Rojas", "Dra. Soto"], owner: "Paula", hours: [8, 9, 10, 11, 12, 15, 16, 17, 18, 19] },
    texts: {
      es: {
        label: "Médico, dentista o consulta",
        client: "María",
        pro: "la Dra. Rojas",
        service: "consulta de medicina general",
        price: "$25.000",
        duration: "30 minutos",
        menu: ["Kinesiología: $22.000 la sesión", "Nutricionista: $28.000", "Control pediátrico: $25.000"],
        hours: "lunes a viernes de 8:00 a 20:00, sábado de 9:00 a 13:00",
        address: "Av. Apoquindo 3100, piso 4",
        slots: ["mañana 9:30", "mañana 15:00", "viernes 11:00"],
        nightQuestion: "Hola, ¿atienden con seguro? ¿Tienen hora para kinesiología?",
        quote: {
          request: "Hola, quiero cotizar un plan de 10 sesiones de kinesiología",
          question: "¡Claro! ¿Es por una lesión o una indicación médica? ¿Tienes orden del doctor?",
          answer: "Sí, tengo orden, es por la rodilla",
          lines: [["Evaluación inicial", "$22.000"], ["10 sesiones de kinesiología", "$200.000"], ["Descuento por plan", "-$30.000"]],
          total: "$192.000",
        },
        tryIt: ["¿Tienen hora mañana?", "Necesito cancelar mi hora", "¿Qué necesito llevar?"],
      },
      en: {
        label: "Doctor, dentist or practice",
        client: "Maria",
        pro: "Dr. Rojas",
        service: "general check-up",
        price: "$60",
        duration: "30 minutes",
        menu: ["Physiotherapy: $50 per session", "Nutritionist: $70", "Pediatric check-up: $60"],
        hours: "Monday to Friday 8:00 to 20:00, Saturday 9:00 to 13:00",
        address: "3100 Apoquindo Ave, 4th floor",
        slots: ["tomorrow 9:30", "tomorrow 15:00", "Friday 11:00"],
        nightQuestion: "Hi, do you take insurance? Any slot for physiotherapy?",
        quote: {
          request: "Hi, I'd like a quote for a 10-session physiotherapy plan",
          question: "Of course! Is it for an injury or a doctor's referral? Do you have one?",
          answer: "Yes, I have a referral, it's for my knee",
          lines: [["Initial assessment", "$50"], ["10 physiotherapy sessions", "$450"], ["Plan discount", "-$70"]],
          total: "$430",
        },
        tryIt: ["Any slot tomorrow?", "I need to cancel", "What should I bring?"],
      },
    },
  },
  veterinaria: {
    key: "veterinaria",
    emoji: "🐾",
    name: "Veterinaria Patitas",
    initials: "VP",
    formType: "health",
    assistant: { kind: "clínica veterinaria", pro: "veterinario", team: ["Dra. Fuentes", "Dr. Vidal"], owner: "Marcela", hours: [9, 10, 11, 12, 15, 16, 17, 18] },
    texts: {
      es: {
        label: "Veterinaria",
        client: "Sofía",
        pro: "la Dra. Fuentes",
        service: "consulta veterinaria",
        price: "$25.000",
        duration: "30 minutos",
        menu: ["Vacuna antirrábica: $15.000", "Control de cachorro: $20.000", "Baño y peluquería: $18.000"],
        hours: "lunes a sábado de 9:00 a 19:00",
        address: "Av. Grecia 1450",
        slots: ["mañana 9:00", "mañana 17:00", "viernes 10:00"],
        nightQuestion: "Hola, mi perrito está con vómitos, ¿tienen hora mañana temprano?",
        quote: {
          request: "Hola, quiero cotizar vacunas y control para mis dos gatos",
          question: "¡Claro! 🐾 ¿Qué edad tienen y qué vacunas les faltan?",
          answer: "Tienen 1 año, les toca la anual",
          lines: [["Control x2", "$40.000"], ["Vacuna anual x2", "$30.000"], ["Descuento 2 mascotas", "-$5.000"]],
          total: "$65.000",
        },
        tryIt: ["¿Tienen hora mañana?", "¿Cuánto sale la vacuna?", "Necesito cambiar la hora de mi perro"],
      },
      en: {
        label: "Vet clinic",
        client: "Sofía",
        pro: "Dr. Fuentes",
        service: "vet check-up",
        price: "$60",
        duration: "30 minutes",
        menu: ["Rabies vaccine: $30", "Puppy check-up: $45", "Bath and grooming: $40"],
        hours: "Monday to Saturday, 9:00 to 19:00",
        address: "1450 Grecia Ave",
        slots: ["tomorrow 9:00", "tomorrow 17:00", "Friday 10:00"],
        nightQuestion: "Hi, my dog has been throwing up, any slot early tomorrow?",
        quote: {
          request: "Hi, I'd like a quote for vaccines and a check-up for my two cats",
          question: "Sure! 🐾 How old are they and which vaccines are due?",
          answer: "They're 1, the yearly one is due",
          lines: [["Check-up x2", "$90"], ["Yearly vaccine x2", "$60"], ["Two-pet discount", "-$10"]],
          total: "$140",
        },
        tryIt: ["Any slot tomorrow?", "How much is the vaccine?", "I need to move my dog's appointment"],
      },
    },
  },
  otro: {
    key: "otro",
    emoji: "✨",
    name: "Tu negocio",
    initials: "TN",
    formType: "other",
    assistant: { kind: "negocio de citas", pro: "profesional", team: ["Pablo", "Camila"], owner: "Andrea", hours: [9, 10, 11, 12, 15, 16, 17, 18] },
    texts: {
      es: {
        label: "Otro negocio con citas",
        client: "Laura",
        pro: "nuestro equipo",
        service: "primera atención",
        price: "$20.000",
        duration: "45 minutos",
        menu: ["Servicio estándar: $30.000", "Servicio premium: $50.000"],
        hours: "lunes a sábado de 9:00 a 19:00",
        address: "Av. Central 100",
        slots: ["viernes 10:00", "sábado 12:00", "lunes 16:00"],
        nightQuestion: "Hola, ¿hasta qué hora atienden? ¿Dónde están?",
        quote: {
          request: "Hola, quiero cotizar su servicio para mi empresa",
          question: "¡Claro! ¿Para cuántas personas sería y para qué fecha?",
          answer: "Para 10 personas, la próxima semana",
          lines: [["Servicio estándar x10", "$300.000"], ["Coordinación", "$20.000"], ["Descuento empresa", "-$30.000"]],
          total: "$290.000",
        },
        tryIt: ["¿Cuánto cuesta?", "Quiero agendar", "Necesito cambiar mi hora"],
      },
      en: {
        label: "Other business with appointments",
        client: "Laura",
        pro: "our team",
        service: "first visit",
        price: "$40",
        duration: "45 minutes",
        menu: ["Standard service: $60", "Premium service: $100"],
        hours: "Monday to Saturday, 9:00 to 19:00",
        address: "100 Central Ave",
        slots: ["Friday 10:00", "Saturday 12:00", "Monday 16:00"],
        nightQuestion: "Hi, what time do you close? Where are you?",
        quote: {
          request: "Hi, I'd like a quote for your service for my company",
          question: "Of course! How many people would it be for, and what date?",
          answer: "For 10 people, next week",
          lines: [["Standard service x10", "$600"], ["Coordination", "$40"], ["Company discount", "-$60"]],
          total: "$580",
        },
        tryIt: ["How much is it?", "I want to book", "I need to change my time"],
      },
    },
  },
};
