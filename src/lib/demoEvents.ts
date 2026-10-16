import type { BusinessKey, PainKey } from "@/content/demoBusinesses";
import type { Currency } from "@/lib/currency";

/** The hero's "create my demo" button brings the visitor to the demo form. */
export const START_DEMO_EVENT = "aigency:start-demo";
/** The demo tells the rest of the page that the visitor created their demo. */
export const DEMO_PICK_EVENT = "aigency:demo-pick";
/** "Build your assistant" tells the contact form which services the visitor wants. */
export const SERVICES_PICK_EVENT = "aigency:services-pick";

/** Set (in sessionStorage) once the visitor sends the contact form: no more "ask for a quote" nudges. */
export const LEAD_SENT_KEY = "aigency:lead-sent";

/** The services AIgency builds, as picked in "Build your assistant" and in the contact form. */
export const serviceKeys = ["assistant", "agenda", "quotes", "website"] as const;
export type ServiceKey = (typeof serviceKeys)[number];

export type StartDemoDetail = { business?: BusinessKey };

/** What the visitor told the demo, so the rest of the page can speak about their business. */
export type DemoPickDetail = {
  business: BusinessKey;
  pains: PainKey[];
  name?: string;
  address?: string;
  currency?: Currency;
  services?: { name: string; amount: number }[];
  /** One line with all of it, ready to send with the lead. */
  summary?: string;
};

export type ServicesPickDetail = { services: ServiceKey[] };

export function startDemo(detail: StartDemoDetail) {
  window.dispatchEvent(new CustomEvent<StartDemoDetail>(START_DEMO_EVENT, { detail }));
}

export function announceDemoPick(detail: DemoPickDetail) {
  window.dispatchEvent(new CustomEvent<DemoPickDetail>(DEMO_PICK_EVENT, { detail }));
}

export function announceServicesPick(detail: ServicesPickDetail) {
  window.dispatchEvent(new CustomEvent<ServicesPickDetail>(SERVICES_PICK_EVENT, { detail }));
}
