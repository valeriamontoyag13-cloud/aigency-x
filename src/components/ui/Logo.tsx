import { useId } from "react";

/**
 * AIgency.x mark: a thick purple ring whose hole sits off-center, so the band
 * is wide on one side and thin on the other, like a ribbon loop seen at an
 * angle. Gradient ids are unique per instance so a hidden copy (e.g. in a
 * closed menu) never breaks the visible ones.
 */
export function LogoMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const fill = `${id}-fill`;
  const depth = `${id}-depth`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={fill} x1="14" y1="10" x2="86" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#efe9ff" />
          <stop offset="0.4" stopColor="#9b76ff" />
          <stop offset="0.75" stopColor="#6a3af0" />
          <stop offset="1" stopColor="#3b1a9e" />
        </linearGradient>
        <linearGradient id={depth} x1="40" y1="24" x2="74" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2a1370" stopOpacity="0.55" />
          <stop offset="1" stopColor="#2a1370" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Ring: outer circle minus an off-center hole. */}
      <path
        fillRule="evenodd"
        fill={`url(#${fill})`}
        d="M50 8a42 42 0 1 0 0 84a42 42 0 1 0 0-84ZM58 22a22 22 0 1 1 0 44a22 22 0 1 1 0-44Z"
      />
      {/* Inner rim shading gives the band its depth. */}
      <circle cx="58" cy="44" r="22" fill="none" stroke={`url(#${depth})`} strokeWidth="5" />
      {/* Sheen on the wide, lighter side. */}
      <path d="M22 66a32 32 0 0 1 4-36" fill="none" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** AIgency.x wordmark: the ring mark + name with a purple ".x". */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-heading text-lg font-semibold tracking-tight text-[var(--color-ink)] ${className}`}>
      <LogoMark size={26} />
      <span>
        AIgency<span className="text-[var(--color-primary)]">.x</span>
      </span>
    </span>
  );
}
