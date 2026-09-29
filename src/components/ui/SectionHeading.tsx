import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-[760px] ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <p className="mb-4 text-sm font-medium text-[var(--color-primary)]">{eyebrow}</p>
      ) : null}
      <h2 className="text-display text-[2.1rem] font-medium leading-[1.1] text-[var(--color-ink)] md:text-5xl lg:text-[3.4rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-relaxed text-[var(--color-muted)] md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
