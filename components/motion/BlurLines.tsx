"use client";

import { useLayoutEffect, useRef, type ElementType } from "react";
import { gsap, SplitText, prefersReducedMotion } from "./gsap";

interface BlurLinesProps {
  children: string;
  as?: ElementType;
  className?: string;
  /** Starting blur radius in px. Measured off trionn.com's label reveal: 12. */
  blur?: number;
  start?: string;
}

/**
 * Lines resolving out of a blur — the calmer counterpart to ScrubText.
 *
 * ScrubText binds to scroll position and suits a single long statement.
 * This plays once on entry and suits supporting copy, where a scrubbed reveal
 * would make the reader work for text that is not the point.
 */
export default function BlurLines({
  children,
  as: Tag = "p",
  className = "",
  blur = 12,
  start = "top 85%",
}: BlurLinesProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, filter: "none" });
      return;
    }

    let split: SplitText | undefined;

    const ctx = gsap.context(() => {
      // autoSplit re-runs onSplit once webfonts land, so lines are never
      // measured against fallback metrics and then left wrongly broken.
      split = SplitText.create(el, {
        type: "lines",
        linesClass: "blur-line",
        autoSplit: true,
        mask: "lines",
        onSplit(self) {
          return gsap.fromTo(
            self.lines,
            { autoAlpha: 0, filter: `blur(${blur}px)`, y: 12 },
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              y: 0,
              duration: 0.9,
              stagger: 0.09,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start },
              // Filter animation is expensive; promote for the tween only and
              // drop the layer once it lands.
              onComplete: () => {
                gsap.set(self.lines, { clearProps: "filter,willChange" });
              },
            },
          );
        },
      });
    }, el);

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [children, blur, start]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
