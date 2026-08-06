"use client";

import { useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

/**
 * The logo draw stops being decoration and becomes the progress bar: stroke length
 * is bound to real load percentage, so the mark completing and the site being ready
 * are the same event.
 */
export default function LoadStrokeDraw({ replayKey }: DemoProps) {
  const holder = useRef<HTMLDivElement>(null);
  const shutterTop = useRef<HTMLDivElement>(null);
  const shutterBottom = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // No initial reset needed: Replay remounts this via LabShell's key, so
    // useState already starts from zero.
    let cancelled = false;

    const run = async () => {
      const svg = await fetch("/toad.svg").then((r) => r.text());
      if (cancelled || !holder.current) return;

      holder.current.innerHTML = svg;
      const node = holder.current.querySelector("svg");
      if (!node) return;

      node.setAttribute("width", "100%");
      node.setAttribute("height", "100%");
      node.removeAttribute("style");

      const shapes = Array.from(
        node.querySelectorAll<SVGGeometryElement>("path, polygon, circle, ellipse, line, rect")
      );

      shapes.forEach((shape) => {
        shape.setAttribute("fill", "none");
        shape.setAttribute("stroke", "#bef264");
        shape.setAttribute("stroke-width", "1.4");
        shape.setAttribute("stroke-linecap", "round");
        shape.setAttribute("vector-effect", "non-scaling-stroke");
      });

      gsap.set(shapes, { drawSVG: "0%" });

      const reduced = prefersReducedMotion();
      const state = { value: 0 };

      // A real preloader would take this from asset bytes; the point being demonstrated
      // is the binding itself, so the lab drives it with a deterministic ramp.
      gsap.to(state, {
        value: 100,
        duration: reduced ? 0.8 : 2.6,
        ease: "power1.inOut",
        onUpdate: () => {
          if (cancelled) return;
          setPercent(Math.round(state.value));
          gsap.set(shapes, { drawSVG: `0% ${state.value}%` });
        },
        onComplete: () => {
          if (cancelled) return;
          const tl = gsap.timeline();
          tl.to(shapes, {
            fill: "#f4fbe8",
            stroke: "#f4fbe8",
            duration: reduced ? 0.2 : 0.55,
            ease: "power2.out",
            stagger: { each: 0.006, from: "random" },
          });
          tl.to(shutterTop.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "+=0.15");
          tl.to(shutterBottom.current, { yPercent: 100, duration: 0.9, ease: "expo.inOut" }, "<");
          tl.add(() => setDone(true), "<0.3");
        },
      });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [replayKey]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
          Toad Creatives
        </p>
        <h2
          className={`${displayFont.className} mt-5 max-w-2xl text-center text-[clamp(1.6rem,4vw,3rem)] font-semibold leading-tight tracking-tight text-white`}
        >
          One person. Whole stack.
        </h2>
        <p className="mt-4 text-sm text-neutral-500">
          {done ? "Handed off to the hero" : "Revealed behind the shutters"}
        </p>
      </div>

      <div
        ref={shutterTop}
        className="absolute inset-x-0 top-0 z-20 flex h-1/2 items-end justify-center overflow-hidden bg-[#070807]"
      >
        <div className="h-[46vh] max-h-[300px] w-full max-w-[420px] translate-y-1/2 px-8">
          <div ref={holder} className="h-full w-full" />
        </div>
      </div>

      <div
        ref={shutterBottom}
        className="absolute inset-x-0 bottom-0 z-20 flex h-1/2 items-start justify-center bg-[#070807]"
      >
        <p
          className={`${displayFont.className} mt-10 text-4xl font-semibold tabular-nums text-lime-300`}
        >
          {String(percent).padStart(3, "0")}
        </p>
      </div>
    </div>
  );
}
