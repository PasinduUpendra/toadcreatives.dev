"use client";

import { useEffect, useRef } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/*+<>";

// Placeholder figures. These stay obviously fake until Pasindu sends the real ones.
const STATS = [
  { value: "06", unit: "years", label: "shipping for founders" },
  { value: "40+", unit: "projects", label: "designed and built" },
  { value: "24H", unit: "reply", label: "typical first response" },
];

/** Resolves a string left to right, cycling random glyphs on the unresolved tail. */
function scramble(el: HTMLElement, final: string, duration: number) {
  const state = { progress: 0 };
  return gsap.to(state, {
    progress: 1,
    duration,
    ease: "power2.inOut",
    onUpdate: () => {
      const settled = Math.floor(state.progress * final.length);
      let out = final.slice(0, settled);
      for (let i = settled; i < final.length; i++) {
        out += final[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out;
    },
    onComplete: () => {
      el.textContent = final;
    },
  });
}

export default function TextScramble({ replayKey }: DemoProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>("[data-scramble]");

      if (prefersReducedMotion()) {
        targets.forEach((t) => {
          t.textContent = t.dataset.scramble ?? "";
        });
        return;
      }

      const tl = gsap.timeline({ delay: 0.15 });
      targets.forEach((t, i) => {
        const final = t.dataset.scramble ?? "";
        tl.add(scramble(t, final, 0.85), i * 0.12);
      });

      tl.fromTo(
        "[data-stat-rule]",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, ease: "expo.out", stagger: 0.12, transformOrigin: "left" },
        0.1
      );
    }, el);

    return () => ctx.revert();
  }, [replayKey]);

  return (
    <div ref={root} className="flex h-full w-full flex-col justify-center px-8 sm:px-14">
      <p
        data-scramble="SELECTED NUMBERS"
        className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300"
      >
        SELECTED NUMBERS
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div key={stat.unit}>
            <span
              data-stat-rule
              aria-hidden="true"
              className="mb-5 block h-px w-full origin-left bg-white/20"
            />
            <p
              className={`${displayFont.className} text-[clamp(2.6rem,5vw,4rem)] font-semibold leading-none tracking-tight text-white`}
            >
              <span data-scramble={stat.value}>{stat.value}</span>
            </p>
            <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-lime-300/80">
              <span data-scramble={stat.unit.toUpperCase()}>{stat.unit.toUpperCase()}</span>
            </p>
            <p className="mt-1.5 text-sm text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="mt-12 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-amber-400/70">
        ⚠ Figures are placeholders — send me the real ones
      </p>
    </div>
  );
}
