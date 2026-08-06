"use client";

import { useEffect, useRef } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, SplitText, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

const HEADING = "How I work";
const BODY = [
  "Specifications first, then code. The architecture, the trade-offs and the unknowns get written down before anything gets built.",
  "Mobile and performance are constraints from day one, not a pass at the end.",
];

export default function TextMaskLines({ replayKey }: DemoProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const paragraphs = gsap.utils.toArray<HTMLElement>("[data-mask-para]");
      const tl = gsap.timeline({ delay: 0.1 });

      tl.fromTo(
        "[data-eyebrow]",
        { autoAlpha: 0, x: -12 },
        { autoAlpha: 1, x: 0, duration: 0.6, ease: "power3.out" }
      );

      paragraphs.forEach((para, i) => {
        const split = SplitText.create(para, { type: "lines", mask: "lines", autoSplit: true });
        const rules = para.parentElement?.querySelectorAll<HTMLElement>("[data-rule]");

        tl.fromTo(
          split.lines,
          { yPercent: reduced ? 0 : 110, autoAlpha: reduced ? 0 : 1 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: reduced ? 0.3 : 1.1,
            ease: "expo.out",
            stagger: 0.09,
          },
          i === 0 ? "-=0.25" : "-=0.75"
        );

        if (rules?.length) {
          tl.fromTo(
            rules,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.8, ease: "expo.out", stagger: 0.09, transformOrigin: "left" },
            "<0.12"
          );
        }
      });
    }, el);

    return () => ctx.revert();
  }, [replayKey]);

  return (
    <div ref={root} className="flex h-full w-full flex-col justify-center px-8 sm:px-14">
      <p
        data-eyebrow
        className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300"
      >
        02 — Process
      </p>

      <h2
        className={`${displayFont.className} mt-5 text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-none tracking-tight text-white`}
      >
        {HEADING}
      </h2>

      <div className="mt-8 max-w-2xl space-y-6">
        {BODY.map((text, i) => (
          <div key={i} className="relative">
            <p
              data-mask-para
              className="text-[1.05rem] leading-relaxed text-neutral-300"
            >
              {text}
            </p>
            <span
              data-rule
              aria-hidden="true"
              className="mt-3 block h-px w-full origin-left bg-gradient-to-r from-lime-300/70 via-lime-300/20 to-transparent"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
