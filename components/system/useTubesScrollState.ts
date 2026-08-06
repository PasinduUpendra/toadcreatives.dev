"use client";

import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/components/motion/gsap";

export type TubesMode = "hero" | "about" | "what" | "work" | "contact";

/**
 * Reports which section owns the viewport so the WebGL field can re-tint.
 *
 * Sections opt in by carrying `data-tube-mode`. This used to be derived from a
 * discrete step index; it now reads real scroll position, so the colour still
 * changes per section but the page underneath scrolls continuously.
 */
export function useTubesMode(): TubesMode {
  const [mode, setMode] = useState<TubesMode>("hero");

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tube-mode]")
    );

    // Midpoint boundaries: a section takes over once it owns the middle of the
    // screen, which is where the eye is, rather than when its top edge appears.
    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          const next = el.dataset.tubeMode as TubesMode | undefined;
          if (self.isActive && next) setMode(next);
        },
      })
    );

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return mode;
}
