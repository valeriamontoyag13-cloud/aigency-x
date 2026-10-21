/**
 * Where the visitor came from: the ad's UTM tags and Meta's click id. Kept in
 * this browser for 30 days and sent only with the contact form, to our own
 * CRM, so each lead says which ad brought it (privacy policy, section 12).
 */

const ORIGIN_KEY = "aigency:origin";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const urlParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;

export type AdOrigin = Partial<Record<(typeof urlParams)[number] | "landing" | "referrer" | "firstSeen", string>>;

/** Call on every page load: a new ad click replaces what we had; a plain visit keeps it. */
export function rememberAdOrigin() {
  try {
    const url = new URL(window.location.href);
    const fromUrl: AdOrigin = {};
    for (const param of urlParams) {
      const value = url.searchParams.get(param)?.trim();
      if (value) fromUrl[param] = value.slice(0, 200);
    }
    if (!Object.keys(fromUrl).length && Object.keys(readAdOrigin()).length) return;

    // Only the site's name (instagram.com, google.com), never the full address.
    let referrer = "";
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : "";
      referrer = host === url.hostname ? "" : host;
    } catch {
      // A referrer that isn't a URL is left out.
    }
    const origin: AdOrigin = { ...fromUrl, landing: url.pathname.slice(0, 200), referrer, firstSeen: new Date().toISOString() };
    localStorage.setItem(ORIGIN_KEY, JSON.stringify(origin));
  } catch {
    // Without storage the lead simply goes without its origin.
  }
}

/** What we remembered, or nothing if it is older than 30 days. */
export function readAdOrigin(): AdOrigin {
  try {
    const origin = JSON.parse(localStorage.getItem(ORIGIN_KEY) ?? "{}") as AdOrigin;
    const age = origin.firstSeen ? Date.now() - Date.parse(origin.firstSeen) : Infinity;
    return age < MAX_AGE_MS ? origin : {};
  } catch {
    return {};
  }
}
