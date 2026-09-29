"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Bot, LayoutTemplate, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";

const icons = [LayoutTemplate, Bot, TrendingUp];

export function ValueProps() {
  const t = useTranslations("valueProps");
  const reduce = useReducedMotion();
  const items = t.raw("items") as { title: string; text: string }[];

  return (
    <section className="pb-20 md:pb-28">
      <Container>
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          {items.map((item, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={item.title}
                initial={reduce ? undefined : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              >
                {/* Line that draws itself as the column comes into view. */}
                <div className="relative mb-6 h-px bg-black/10">
                  <motion.span
                    className="absolute inset-y-0 left-0 origin-left bg-[var(--color-primary)]"
                    style={{ width: "100%" }}
                    initial={reduce ? undefined : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <Icon size={22} className="text-[var(--color-primary)]" />
                <h3 className="mt-4 text-2xl font-medium tracking-tight text-[var(--color-ink)]">{item.title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-[var(--color-muted)]">{item.text}</p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
