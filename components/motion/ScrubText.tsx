"use client";

import { useLayoutEffect, useRef, type ElementType } from "react";
import { gsap, SplitText, prefersReducedMotion } from "./gsap";

/** Unlit state — a ghost of the finished sentence, readable but clearly pending. */
export const SCRUB_DIM = "rgba(229,231,235,0.12)";
export const SCRUB_LIT = "rgb(245,245,245)";
/** The leading edge of the wave passes through the brand lime before settling. */
export const SCRUB_EDGE = "rgb(190,242,100)";

interface ScrubTextProps {
  children: string;
  as?: ElementType;
  className?: string;
  /** Pass null for a straight dim-to-white sweep with no accent. */
  edge?: string | null;
  start?: string;
  end?: string;
  /**
   * Scroll distance the sweep spans, as a fraction of the viewport. Tied to the
   * viewport rather than the heading's own height, so a two-word line and a
   * three-line paragraph both read at the same pace.
   */
  span?: number;
}

/**
 * Reveals a line of type by driving each character's colour alpha from ~0.1 to 1,
 * staggered along the sentence and scrubbed against scroll position.
 *
 * Deliberately touches only `color`: no transform, no filter, no opacity on the
 * characters. That is what makes it read as light crossing the sentence rather
 * than text flying in, and it keeps the work off the compositor while a WebGL
 * canvas is already running behind it.
 */
export default function ScrubText({
  children,
  as = "p",
  className = "",
  edge = SCRUB_EDGE,
  start = "top 78%",
  end,
  span = 0.9,
}: ScrubTextProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { color: SCRUB_LIT });
      return;
    }

    let split: SplitText | undefined;

    const ctx = gsap.context(() => {
      // autoSplit re-runs onSplit when webfonts finish loading, so the wave is
      // never measured against fallback glyph widths. aria defaults to "auto",
      // which keeps the whole sentence on the element as an aria-label and marks
      // the fragments aria-hidden — screen readers hear a sentence, not letters.
      split = SplitText.create(el, {
        type: "words,chars",
        charsClass: "scrub-char",
        autoSplit: true,
        onSplit(self) {
          gsap.set(self.chars, { color: SCRUB_DIM });
          // Returning the animation lets SplitText revert and rebuild it across
          // re-splits instead of leaving orphaned tweens behind.
          return gsap.to(self.chars, {
            keyframes: edge
              ? [
                  { color: edge, duration: 0.35 },
                  { color: SCRUB_LIT, duration: 0.65 },
                ]
              : [{ color: SCRUB_LIT, duration: 1 }],
            ease: "none",
            stagger: { amount: 0.9 },
            scrollTrigger: {
              trigger: el,
              start,
              end: end ?? (() => `+=${window.innerHeight * span}`),
              scrub: 0.6,
            },
          });
        },
      });
    }, el);

    return () => {
      // Kill the tweens before restoring the markup, or the last frame writes
      // to nodes that no longer exist.
      ctx.revert();
      split?.revert();
    };
  }, [children, edge, start, end, span]);

  const Tag = as;
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
