"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/components/motion/gsap";

/**
 * Module-scoped because navigation needs to reach the scroller from anywhere
 * without threading a context through every component, and there is only ever
 * one page scroller.
 */
let lenis: Lenis | null = null;

/**
 * Scrolls to a section by id. Falls back to native smooth scrolling when Lenis
 * is not running, which is the case under prefers-reduced-motion.
 */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.2 });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Freezes the page behind an open dialog. Locking the body with `overflow:
 * hidden` instead would collapse the scrollbar and shift the layout, so the
 * scroller is simply told to stop.
 */
export function setScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  } else if (typeof document !== "undefined") {
    // Reduced-motion visitors have no Lenis instance, so fall back to the body.
    document.body.style.overflow = locked ? "hidden" : "";
  }
}

/**
 * Replaces the old step machine, which called preventDefault on every wheel
 * event and locked input for 600ms per section. The page is now a real
 * document: Lenis smooths the native scroll and is stepped by GSAP's ticker so
 * scroll position, ScrollTrigger and the WebGL field all advance on one frame.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Honour the OS setting by leaving native scrolling completely alone.
    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      // Touch devices already have good native inertia; smoothing it again
      // makes the page feel detached from the finger.
      syncTouch: false,
    });
    lenis = instance;

    const onScroll = () => ScrollTrigger.update();
    instance.on("scroll", onScroll);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Late-loading webfonts and images change section heights, which invalidates
    // every trigger's start/end.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      instance.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      window.removeEventListener("load", refresh);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
