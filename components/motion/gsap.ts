"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

// Registering twice is harmless, but this keeps the call in one place so plugin
// availability is never a question at a call site.
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

export const EASE = {
  expo: "expo.out",
  power: "power3.out",
  settle: "power2.inOut",
} as const;

export const DURATION = {
  fast: 0.45,
  base: 0.9,
  slow: 1.4,
} as const;

/** True when the visitor has asked for less motion. Read at call time, not import time. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin };
