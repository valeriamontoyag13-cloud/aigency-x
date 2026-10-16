// WhatsApp Business de AIgency.X (número chileno, formato internacional, solo dígitos).
export const WHATSAPP_NUMBER = "56966059140";

// TODO: reemplazar con el número real para llamadas (formato internacional, con +).
export const PHONE_NUMBER = "+10000000000";

export const CONTACT_EMAIL = "aigencyx.ia@gmail.com";

// TODO: reemplazar LinkedIn con la URL real cuando exista.
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/aigency.x/",
  linkedin: "https://linkedin.com/company/aigencyx",
};

/**
 * Opens a chat with AIgency.x with the message typed in. Emojis are left out:
 * WhatsApp's "open chat" page shows them as "�" on computers.
 */
export function buildWhatsAppLink(message: string) {
  const text = message
    .replace(/\p{Extended_Pictographic}\uFE0F?/gu, "")
    .replace(/\s+([.,])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;
}

/** Opens a Gmail compose window with the recipient, subject and body already filled in. */
export function buildGmailLink(subject: string, body: string) {
  const params = new URLSearchParams({ view: "cm", fs: "1", to: CONTACT_EMAIL, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
