import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/nav/LanguageSwitcher";
import { CONTACT_EMAIL, SOCIAL_LINKS, buildWhatsAppLink } from "@/config/contact";
import { LEGAL, hasLegalIdentity } from "@/config/legal";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const product = useTranslations("product.tabs");
  // Absolute so the links also work from the privacy and terms pages.
  const home = `/${useLocale()}`;
  const year = new Date().getFullYear();

  const linkClass = "text-[15px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]";

  return (
    <footer className="border-t border-black/5 bg-white pb-10 pt-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-[280px] text-[15px] leading-relaxed text-[var(--color-muted)]">{t("description")}</p>
          </div>

          <div>
            <p className="text-[15px] font-medium text-[var(--color-ink)]">{t("servicesTitle")}</p>
            <ul className="mt-4 space-y-2.5">
              {[
                product("web"),
                product("agents"),
                t("whatsappAgent"),
                product("automation"),
                product("menus"),
              ].map((name) => (
                <li key={name}>
                  <a href={`${home}#servicios`} className={linkClass}>
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[15px] font-medium text-[var(--color-ink)]">{t("companyTitle")}</p>
            <ul className="mt-4 space-y-2.5">
              <li><a href={`${home}#servicios`} className={linkClass}>{nav("solutions")}</a></li>
              <li><a href={`${home}#contacto`} className={linkClass}>{nav("contact")}</a></li>
            </ul>
          </div>

          <div>
            <p className="text-[15px] font-medium text-[var(--color-ink)]">{t("contactTitle")}</p>
            <ul className="mt-4 space-y-2.5">
              <li><a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>{CONTACT_EMAIL}</a></li>
              <li>
                <a href={buildWhatsAppLink(t("description"))} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start gap-4 border-t border-black/5 pt-6 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>{t("copyright", { year })}</p>
            {hasLegalIdentity ? (
              <p>{t("operator", { legalName: LEGAL.legalName, abn: LEGAL.abn })}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacidad" className="hover:text-[var(--color-ink)]">
              {t("privacyPolicy")}
            </Link>
            <Link href="/terminos" className="hover:text-[var(--color-ink)]">
              {t("terms")}
            </Link>
            <LanguageSwitcher compact />
          </div>
        </div>
      </Container>
    </footer>
  );
}
