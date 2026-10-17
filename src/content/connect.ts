import type { AppLocale } from "@/i18n/routing";

/** Copy for the private "Connect your WhatsApp" page that each client opens from their own link. */
export type ConnectCopy = {
  metaTitle: string;
  title: string;
  intro: string;
  chooseLabel: string;
  modes: {
    coexistence: { title: string; text: string };
    new: { title: string; text: string };
  };
  safety: string[];
  button: string;
  connecting: string;
  sending: string;
  done: { title: string; text: string };
  partial: { title: string; text: string };
  cancelled: string;
  failed: string;
  retry: string;
  invalidLink: string;
  notReady: string;
};

export const connectContent: Record<AppLocale, ConnectCopy> = {
  es: {
    metaTitle: "Conectar WhatsApp | AIgency.X",
    title: "Conecta tu WhatsApp con AIgency.X",
    intro:
      "Se abre una ventana oficial de Meta (Facebook). Ahí eliges tu cuenta y tu número, y das permiso para que tu asistente responda por ti. Toma unos 2 minutos.",
    chooseLabel: "¿Cómo usas hoy tu número?",
    modes: {
      coexistence: {
        title: "Ya lo uso con WhatsApp Business",
        text: "Sigues usando tu app como siempre y el asistente responde en el mismo número. Tus chats y contactos se mantienen.",
      },
      new: {
        title: "Es un número nuevo",
        text: "El número queda solo para el asistente (no se puede usar a la vez en la app de WhatsApp).",
      },
    },
    safety: [
      "Nunca te pedimos tu contraseña: todo se autoriza dentro de la ventana de Meta.",
      "Puedes quitar el permiso cuando quieras desde la configuración de tu cuenta de Meta.",
    ],
    button: "Conectar con Meta",
    connecting: "Completa los pasos en la ventana de Meta…",
    sending: "Terminando la conexión, no cierres esta página…",
    done: {
      title: "¡Listo, tu WhatsApp quedó conectado!",
      text: "Te escribiremos para contarte los próximos pasos antes de encender tu asistente.",
    },
    partial: {
      title: "Casi listo",
      text: "La conexión quedó a medias. Ya nos llegó el aviso y te escribimos; si te lo pedimos, puedes repetir el proceso con este mismo link.",
    },
    cancelled: "Cerraste la ventana antes de terminar. Puedes intentarlo de nuevo cuando quieras.",
    failed: "No se pudo completar la conexión. Inténtalo de nuevo y, si se repite, escríbenos.",
    retry: "Intentar de nuevo",
    invalidLink: "Este link no es válido o ya se usó. Pídele a AIgency.X tu link de conexión.",
    notReady: "La conexión todavía no está disponible. Te avisaremos cuando puedas hacerla.",
  },
  en: {
    metaTitle: "Connect WhatsApp | AIgency.X",
    title: "Connect your WhatsApp to AIgency.X",
    intro:
      "An official Meta (Facebook) window will open. Choose your account and number there, and allow your assistant to reply for you. It takes about 2 minutes.",
    chooseLabel: "How do you use your number today?",
    modes: {
      coexistence: {
        title: "I already use it with WhatsApp Business",
        text: "Keep using your app as usual while the assistant replies on the same number. Your chats and contacts stay.",
      },
      new: {
        title: "It's a new number",
        text: "The number is used only by the assistant (it can't be used in the WhatsApp app at the same time).",
      },
    },
    safety: [
      "We never ask for your password: everything is authorized inside Meta's window.",
      "You can remove the permission at any time from your Meta account settings.",
    ],
    button: "Connect with Meta",
    connecting: "Complete the steps in the Meta window…",
    sending: "Finishing the connection, please keep this page open…",
    done: {
      title: "Done, your WhatsApp is connected!",
      text: "We'll message you with the next steps before your assistant goes live.",
    },
    partial: {
      title: "Almost there",
      text: "The connection is only partly done. We've been notified and will message you; if we ask, you can repeat it with this same link.",
    },
    cancelled: "You closed the window before finishing. You can try again any time.",
    failed: "The connection couldn't be completed. Please try again and, if it happens again, contact us.",
    retry: "Try again",
    invalidLink: "This link isn't valid or was already used. Ask AIgency.X for your connection link.",
    notReady: "Connecting isn't available yet. We'll let you know when you can do it.",
  },
};
