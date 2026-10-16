import { ImageResponse } from "next/og";

/**
 * The preview card shown when someone shares the page on WhatsApp, Instagram,
 * Facebook or LinkedIn: the promise, a short chat and the brand, in the
 * page's language.
 */

export const alt = "AIgency.x";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const copy = {
  es: {
    title: ["Haz que tu WhatsApp", "responda, agende y cotice", "por ti."],
    subtitle: "Crea gratis una demo con tu negocio · Para negocios de cualquier país",
    chat: [
      { me: false, text: "¡Hola! ¿Tienen hora mañana?" },
      { me: true, text: "¡Hola! 😊 Tengo 11:00 o 16:00. ¿Cuál prefieres?" },
      { me: false, text: "16:00 porfa" },
      { me: true, text: "¡Listo! ✅ Te espero mañana a las 16:00." },
    ],
  },
  en: {
    title: ["Make your WhatsApp", "answer, book and quote", "for you."],
    subtitle: "Create a free demo with your business · For businesses in any country",
    chat: [
      { me: false, text: "Hi! Any slot tomorrow?" },
      { me: true, text: "Hi! 😊 I have 11:00 or 16:00. Which one?" },
      { me: false, text: "16:00 please" },
      { me: true, text: "Done! ✅ See you tomorrow at 16:00." },
    ],
  },
} as const;

/** The brand typeface (Plus Jakarta Sans) from Google Fonts, only the letters used; null if it can't be fetched. */
async function brandFont(weight: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = locale === "en" ? copy.en : copy.es;
  const text = ["AIgency.x", ...t.title, t.subtitle, ...t.chat.map((c) => c.text), "Tu negocio en línea Your business online"].join(" ");
  const [regular, bold] = await Promise.all([brandFont(500, text), brandFont(700, text)]);
  const fonts = [
    ...(regular ? [{ name: "Jakarta", data: regular, weight: 500 as const, style: "normal" as const }] : []),
    ...(bold ? [{ name: "Jakarta", data: bold, weight: 700 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #f3f0fc 0%, #ede7ff 55%, #ffe9df 100%)",
          fontFamily: fonts.length ? "Jakarta" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "linear-gradient(135deg, #a57bff, #7c4dff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: 18, height: 18, borderRadius: 999, background: "#f3f0fc" }} />
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#1b1730" }}>
              AIgency<span style={{ color: "#7c4dff" }}>.x</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, color: "#1b1730", letterSpacing: -1.5 }}>{t.title[0]}</div>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, color: "#7c4dff", letterSpacing: -1.5 }}>{t.title[1]}</div>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, color: "#1b1730", letterSpacing: -1.5 }}>{t.title[2]}</div>
          </div>

          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              fontSize: 24,
              color: "#4b4566",
              background: "rgba(255,255,255,0.75)",
              padding: "12px 22px",
              borderRadius: 999,
            }}
          >
            {t.subtitle}
          </div>
        </div>

        {/* A short WhatsApp chat */}
        <div
          style={{
            marginLeft: "auto",
            width: 360,
            display: "flex",
            flexDirection: "column",
            borderRadius: 36,
            border: "10px solid #1b1730",
            background: "#efeae2",
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "white", padding: "16px 18px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, background: "linear-gradient(135deg, #a57bff, #7c4dff)" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1b1730" }}>{locale === "en" ? "Your business" : "Tu negocio"}</div>
              <div style={{ fontSize: 15, color: "#16a34a" }}>{locale === "en" ? "online" : "en línea"}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 18, flexGrow: 1, justifyContent: "flex-end" }}>
            {t.chat.map((line) => (
              <div
                key={line.text}
                style={{
                  display: "flex",
                  alignSelf: line.me ? "flex-start" : "flex-end",
                  maxWidth: 270,
                  fontSize: 19,
                  lineHeight: 1.3,
                  padding: "10px 14px",
                  borderRadius: 18,
                  background: line.me ? "white" : "#7c4dff",
                  color: line.me ? "#1b1730" : "white",
                }}
              >
                {line.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
