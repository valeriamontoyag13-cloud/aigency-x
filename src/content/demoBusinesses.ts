import type { AppLocale } from "@/i18n/routing";

/**
 * Sample businesses for the personalized demo. The visitor picks the kind of
 * business they run and what takes most of their time; the demo then plays a
 * WhatsApp conversation built from these details (see lib/demoFlow.ts) and
 * the AI assistant (api/demo-chat) answers with the same facts.
 */

export const businessKeys = ["salon", "barberia", "clinica", "taller", "tecnico", "entrenamiento", "tatuajes", "otro"] as const;
export type BusinessKey = (typeof businessKeys)[number];

export const painKeys = ["responder", "agendar", "reprogramar", "cotizar"] as const;
export type PainKey = (typeof painKeys)[number];

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
  texts: Record<AppLocale, BusinessTexts>;
};

export const demoBusinesses: Record<BusinessKey, DemoBusiness> = {
  salon: {
    key: "salon",
    emoji: "💅",
    name: "Estudio Malva",
    initials: "EM",
    formType: "beauty",
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
  clinica: {
    key: "clinica",
    emoji: "🩺",
    name: "Centro Médico Vida",
    initials: "CV",
    formType: "health",
    texts: {
      es: {
        label: "Clínica o consultorio",
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
        label: "Clinic or practice",
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
  taller: {
    key: "taller",
    emoji: "🔧",
    name: "Taller Rueda Libre",
    initials: "RL",
    formType: "services",
    texts: {
      es: {
        label: "Taller mecánico",
        client: "Pedro",
        pro: "Luis",
        service: "mantención de 10.000 km",
        price: "$85.000",
        duration: "2 horas",
        menu: ["Cambio de aceite: $45.000", "Revisión de frenos: $20.000", "Alineación y balanceo: $30.000"],
        hours: "lunes a viernes de 8:30 a 18:30, sábado de 9:00 a 14:00",
        address: "Calle Los Talleres 456",
        slots: ["mañana 9:00", "mañana 14:00", "sábado 10:00"],
        nightQuestion: "Hola, ¿hacen mantención el sábado? ¿Cuánto se demoran?",
        quote: {
          request: "Hola, quiero cotizar cambio de pastillas de freno",
          question: "¡Claro! 🔧 ¿Qué auto es (marca, modelo y año)? ¿Delanteras o traseras?",
          answer: "Toyota Yaris 2019, las delanteras",
          lines: [["Pastillas delanteras (originales)", "$48.000"], ["Mano de obra", "$25.000"], ["Revisión de discos", "Gratis"]],
          total: "$73.000",
        },
        tryIt: ["¿Cuánto sale el cambio de aceite?", "Quiero llevar mi auto mañana", "¿Está listo mi auto?"],
      },
      en: {
        label: "Auto repair shop",
        client: "Peter",
        pro: "Luis",
        service: "10,000 km service",
        price: "$160",
        duration: "2 hours",
        menu: ["Oil change: $80", "Brake check: $35", "Alignment and balancing: $55"],
        hours: "Monday to Friday 8:30 to 18:30, Saturday 9:00 to 14:00",
        address: "456 Los Talleres St",
        slots: ["tomorrow 9:00", "tomorrow 14:00", "Saturday 10:00"],
        nightQuestion: "Hi, do you do services on Saturday? How long does it take?",
        quote: {
          request: "Hi, I'd like a quote for new brake pads",
          question: "Sure! 🔧 Which car is it (make, model and year)? Front or rear?",
          answer: "Toyota Yaris 2019, the front ones",
          lines: [["Front pads (original)", "$90"], ["Labor", "$45"], ["Disc check", "Free"]],
          total: "$135",
        },
        tryIt: ["How much is an oil change?", "Can I bring my car tomorrow?", "Is my car ready?"],
      },
    },
  },
  tecnico: {
    key: "tecnico",
    emoji: "🛠️",
    name: "ClimaSur Servicio Técnico",
    initials: "CS",
    formType: "services",
    texts: {
      es: {
        label: "Servicio técnico o instalaciones",
        client: "Carolina",
        pro: "el técnico Andrés",
        service: "mantención de aire acondicionado",
        price: "$35.000",
        duration: "1 hora",
        menu: ["Instalación de aire 12.000 BTU: $120.000", "Visita de diagnóstico: $20.000", "Carga de gas: $45.000"],
        hours: "lunes a sábado de 9:00 a 19:00",
        address: "Atendemos a domicilio en toda la ciudad",
        slots: ["mañana 10:00", "mañana 16:00", "viernes 9:00"],
        nightQuestion: "Hola, mi aire bota agua, ¿pueden venir esta semana?",
        quote: {
          request: "Hola, quiero cotizar la instalación de 2 aires acondicionados",
          question: "¡Perfecto! ❄️ ¿De cuántos BTU son y en qué piso es la instalación?",
          answer: "12.000 BTU, en un segundo piso",
          lines: [["Instalación x2 (12.000 BTU)", "$240.000"], ["Kit de cañería extra", "$30.000"], ["Descuento por 2 equipos", "-$20.000"]],
          total: "$250.000",
        },
        tryIt: ["¿Cuánto sale la mantención?", "¿Pueden venir mañana?", "Quiero cotizar una instalación"],
      },
      en: {
        label: "Repairs or installations",
        client: "Caroline",
        pro: "Andrés, our technician",
        service: "air conditioning service",
        price: "$70",
        duration: "1 hour",
        menu: ["12,000 BTU AC installation: $250", "Diagnostic visit: $40", "Gas refill: $90"],
        hours: "Monday to Saturday, 9:00 to 19:00",
        address: "We come to your home anywhere in the city",
        slots: ["tomorrow 10:00", "tomorrow 16:00", "Friday 9:00"],
        nightQuestion: "Hi, my AC is leaking water, can you come this week?",
        quote: {
          request: "Hi, I'd like a quote to install 2 air conditioners",
          question: "Great! ❄️ How many BTU are they and which floor is it on?",
          answer: "12,000 BTU, second floor",
          lines: [["Installation x2 (12,000 BTU)", "$500"], ["Extra piping kit", "$60"], ["2-unit discount", "-$40"]],
          total: "$520",
        },
        tryIt: ["How much is a service?", "Can you come tomorrow?", "I want an installation quote"],
      },
    },
  },
  entrenamiento: {
    key: "entrenamiento",
    emoji: "🏋️",
    name: "Studio Fuerza",
    initials: "SF",
    formType: "services",
    texts: {
      es: {
        label: "Gimnasio, yoga o entrenador",
        client: "Camila",
        pro: "el coach Diego",
        service: "clase de prueba de entrenamiento funcional",
        price: "gratis",
        duration: "50 minutos",
        menu: ["Plan mensual 3 veces por semana: $45.000", "Clase suelta: $8.000", "Entrenamiento personal: $20.000 la sesión"],
        hours: "lunes a viernes de 7:00 a 21:00, sábado de 9:00 a 13:00",
        address: "Calle Deportes 220",
        slots: ["mañana 7:00", "mañana 19:00", "sábado 10:00"],
        nightQuestion: "Hola, ¿tienen clases a las 7 de la mañana? ¿Cuánto es el plan?",
        quote: {
          request: "Hola, quiero cotizar entrenamiento personal para mí y mi pareja",
          question: "¡Buenísimo! 💪 ¿Cuántas veces por semana y en qué horario les acomoda?",
          answer: "2 veces por semana, en la tarde",
          lines: [["8 sesiones en pareja al mes", "$240.000"], ["Evaluación física x2", "Gratis"], ["Descuento pareja", "-$40.000"]],
          total: "$200.000 al mes",
        },
        tryIt: ["¿Cuánto es el plan mensual?", "Quiero una clase de prueba", "No puedo ir hoy"],
      },
      en: {
        label: "Gym, yoga or trainer",
        client: "Camila",
        pro: "coach Diego",
        service: "free functional training trial class",
        price: "free",
        duration: "50 minutes",
        menu: ["Monthly plan, 3 times a week: $60", "Drop-in class: $12", "Personal training: $35 per session"],
        hours: "Monday to Friday 7:00 to 21:00, Saturday 9:00 to 13:00",
        address: "220 Deportes St",
        slots: ["tomorrow 7:00", "tomorrow 19:00", "Saturday 10:00"],
        nightQuestion: "Hi, do you have 7 a.m. classes? How much is the plan?",
        quote: {
          request: "Hi, I'd like a quote for personal training for me and my partner",
          question: "Awesome! 💪 How many times a week and at what time works for you?",
          answer: "Twice a week, in the evening",
          lines: [["8 couple sessions per month", "$420"], ["Fitness assessment x2", "Free"], ["Couple discount", "-$70"]],
          total: "$350 per month",
        },
        tryIt: ["How much is the monthly plan?", "I want a trial class", "I can't make it today"],
      },
    },
  },
  tatuajes: {
    key: "tatuajes",
    emoji: "🖋️",
    name: "Tinta Norte Tattoo",
    initials: "TN",
    formType: "beauty",
    texts: {
      es: {
        label: "Tatuajes o piercing",
        client: "Sofía",
        pro: "Nico",
        service: "tatuaje pequeño (hasta 5 cm)",
        price: "desde $40.000",
        duration: "1 hora",
        menu: ["Tatuaje mediano: desde $80.000", "Sesión de 3 horas: $150.000", "Piercing: $20.000"],
        hours: "martes a sábado de 12:00 a 20:00, solo con cita",
        address: "Calle Bandera 345, piso 2",
        slots: ["jueves 13:00", "viernes 16:00", "sábado 12:00"],
        nightQuestion: "Hola! ¿Hacen tatuajes de línea fina? ¿Cuánto cobran?",
        quote: {
          request: "Hola, quiero cotizar un tatuaje de una golondrina en el antebrazo",
          question: "¡Qué buena idea! 🖋️ ¿De qué tamaño más o menos, y a color o en negro?",
          answer: "Unos 8 cm, solo negro",
          lines: [["Diseño personalizado", "Incluido"], ["Tatuaje mediano (8 cm, negro)", "$80.000"], ["Abono para reservar", "$20.000"]],
          total: "$80.000 (el abono se descuenta)",
        },
        tryIt: ["¿Cuánto es el abono?", "¿Tienen hora esta semana?", "¿Hacen retoques?"],
      },
      en: {
        label: "Tattoo or piercing studio",
        client: "Sofia",
        pro: "Nico",
        service: "small tattoo (up to 5 cm)",
        price: "from $80",
        duration: "1 hour",
        menu: ["Medium tattoo: from $160", "3-hour session: $300", "Piercing: $40"],
        hours: "Tuesday to Saturday, 12:00 to 20:00, by appointment only",
        address: "345 Bandera St, 2nd floor",
        slots: ["Thursday 13:00", "Friday 16:00", "Saturday 12:00"],
        nightQuestion: "Hi! Do you do fine-line tattoos? How much do you charge?",
        quote: {
          request: "Hi, I'd like a quote for a swallow tattoo on my forearm",
          question: "Great idea! 🖋️ Roughly what size, and color or black only?",
          answer: "About 8 cm, black only",
          lines: [["Custom design", "Included"], ["Medium tattoo (8 cm, black)", "$160"], ["Deposit to book", "$40"]],
          total: "$160 (deposit is deducted)",
        },
        tryIt: ["How much is the deposit?", "Any slot this week?", "Do you do touch-ups?"],
      },
    },
  },
  otro: {
    key: "otro",
    emoji: "✨",
    name: "Tu negocio",
    initials: "TN",
    formType: "other",
    texts: {
      es: {
        label: "Otro",
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
        label: "Other",
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
