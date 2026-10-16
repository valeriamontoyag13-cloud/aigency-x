import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  size = "default",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** "compact" keeps the heading short so the section fits on one screen. */
  size?: "default" | "compact";
}) {
  const compact = size === "compact";
  return (
    <div className={`max-w-[760px] ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <p className={`${compact ? "mb-3" : "mb-4"} text-sm font-medium text-[var(--color-primary)]`}>{eyebrow}</p>
      ) : null}
      <h2
        className={`text-display font-medium leading-[1.1] text-[var(--color-ink)] ${
          compact ? "text-[1.9rem] md:text-[2.5rem] lg:text-[2.75rem]" : "text-[2.1rem] md:text-5xl lg:text-[3.4rem]"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`${compact ? "mt-3 md:text-[17px]" : "mt-5 md:text-lg"} text-base leading-relaxed text-[var(--color-muted)]`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
