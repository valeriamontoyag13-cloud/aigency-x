/**
 * Currencies the page can show, how to format them, and rough conversions
 * from US dollars for the example prices. Chile, Colombia and the US have
 * prices set by hand (see content/serviceCatalog.ts); every other currency
 * converts the US price with an approximate exchange rate and the country's
 * price level, so a manicure in Indonesia doesn't cost what it does in Miami.
 * These are examples to play with in the demo, never a quote.
 */

export const currencyCodes = [
  "USD",
  "CLP",
  "COP",
  "MXN",
  "ARS",
  "PEN",
  "BRL",
  "UYU",
  "PYG",
  "BOB",
  "DOP",
  "GTQ",
  "CRC",
  "HNL",
  "NIO",
  "CAD",
  "EUR",
  "GBP",
  "AUD",
  "NZD",
  "IDR",
  "INR",
  "PHP",
  "MYR",
  "SGD",
  "THB",
  "JPY",
  "AED",
  "ZAR",
] as const;
export type Currency = (typeof currencyCodes)[number];

type Info = {
  /** Locale used to write amounts ("$ 60.000", "Rp 150.000", "A$45"). */
  locale: string;
  /** Approximate units per US dollar. */
  perUsd: number;
  /** Rough price level compared with the US (1), for believable example prices. */
  level: number;
};

export const currencyInfo: Record<Currency, Info> = {
  USD: { locale: "en-US", perUsd: 1, level: 1 },
  CLP: { locale: "es-CL", perUsd: 950, level: 0.6 },
  COP: { locale: "es-CO", perUsd: 4000, level: 0.5 },
  MXN: { locale: "es-MX", perUsd: 18.5, level: 0.55 },
  ARS: { locale: "es-AR", perUsd: 1200, level: 0.5 },
  PEN: { locale: "es-PE", perUsd: 3.7, level: 0.5 },
  BRL: { locale: "pt-BR", perUsd: 5.5, level: 0.5 },
  UYU: { locale: "es-UY", perUsd: 40, level: 0.7 },
  PYG: { locale: "es-PY", perUsd: 7500, level: 0.4 },
  BOB: { locale: "es-BO", perUsd: 6.9, level: 0.35 },
  DOP: { locale: "es-DO", perUsd: 60, level: 0.45 },
  GTQ: { locale: "es-GT", perUsd: 7.7, level: 0.45 },
  CRC: { locale: "es-CR", perUsd: 510, level: 0.6 },
  HNL: { locale: "es-HN", perUsd: 26, level: 0.4 },
  NIO: { locale: "es-NI", perUsd: 36.7, level: 0.35 },
  CAD: { locale: "en-CA", perUsd: 1.37, level: 0.95 },
  EUR: { locale: "es-ES", perUsd: 0.92, level: 0.85 },
  GBP: { locale: "en-GB", perUsd: 0.78, level: 0.95 },
  AUD: { locale: "en-AU", perUsd: 1.52, level: 1 },
  NZD: { locale: "en-NZ", perUsd: 1.65, level: 0.95 },
  IDR: { locale: "id-ID", perUsd: 16000, level: 0.3 },
  INR: { locale: "en-IN", perUsd: 84, level: 0.25 },
  PHP: { locale: "en-PH", perUsd: 57, level: 0.35 },
  MYR: { locale: "ms-MY", perUsd: 4.5, level: 0.4 },
  SGD: { locale: "en-SG", perUsd: 1.33, level: 0.9 },
  THB: { locale: "th-TH", perUsd: 35, level: 0.45 },
  JPY: { locale: "ja-JP", perUsd: 150, level: 0.7 },
  AED: { locale: "en-AE", perUsd: 3.67, level: 0.8 },
  ZAR: { locale: "en-ZA", perUsd: 18, level: 0.45 },
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (currencyCodes as readonly string[]).includes(value);
}

/** "$ 60.000", or "$ 60.000 COP" with `withCode` so nobody wonders which dollar or peso it is. */
export function formatMoney(amount: number, currency: Currency, withCode = false) {
  const text = new Intl.NumberFormat(currencyInfo[currency].locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  return withCode && !text.includes(currency) ? `${text} ${currency}` : text;
}

/** "Rupia indonesia (IDR)", in the page's language. */
export function currencyLabel(currency: Currency, lang: "es" | "en", capitalize = true) {
  let name: string = currency;
  try {
    name = new Intl.DisplayNames([lang], { type: "currency" }).of(currency) ?? currency;
  } catch {
    // Old browsers: the code alone is still clear enough.
  }
  const first = capitalize ? name.charAt(0).toUpperCase() : name.charAt(0);
  return `${first}${name.slice(1)} (${currency})`;
}

/** Rounds to two significant figures: 487.325 -> 490.000, 45,6 -> 46. */
export function niceRound(value: number) {
  if (value <= 0) return 0;
  const step = 10 ** Math.max(0, Math.floor(Math.log10(value)) - 1);
  return Math.max(step, Math.round(value / step) * step);
}

/** An example price set in US dollars, in another currency at that country's price level. */
export function fromUsd(usd: number, currency: Currency) {
  const { perUsd, level } = currencyInfo[currency];
  return currency === "USD" ? usd : niceRound(usd * perUsd * level);
}

// Where the visitor is: first their time zone (where the device is), then the region in their browser language.
const euro = ["ES", "FR", "DE", "IT", "PT", "NL", "BE", "AT", "IE", "GR", "FI", "LU", "SK", "SI", "EE", "LV", "LT", "MT", "CY", "HR"];
const byCountry: Record<string, Currency> = {
  US: "USD", PA: "USD", EC: "USD", SV: "USD", PR: "USD", VE: "USD",
  CL: "CLP", CO: "COP", MX: "MXN", AR: "ARS", PE: "PEN", BR: "BRL", UY: "UYU", PY: "PYG", BO: "BOB",
  DO: "DOP", GT: "GTQ", CR: "CRC", HN: "HNL", NI: "NIO", CA: "CAD", GB: "GBP", AU: "AUD", NZ: "NZD",
  ID: "IDR", IN: "INR", PH: "PHP", MY: "MYR", SG: "SGD", TH: "THB", JP: "JPY", AE: "AED", ZA: "ZAR",
  ...Object.fromEntries(euro.map((c) => [c, "EUR" as Currency])),
};

const byZone: [RegExp, Currency][] = [
  [/^America\/Bogota$/, "COP"],
  [/^(America\/(Santiago|Punta_Arenas)|Pacific\/Easter)$/, "CLP"],
  [/^America\/(Mexico_City|Cancun|Merida|Monterrey|Matamoros|Chihuahua|Ciudad_Juarez|Ojinaga|Mazatlan|Bahia_Banderas|Hermosillo|Tijuana)$/, "MXN"],
  [/^America\/(Argentina\/|Buenos_Aires$)/, "ARS"],
  [/^America\/Lima$/, "PEN"],
  [/^America\/(Sao_Paulo|Bahia|Fortaleza|Recife|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Boa_Vista|Rio_Branco|Araguaina|Maceio|Santarem|Noronha|Eirunepe)$/, "BRL"],
  [/^America\/Montevideo$/, "UYU"],
  [/^America\/Asuncion$/, "PYG"],
  [/^America\/La_Paz$/, "BOB"],
  [/^America\/Santo_Domingo$/, "DOP"],
  [/^America\/Guatemala$/, "GTQ"],
  [/^America\/Costa_Rica$/, "CRC"],
  [/^America\/Tegucigalpa$/, "HNL"],
  [/^America\/Managua$/, "NIO"],
  [/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Whitehorse|Yellowknife|Iqaluit|Glace_Bay|Goose_Bay|Swift_Current|Dawson_Creek|Fort_Nelson|Cambridge_Bay|Rankin_Inlet|Resolute|Inuvik|Dawson|Creston|Atikokan|Blanc-Sablon)$/, "CAD"],
  [/^(America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Juneau|Sitka|Nome|Adak|Menominee|Indiana\/.+|Kentucky\/.+|North_Dakota\/.+|Panama|Guayaquil|El_Salvador|Puerto_Rico|Caracas)|Pacific\/Honolulu)$/, "USD"],
  [/^Europe\/London$/, "GBP"],
  [/^(Europe\/(Madrid|Paris|Berlin|Rome|Lisbon|Amsterdam|Brussels|Vienna|Dublin|Athens|Helsinki|Luxembourg|Bratislava|Ljubljana|Tallinn|Riga|Vilnius|Malta|Zagreb|Monaco|Andorra|Vatican|San_Marino|Nicosia)|Atlantic\/(Canary|Madeira|Azores)|Africa\/Ceuta)$/, "EUR"],
  [/^Australia\//, "AUD"],
  [/^Pacific\/(Auckland|Chatham)$/, "NZD"],
  [/^Asia\/(Jakarta|Pontianak|Makassar|Jayapura)$/, "IDR"],
  [/^Asia\/(Kolkata|Calcutta)$/, "INR"],
  [/^Asia\/Manila$/, "PHP"],
  [/^Asia\/(Kuala_Lumpur|Kuching)$/, "MYR"],
  [/^Asia\/Singapore$/, "SGD"],
  [/^Asia\/Bangkok$/, "THB"],
  [/^Asia\/Tokyo$/, "JPY"],
  [/^Asia\/Dubai$/, "AED"],
  [/^Africa\/Johannesburg$/, "ZAR"],
];

/** The visitor's currency from their time zone, then from their browser languages; null if neither says. */
export function detectCurrency(zone: string, languages: readonly string[]): Currency | null {
  const fromZone = byZone.find(([pattern]) => pattern.test(zone))?.[1];
  if (fromZone) return fromZone;
  for (const language of languages) {
    const region = language.split("-")[1]?.toUpperCase();
    if (region && byCountry[region]) return byCountry[region];
  }
  return null;
}
