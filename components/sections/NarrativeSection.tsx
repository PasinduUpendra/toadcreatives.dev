"use client";

import { useEffect, useRef } from "react";
import { displayFont } from "@/app/fonts";
import ScrubText from "@/components/motion/ScrubText";
import FadeUp from "@/components/motion/FadeUp";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import type { TubesMode } from "@/components/system/useTubesScrollState";

export interface NarrativeItem {
  id: string;
  label: string;
  body: string;
}

interface NarrativeSectionProps {
  id: string;
  tubeMode: TubesMode;
  eyebrow: string;
  /** The large statement, revealed by the scrubbed character sweep. */
  lead: string;
  items: NarrativeItem[];
  /** Which side the eyebrow column sits on, so consecutive sections mirror. */
  align?: "left" | "right";
}

/**
 * The shared scaffold behind About and What I Do. Both previously carried their
 * own near-identical copy of the same variants, heading split and paragraph
 * animation; this is that structure written once.
 */
export default function NarrativeSection({
  id,
  tubeMode,
  eyebrow,
  lead,
  items,
  align = "left",
}: NarrativeSectionProps) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Only the hairline rules are animated here; the copy blocks themselves
      // are handled by <FadeUp>. fromTo, so a re-run cannot inherit a partial
      // scale as its destination.
      gsap.utils.toArray<HTMLElement>("[data-rule]").forEach((rule) => {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: rule, start: "top 90%" },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [items]);

  return (
    <section
      ref={root}
      id={id}
      data-tube-mode={tubeMode}
      className="relative px-6 py-[30vh] sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <p
          className={`font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300 ${
            align === "right" ? "sm:text-right" : ""
          }`}
        >
          {eyebrow}
        </p>

        <ScrubText
          as="h2"
          className={`${displayFont.className} mt-7 max-w-4xl text-[clamp(1.6rem,3.9vw,3.1rem)] font-semibold leading-[1.14] tracking-tight ${
            align === "right" ? "sm:ml-auto sm:text-right" : ""
          }`}
        >
          {lead}
        </ScrubText>

        {/* Deliberate gap: the statement above needs scroll distance to finish
            its sweep before the supporting copy starts arriving. */}
        <FadeUp
          items="[data-item]"
          start="top 88%"
          distance={22}
          className={`mt-[32vh] grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] ${
            align === "right" ? "sm:ml-auto" : ""
          }`}
        >
          {items.map((item) => (
            <div key={item.id} data-item>
              <span
                data-rule
                aria-hidden="true"
                className="block h-px w-full origin-left bg-linear-to-r from-lime-300/70 to-transparent"
              />
              <h3 className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-neutral-400">
                {item.label}
              </h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-neutral-300">
                {item.body}
              </p>
            </div>
          ))}
        </FadeUp>
      </div>
    </section>
  );
}
