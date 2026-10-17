"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ConnectCopy } from "@/content/connect";

// Public values (they ship in Meta's own login popup anyway). The App Secret never reaches the browser:
// n8n exchanges the code server-side.
const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID ?? "";
const CONFIG_ID = process.env.NEXT_PUBLIC_META_ES_CONFIG_ID ?? "";
const GRAPH_VERSION = "v23.0";

type Mode = "coexistence" | "new";
// Embedded Signup v4. Coexistence (number already on the WhatsApp Business app) is requested with featureType.
// TODO(verificación Meta): confirm both objects with the Embedded Signup Builder in the App Dashboard once the
// production app has WhatsApp; it is the only part Meta's docs leave ambiguous for v4.
const EXTRAS: Record<Mode, Record<string, unknown>> = {
  coexistence: { setup: {}, featureType: "whatsapp_business_app_onboarding" },
  new: { setup: {} },
};

type Session = { event: string; waba_id?: string; phone_number_id?: string; business_id?: string };
type Status = "idle" | "connecting" | "sending" | "done" | "partial" | "cancelled" | "failed";

type FacebookSdk = {
  init: (options: Record<string, unknown>) => void;
  login: (callback: (response: { authResponse?: { code?: string } | null }) => void, options: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

function loadSdk(onReady: () => void) {
  if (window.FB) return onReady();
  window.fbAsyncInit = () => {
    window.FB?.init({ appId: APP_ID, autoLogAppEvents: true, xfbml: false, version: GRAPH_VERSION });
    onReady();
  };
  if (document.getElementById("facebook-jssdk")) return;
  const script = document.createElement("script");
  script.id = "facebook-jssdk";
  script.src = "https://connect.facebook.net/en_US/sdk.js";
  script.async = true;
  script.defer = true;
  script.crossOrigin = "anonymous";
  document.body.appendChild(script);
}

export type ConnectLink = { negocio: string; codigo: string };

export function ConnectWhatsApp({ copy, initialLink }: { copy: ConnectCopy; initialLink: ConnectLink | null }) {
  // Each client gets a private link: /conectar?n=<business id>&c=<one-time code> (read by the page on the server).
  const [link, setLink] = useState(initialLink);
  const [sdkReady, setSdkReady] = useState(false);
  const [mode, setMode] = useState<Mode>("coexistence");
  const [status, setStatus] = useState<Status>("idle");
  const [number, setNumber] = useState("");
  const session = useRef<Session | null>(null);
  const configured = Boolean(APP_ID && CONFIG_ID);

  useEffect(() => {
    if (!configured || !link) return;
    loadSdk(() => setSdkReady(true));

    // Meta reports the chosen account and number (or a cancel) through postMessage.
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type !== "WA_EMBEDDED_SIGNUP") return;
        if (typeof data.event === "string" && data.event.startsWith("FINISH")) {
          session.current = { event: data.event, ...data.data };
        } else if (data.event === "CANCEL") {
          setStatus((s) => (s === "connecting" ? "cancelled" : s));
        }
      } catch {
        // Other Facebook messages are not JSON: ignore them.
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [configured, link]);

  async function finish(code: string) {
    setStatus("sending");
    // The session message can arrive right after the login callback: wait for it briefly (the code lasts 30 s).
    for (let i = 0; i < 25 && !session.current; i++) await new Promise((r) => setTimeout(r, 200));
    const s = session.current;
    if (!s || !link) return setStatus("failed");
    try {
      const response = await fetch("/api/whatsapp/conectar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...link, code, evento: s.event, waba_id: s.waba_id ?? "", phone_number_id: s.phone_number_id ?? "", business_id: s.business_id ?? "" }),
      });
      const result = await response.json().catch(() => ({}));
      if (result.error === "link_invalido") return setLink(null);
      setNumber(result.numero ?? "");
      setStatus(result.resultado === "lista" ? "done" : result.ok ? "partial" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  function launch() {
    if (!window.FB) return;
    session.current = null;
    setStatus("connecting");
    window.FB.login(
      (response) => {
        const code = response.authResponse?.code;
        if (code) void finish(code);
        else setStatus((s) => (s === "connecting" ? "cancelled" : s));
      },
      { config_id: CONFIG_ID, response_type: "code", override_default_response_type: true, extras: EXTRAS[mode] },
    );
  }

  if (!link) return <Notice tone="warn" text={copy.invalidLink} />;
  if (!configured) return <Notice tone="warn" text={copy.notReady} />;
  if (status === "done" || status === "partial") {
    const doneCopy = status === "done" ? copy.done : copy.partial;
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-fog)] p-6">
        <div className="flex items-start gap-3">
          {status === "done" ? (
            <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-[var(--color-success)]" aria-hidden />
          ) : (
            <AlertTriangle className="mt-0.5 size-6 shrink-0 text-[var(--color-accent-warm)]" aria-hidden />
          )}
          <div>
            <p className="font-[family-name:var(--font-jakarta)] text-lg font-semibold">{doneCopy.title}</p>
            {number ? <p className="mt-1 font-medium">{number}</p> : null}
            <p className="mt-2 leading-relaxed text-[var(--color-muted)]">{doneCopy.text}</p>
          </div>
        </div>
      </div>
    );
  }

  const busy = status === "connecting" || status === "sending";
  return (
    <div>
      <fieldset disabled={busy}>
        <legend className="font-medium">{copy.chooseLabel}</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(Object.keys(copy.modes) as Mode[]).map((key) => (
            <label
              key={key}
              className={`cursor-pointer rounded-2xl border p-5 transition-colors ${
                mode === key
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
              }`}
            >
              <input type="radio" name="mode" value={key} checked={mode === key} onChange={() => setMode(key)} className="sr-only" />
              <span className="block font-medium">{copy.modes[key].title}</span>
              <span className="mt-1.5 block text-sm leading-relaxed text-[var(--color-muted)]">{copy.modes[key].text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <ul className="mt-6 space-y-2 text-sm text-[var(--color-muted)]">
        {copy.safety.map((text) => (
          <li key={text} className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
            {text}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button onClick={launch} disabled={!sdkReady || busy}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {status === "cancelled" || status === "failed" ? copy.retry : copy.button}
        </Button>
        <p role="status" aria-live="polite" className="text-sm text-[var(--color-muted)]">
          {status === "connecting" ? copy.connecting : status === "sending" ? copy.sending : ""}
        </p>
      </div>
      {status === "cancelled" || status === "failed" ? (
        <div className="mt-6">
          <Notice tone="warn" text={status === "cancelled" ? copy.cancelled : copy.failed} />
        </div>
      ) : null}
    </div>
  );
}

function Notice({ text, tone }: { text: string; tone: "warn" }) {
  return (
    <div role={tone === "warn" ? "alert" : undefined} className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-fog)] p-5">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[var(--color-accent-warm)]" aria-hidden />
      <p className="leading-relaxed">{text}</p>
    </div>
  );
}
