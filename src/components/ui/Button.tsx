import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] px-6 py-3 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]";

const variants: Record<Variant, string> = {
  // Solid ink pill that lights up in the brand purple on hover.
  primary:
    "bg-[var(--color-ink)] text-white hover:bg-[var(--color-primary)] hover:shadow-[0_8px_24px_rgba(124,77,255,0.35)]",
  // Outline pill, always paired next to a primary one.
  secondary:
    "bg-white/40 text-[var(--color-ink)] border border-[var(--color-ink)]/80 backdrop-blur-sm hover:bg-[var(--color-ink)] hover:text-white",
  ghost:
    "bg-transparent text-[var(--color-primary)] px-0 py-1 rounded-none hover:scale-100 hover:gap-3 hover:text-[var(--color-primary-hover)]",
};

type CommonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", children, className = "" } = props;
  const classes = `${base} ${variants[variant]} ${className}`;

  if ("href" in props && props.href) {
    const { href, target, rel, onClick } = props;

    // Same-page anchors (e.g. "#contacto") use a native <a>: Next.js's
    // <Link> can swallow the fragment-only navigation and skip the
    // browser's built-in scroll-into-view, which is what made these
    // CTAs look broken in the field. `scroll-behavior: smooth` in
    // globals.css takes care of the easing.
    if (href.startsWith("#")) {
      return (
        <a href={href} target={target} rel={rel} className={classes} onClick={onClick}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} target={target} rel={rel} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
