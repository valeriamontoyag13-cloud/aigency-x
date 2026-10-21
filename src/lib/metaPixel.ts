/**
 * Meta Pixel: tells Meta Ads who saw the page, built a demo, wrote to the demo
 * chat, asked for a quote or opened WhatsApp, so the ads find more businesses
 * like those. With no ID nothing loads and every call does nothing.
 */

// The pixel ID from Meta Events Manager (public: it travels in every page anyway).
// NEXT_PUBLIC_META_PIXEL_ID in Vercel wins over this one.
const PIXEL_ID_IN_CODE = "";

const configured = (process.env.NEXT_PUBLIC_META_PIXEL_ID || PIXEL_ID_IN_CODE).trim();
// A pixel ID is only digits; anything else is ignored.
export const META_PIXEL_ID = /^\d{6,20}$/.test(configured) ? configured : "";

type Fbq = (command: "track" | "trackCustom", event: string, params?: Record<string, unknown>) => void;

function fbq(): Fbq | null {
  if (!META_PIXEL_ID || typeof window === "undefined") return null;
  return ((window as unknown as { fbq?: Fbq }).fbq ?? null);
}

/** A standard event (Lead, Contact, ViewContent…), the ones Meta optimizes ads for. */
export function trackStandard(event: "Lead" | "Contact" | "ViewContent" | "PageView", params?: Record<string, unknown>) {
  fbq()?.("track", event, params);
}

/** One of ours: DemoCreada, ChatDemo. */
export function trackCustom(event: "DemoCreada" | "ChatDemo", params?: Record<string, unknown>) {
  fbq()?.("trackCustom", event, params);
}
