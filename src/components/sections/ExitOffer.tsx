"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useFormPrefill } from "@/lib/FormPrefillContext";
import { LEAD_SENT_KEY } from "@/lib/demoEvents";

const SEEN_KEY = "aigency:exit-offer-seen";
// Give the visitor time to look around before it can show.
const MIN_TIME_ON_PAGE = 12000;

/**
 * "Before you go": when the mouse heads to the browser's top bar (to close the
 * tab or leave) the founding-client offer shows once per visit. Desktop only;
 * on phones there is no reliable "about to leave" signal, so it never shows.
 */
export function ExitOffer() {
  const t = useTranslations("exitOffer");
  const { requestContact } = useFormPrefill();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    try {
      if (sessionStorage.getItem(SEEN_KEY) || sessionStorage.getItem(LEAD_SENT_KEY)) return;
    } catch {
      // Storage blocked: still fine to show once for this page view.
    }
    const startedAt = Date.now();
    function onLeave(event: MouseEvent) {
      if (event.relatedTarget || event.clientY > 0 || Date.now() - startedAt < MIN_TIME_ON_PAGE) return;
      if (document.querySelector("#contacto")?.contains(document.activeElement)) return;
      // They already asked for their quote while on the page.
      try {
        if (sessionStorage.getItem(LEAD_SENT_KEY)) return;
      } catch {
        // Storage blocked: carry on.
      }
      setOpen(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Ignore: it just may show again on the next visit.
      }
      document.removeEventListener("mouseout", onLeave);
    }
    document.addEventListener("mouseout", onLeave);
    return () => document.removeEventListener("mouseout", onLeave);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function claim() {
    setOpen(false);
    requestContact({ mainTask: t("cta"), solutionInterest: "aiAgent" });
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(27,23,48,0.45)] p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-offer-title"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] bg-white text-center shadow-[0_40px_80px_-30px_rgba(27,23,48,0.6)]"
          >
            <div className="relative bg-[var(--color-ink)] px-7 pb-7 pt-8 text-white">
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "radial-gradient(80% 90% at 85% 0%, rgba(124,77,255,0.55), transparent 70%)" }}
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="absolute right-4 top-4 cursor-pointer rounded-full p-1.5 text-white/60 hover:text-white"
              >
                <X size={18} />
              </button>
              <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#d7caff]">
                <Sparkles size={13} />
                {t("badge")}
              </span>
              <p id="exit-offer-title" className="text-display relative mt-4 text-[1.7rem] font-medium leading-[1.15]">
                {t("title")}
              </p>
            </div>
            <div className="px-7 pb-6 pt-5">
              <p className="text-[15px] leading-relaxed text-[var(--color-muted)]">{t("text")}</p>
              <a
                href="#contacto"
                onClick={claim}
                className="group mt-5 flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[var(--color-ink)]"
              >
                {t("cta")}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 cursor-pointer text-[13px] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                {t("dismiss")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
