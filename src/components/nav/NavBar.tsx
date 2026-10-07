"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navKeys = [
  { key: "solutions", hash: "#servicios" },
  { key: "contact", hash: "#contacto" },
] as const;

export function NavBar() {
  const t = useTranslations("nav");
  // Absolute so the links also work from the privacy and terms pages.
  const home = `/${useLocale()}`;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter] duration-300 ${
        scrolled || mobileOpen ? "bg-white/75 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto] items-center px-6 py-4 md:px-10 lg:grid-cols-[1fr_auto_1fr]">
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

        <div className="hidden items-center justify-end gap-5 lg:flex">
          <LanguageSwitcher compact />
          <Button href={`${home}#contacto`} variant="primary" className="px-5 py-2.5">
            {t("cta")}
          </Button>
        </div>

        <button
          type="button"
          className="flex items-center justify-center justify-self-end rounded-full p-2 text-[var(--color-ink)] lg:hidden"
          aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
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
            <div className="flex items-center justify-between pt-4">
              <LanguageSwitcher />
              <Button href={`${home}#contacto`} variant="primary" onClick={() => setMobileOpen(false)}>
                {t("cta")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
