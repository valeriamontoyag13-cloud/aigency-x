// TODO: reemplazar con el número real de WhatsApp Business (formato internacional, solo dígitos).
export const WHATSAPP_NUMBER = "10000000000";

// TODO: reemplazar con el número real para llamadas (formato internacional, con +).
export const PHONE_NUMBER = "+10000000000";

export const CONTACT_EMAIL = "aigencyx.ia@gmail.com";

// TODO: reemplazar LinkedIn con la URL real cuando exista.
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/aigency.x/",
  linkedin: "https://linkedin.com/company/aigencyx",
};

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Opens a Gmail compose window with the recipient, subject and body already filled in. */
export function buildGmailLink(subject: string, body: string) {
  const params = new URLSearchParams({ view: "cm", fs: "1", to: CONTACT_EMAIL, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
