"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Soft grainy mesh gradient (lilac + warm peach) that slowly drifts. Sits behind
 * hero and CTA content; the `.grain` class adds the film texture on top.
 */
export function GradientBackdrop({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const blobs = [
    { color: "rgba(124,77,255,0.32)", size: "46vw", top: "8%", left: "18%", x: [0, 60, -20, 0], y: [0, 40, -30, 0], d: 22 },
    { color: "rgba(255,160,120,0.38)", size: "40vw", top: "22%", left: "48%", x: [0, -50, 30, 0], y: [0, -30, 40, 0], d: 26 },
    { color: "rgba(255,176,32,0.18)", size: "30vw", top: "45%", left: "60%", x: [0, 40, -40, 0], y: [0, 30, 0, 0], d: 30 },
    { color: "rgba(237,231,255,0.9)", size: "36vw", top: "40%", left: "5%", x: [0, 30, 0, 0], y: [0, -40, 20, 0], d: 24 },
  ];

  return (
    <div aria-hidden="true" className={`grain pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[90px]"
          style={{ background: b.color, width: b.size, height: b.size, top: b.top, left: b.left, minWidth: 280, minHeight: 280 }}
          animate={reduce ? undefined : { x: b.x, y: b.y }}
          transition={reduce ? undefined : { duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
