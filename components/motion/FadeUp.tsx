"use client";

import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap, prefersReducedMotion } from "./gsap";

interface FadeUpProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Distance travelled, in px. */
  distance?: number;
  /** Seconds between children when `stagger` targets are present. */
  stagger?: number;
  /**
   * Selector for children to animate individually. Omit to animate the wrapper
   * as a single unit.
   */
  items?: string;
  start?: string;
  delay?: number;
}

/**
 * The workhorse reveal: translate up, fade in, once, on entry.
 *
 * Uses `fromTo` rather than `from` so a re-run can never inherit a half-finished
 * value as its destination — the failure that left the case study rendering at
 * 3% opacity.
 */
export default function FadeUp({
  children,
  as: Tag = "div",
  className = "",
  distance = 24,
  stagger = 0.08,
  items,
  start = "top 85%",
  delay = 0,
}: FadeUpProps) {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const targets = items
        ? gsap.utils.toArray<HTMLElement>(items, el)
        : [el as HTMLElement];
      if (!targets.length) return;

      gsap.fromTo(
        targets,
        { y: distance, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power2.out",
          stagger: items ? stagger : 0,
          delay,
          scrollTrigger: { trigger: el, start },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [distance, stagger, items, start, delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
