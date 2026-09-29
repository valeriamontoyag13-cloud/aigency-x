import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "primary",
}: {
  children: ReactNode;
  tone?: "primary" | "warm" | "neutral";
}) {
  const tones = {
    primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary-hover)]",
    warm: "bg-[#fff3de] text-[#8a5a08]",
    neutral: "bg-[var(--color-surface-alt)] text-[var(--color-muted)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
