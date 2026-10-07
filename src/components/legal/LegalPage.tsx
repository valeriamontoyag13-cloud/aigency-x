import { Container } from "@/components/ui/Container";
import { LEGAL } from "@/config/legal";
import type { LegalDoc } from "@/content/legal";

export function LegalPage({ doc, locale }: { doc: LegalDoc; locale: string }) {
  const updated = new Date(`${LEGAL.updated}T12:00:00Z`).toLocaleDateString(
    locale === "es" ? "es-CL" : "en-AU",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <article className="pb-24 pt-32 sm:pt-36">
      <Container className="max-w-[760px]">
        <h1 className="font-[family-name:var(--font-jakarta)] text-3xl font-semibold tracking-tight sm:text-4xl">
          {doc.title}
        </h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          {doc.updatedLabel}: {updated}
        </p>
        <p className="mt-8 text-[17px] leading-relaxed">{doc.intro}</p>

        <nav aria-label={doc.title} className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-fog)] p-5">
          <ol className="grid gap-1.5 text-[15px] sm:grid-cols-2">
            {doc.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-[var(--color-muted)] hover:text-[var(--color-primary)]">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-12 scroll-mt-28">
            <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-semibold">{section.heading}</h2>
            {section.paragraphs?.map((text) => (
              <p key={text} className="mt-4 leading-relaxed text-[var(--color-muted)]">
                {text}
              </p>
            ))}
            {section.items ? (
              <ul className="mt-4 list-disc space-y-2.5 pl-5 leading-relaxed text-[var(--color-muted)] marker:text-[var(--color-primary)]">
                {section.items.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            ) : null}
            {section.after?.map((text) => (
              <p key={text} className="mt-4 leading-relaxed text-[var(--color-muted)]">
                {text}
              </p>
            ))}
          </section>
        ))}
      </Container>
    </article>
  );
}
