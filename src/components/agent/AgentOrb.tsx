"use client";

import { motion, useReducedMotion } from "motion/react";
import { LogoMark } from "@/components/ui/Logo";

/**
 * AIgency's agent avatar: the brand ring mark brought to life with motion —
 * a slow turn and gentle breathing at rest, and a quick pop when `pulse` is
 * on. Degrades to the still mark under prefers-reduced-motion.
 */
export function AgentOrb({
  size = 200,
  pulse = false,
  label = "AIgency",
  className = "",
}: {
  size?: number;
  /** Kept for API compatibility; the ring doesn't tilt. */
  tilt?: { x: number; y: number };
  pulse?: boolean;
  label?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} role="img" aria-label={label}>
      {/* Soft glow behind the ring on larger sizes. */}
      {size >= 48 ? (
        <div
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full bg-[var(--color-primary)] opacity-25 blur-2xl"
        />
      ) : null}
      <motion.div
        className="relative h-full w-full"
        animate={
          reduce
            ? undefined
            : pulse
              ? { scale: [1, 1.1, 1], rotate: [0, 12, 0] }
              : { scale: [1, 1.04, 1], rotate: [0, 360] }
        }
        transition={
          reduce
            ? undefined
            : pulse
              ? { duration: 0.6, ease: "easeOut" }
              : {
                  scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 24, repeat: Infinity, ease: "linear" },
                }
        }
      >
        <LogoMark size={size} className="h-full w-full" />
      </motion.div>
    </div>
  );
}
