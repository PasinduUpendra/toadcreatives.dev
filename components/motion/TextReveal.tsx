"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, prefersReducedMotion } from "./gsap";

type RevealMode = "blur" | "mask";
type SplitBy = "chars" | "words" | "lines";

interface TextRevealProps {
  children: string;
  as?: ElementType;
  mode?: RevealMode;
  splitBy?: SplitBy;
  /** Play on mount, or when the element scrolls into view. */
  trigger?: "mount" | "scroll";
  delay?: number;
  stagger?: number;
  className?: string;
  /** Replay when this value changes. Used by the lab; harmless in production. */
  replayKey?: number;
  children_?: ReactNode;
}

/**
 * The site's single text-reveal primitive.
 *
 * Accessibility note: SplitText shreds the string into one span per character,
 * which assistive tech reads out letter by letter ("A b o u t"). The original
 * string is restored as the element's accessible name and the shredded spans are
 * hidden from the tree, so the rendered text and the announced text stay in sync.
 * The un-split string is what server-rendered HTML contains, so crawlers read it too.
 */
export default function TextReveal({
  children,
  as: Tag = "span",
  mode = "blur",
  splitBy = "chars",
  trigger = "mount",
  delay = 0,
  stagger,
  className = "",
  replayKey = 0,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = prefersReducedMotion();
    const inner = el.querySelector<HTMLElement>("[data-reveal-inner]");
    if (!inner) return;

    const ctx = gsap.context(() => {
      const split = SplitText.create(inner, {
        type: splitBy === "lines" ? "lines" : `${splitBy},words,lines`,
        mask: mode === "mask" ? (splitBy === "chars" ? "chars" : "lines") : undefined,
        autoSplit: true,
        onSplit: (self) => {
          const targets = self[splitBy];
          if (!targets?.length) return;

          // Reduced motion still gets a reveal, just a shorter, calmer one.
          if (reduced) {
            return gsap.fromTo(
              targets,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.3, stagger: 0.01, delay }
            );
          }

          const from =
            mode === "blur"
              ? { autoAlpha: 0, filter: "blur(12px)", yPercent: 20 }
              : { yPercent: 110 };

          const to =
            mode === "blur"
              ? {
                  autoAlpha: 1,
                  filter: "blur(0px)",
                  yPercent: 0,
                  duration: 0.9,
                  ease: "power3.out",
                  stagger: { each: stagger ?? 0.02, from: "random" as const },
                }
              : {
                  yPercent: 0,
                  duration: 1.1,
                  ease: "expo.out",
                  stagger: stagger ?? 0.08,
                };

          return gsap.fromTo(targets, from, {
            ...to,
            delay,
            // Promote only while animating; a permanent filter layer per character
            // is what makes this pattern expensive.
            willChange: mode === "blur" ? "filter, opacity, transform" : "transform",
            onComplete: () => {
              gsap.set(targets, { willChange: "auto", clearProps: "filter" });
            },
            scrollTrigger:
              trigger === "scroll"
                ? { trigger: el, start: "top 80%", once: true }
                : undefined,
          });
        },
      });

      return () => split.revert();
    }, el);

    return () => ctx.revert();
  }, [children, mode, splitBy, trigger, delay, stagger, replayKey]);

  return (
    <Tag ref={ref} className={className} aria-label={children}>
      <span data-reveal-inner aria-hidden="true" style={{ display: "inline-block" }}>
        {children}
      </span>
    </Tag>
  );
}
