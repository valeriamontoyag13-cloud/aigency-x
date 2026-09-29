import type { SolutionInterest } from "@/lib/FormPrefillContext";

export type FormStepKey = "businessType" | "tasks" | "clientSource" | "website" | "hoursLost";

export type FormStepConfig = {
  key: FormStepKey;
  multi: boolean;
  options: string[];
  /** Option that reveals a short text input. */
  other?: string;
};

// Task options depend on the business picked in the first question, so a
// restaurant sees reservations and orders while a clinic sees consultations.
export const tasksByBusiness: Record<string, string[]> = {
  restaurant: ["reservations", "orders", "menuQuestions", "deliveries", "reviews", "other"],
  beauty: ["booking", "reminders", "prices", "reschedule", "followUp", "other"],
  health: ["consultations", "patientReminders", "faq", "intake", "followUpPatients", "other"],
  retail: ["stock", "whatsappOrders", "payments", "catalog", "afterSale", "other"],
  services: ["answering", "quotes", "meetings", "followUp", "organizing", "other"],
  other: ["answering", "booking", "quotes", "followUp", "organizing", "other"],
};

// Five questions: what the business does, where time goes, where customers
// come from, whether the website works, and how many hours repetitive work
// costs each week. Contact details are asked afterwards as a final step.
export const formSteps: FormStepConfig[] = [
  { key: "businessType", multi: false, options: ["restaurant", "beauty", "health", "retail", "services", "other"], other: "other" },
  { key: "tasks", multi: true, options: tasksByBusiness.other, other: "other" },
  { key: "clientSource", multi: false, options: ["whatsapp", "instagram", "website", "referrals", "other", "none"] },
  { key: "website", multi: false, options: ["works", "improve", "none", "unsure"] },
  { key: "hoursLost", multi: false, options: ["lt2", "2to5", "5to10", "gt10"] },
];

export const optionEmoji: Record<FormStepKey, Record<string, string>> = {
  businessType: { restaurant: "🍽️", beauty: "💇", health: "🩺", retail: "🛍️", services: "💼", other: "✨" },
  tasks: {
    answering: "💬",
    booking: "📅",
    quotes: "🧾",
    followUp: "🔁",
    organizing: "🗂️",
    other: "✏️",
    reservations: "📅",
    orders: "🛎️",
    menuQuestions: "📖",
    deliveries: "🛵",
    reviews: "⭐",
    reminders: "⏰",
    prices: "💬",
    reschedule: "🔄",
    consultations: "📅",
    patientReminders: "⏰",
    faq: "💬",
    intake: "📋",
    followUpPatients: "🔁",
    stock: "📦",
    whatsappOrders: "📱",
    payments: "💳",
    catalog: "📖",
    afterSale: "🔁",
    meetings: "🤝",
  },
  clientSource: { whatsapp: "📱", instagram: "📸", website: "🌐", referrals: "🤝", other: "🧭", none: "🌱" },
  website: { works: "😎", improve: "🛠️", none: "🚫", unsure: "🤔" },
  hoursLost: { lt2: "⏱️", "2to5": "🕐", "5to10": "⏳", gt10: "🔥" },
};

export const contactChannels = ["whatsapp", "email"] as const;
export type ContactChannel = (typeof contactChannels)[number];

export const timelines = ["asap", "month", "later"] as const;

/** Tasks preselected when the visitor arrives from a specific service CTA. */
export const interestToTasks: Partial<Record<SolutionInterest, string[]>> = {
  aiAgent: ["answering", "faq"],
  chatbot: ["answering", "faq"],
  appointments: ["booking", "consultations", "reservations"],
  quotes: ["quotes"],
};
