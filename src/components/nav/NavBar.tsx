"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { buildWhatsAppLink } from "@/config/contact";

const navKeys = [
  { key: "tryIt", hash: "#prueba" },
  { key: "solutions", hash: "#servicios" },
  { key: "contact", hash: "#contacto" },
] as const;

export function NavBar() {
  const t = useTranslations("nav");
  // Absolute so the links also work from the privacy and terms pages.
  const home = `/${useLocale()}`;
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const whatsapp = buildWhatsAppLink(t("whatsappMessage"));

  // Slides away while scrolling down so sections get the whole screen, and
  // comes back as soon as the visitor scrolls up.
  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > 160 && y > lastY);
        lastY = y;
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,translate] duration-300 ${
        scrolled || mobileOpen ? "bg-white/75 backdrop-blur-xl" : "bg-transparent"
      } ${hidden && !mobileOpen ? "-translate-y-full" : ""}`}
    >
      <nav className={`mx-auto grid max-w-[1200px] grid-cols-[1fr_auto] items-center px-6 transition-[padding] duration-300 md:px-10 ${
          scrolled ? "py-2.5" : "py-4"
        } lg:flex lg:justify-between lg:gap-6`}>
        <a href={`${home}#top`} aria-label="AIgency.x">
          <Logo />
        </a>

        <div className="hidden items-center gap-7 whitespace-nowrap lg:flex">
          {navKeys.map((item) => (
            <a
              key={item.key}
              href={`${home}${item.hash}`}
              className="text-[15px] text-[var(--color-ink)] transition-colors hover:text-[var(--color-primary)]"
            >
              {t(item.key)}
            </a>
          ))}
        </div>

        <div className="hidden items-center justify-end gap-3 lg:flex">
          <LanguageSwitcher compact />
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#25d366]/40 bg-white/70 px-4 py-2.5 text-[15px] font-medium text-[#15803d] transition-colors hover:bg-[#25d366] hover:text-white"
          >
            <MessageCircle size={16} />
            {t("whatsapp")}
          </a>
          <Button href={`${home}#contacto`} variant="primary" className="px-5 py-2.5">
            {t("cta")}
          </Button>
        </div>

        <div className="flex items-center gap-1 justify-self-end lg:hidden">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("whatsapp")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366] text-white"
          >
            <MessageCircle size={19} />
          </a>
          <button
            type="button"
            className="flex items-center justify-center rounded-full p-2 text-[var(--color-ink)]"
            aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {mobileOpen ? (
        <div className="px-6 pb-6 lg:hidden">
          <div className="flex flex-col gap-1">
            {navKeys.map((item) => (
              <a
                key={item.key}
                href={`${home}${item.hash}`}
                onClick={() => setMobileOpen(false)}
                className="border-b border-black/5 py-3 text-lg text-[var(--color-ink)]"
              >
                {t(item.key)}
              </a>
            ))}
            {/* Language, then the call to action across the whole width: nothing gets cut on small phones */}
            <div className="flex flex-col gap-3 pt-4">
              <LanguageSwitcher />
              <Button href={`${home}#contacto`} variant="primary" className="w-full justify-center" onClick={() => setMobileOpen(false)}>
                {t("cta")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
