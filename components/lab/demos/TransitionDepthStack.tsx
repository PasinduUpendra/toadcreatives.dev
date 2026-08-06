"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

const PANELS = [
  { eyebrow: "01 — Intro", title: "One person. Whole stack.", tint: "#0a0c08" },
  { eyebrow: "02 — About", title: "Specs first, then code.", tint: "#080b0c" },
  { eyebrow: "03 — Work", title: "Three builds, start to ship.", tint: "#0c0908" },
];

export default function TransitionDepthStack({ replayKey }: DemoProps) {
  const [index, setIndex] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const go = useCallback(
    (direction: 1 | -1) => {
      if (busy.current) return;
      const next = index + direction;
      if (next < 0 || next >= PANELS.length) return;

      const outgoing = stage.current?.querySelector<HTMLElement>(`[data-panel="${index}"]`);
      const incoming = stage.current?.querySelector<HTMLElement>(`[data-panel="${next}"]`);
      if (!outgoing || !incoming) return;

      busy.current = true;
      const reduced = prefersReducedMotion();
      const d = reduced ? 0.25 : 1.05;

      gsap.set(incoming, { visibility: "visible", zIndex: 2 });
      gsap.set(outgoing, { zIndex: 1 });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(outgoing, { visibility: "hidden" });
          busy.current = false;
          setIndex(next);
        },
      });

      // Outgoing recedes into depth rather than fading in place.
      tl.to(
        outgoing,
        {
          z: reduced ? 0 : -420,
          scale: reduced ? 1 : 0.86,
          autoAlpha: 0,
          filter: reduced ? "blur(0px)" : "blur(9px)",
          duration: d,
          ease: "expo.inOut",
        },
        0
      );

      // Incoming rises with a counter-parallax on its own contents.
      tl.fromTo(
        incoming,
        { yPercent: direction * 55, z: -120, autoAlpha: 0, scale: 0.96 },
        { yPercent: 0, z: 0, autoAlpha: 1, scale: 1, duration: d, ease: "expo.inOut" },
        0
      );

      tl.fromTo(
        incoming.querySelectorAll("[data-parallax]"),
        { yPercent: direction * 40 },
        { yPercent: 0, duration: d * 1.1, ease: "expo.out", stagger: 0.06 },
        0.05
      );

      return () => tl.kill();
    },
    [index]
  );

  useEffect(() => {
    // Index resets on its own — Replay remounts this via LabShell's key. The
    // panels still need syncing imperatively because GSAP owns their transforms.
    const panels = stage.current?.querySelectorAll<HTMLElement>("[data-panel]");
    panels?.forEach((panel, i) => {
      gsap.set(panel, {
        visibility: i === 0 ? "visible" : "hidden",
        autoAlpha: i === 0 ? 1 : 0,
        yPercent: 0,
        z: 0,
        scale: 1,
        filter: "blur(0px)",
      });
    });
    busy.current = false;
  }, [replayKey]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let lock = 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const now = Date.now();
      if (now - lock < 900 || Math.abs(event.deltaY) < 8) return;
      lock = now;
      go(event.deltaY > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={stage}
        className="relative h-full w-full"
        style={{ perspective: "1400px", transformStyle: "preserve-3d" }}
      >
        {PANELS.map((panel, i) => (
          <section
            key={panel.eyebrow}
            data-panel={i}
            className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16"
            style={{ background: panel.tint, transformStyle: "preserve-3d" }}
          >
            <p
              data-parallax
              className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300"
            >
              {panel.eyebrow}
            </p>
            <h2
              data-parallax
              className={`${displayFont.className} mt-5 max-w-3xl text-[clamp(2rem,5.5vw,4.2rem)] font-semibold leading-[1] tracking-tight text-white`}
            >
              {panel.title}
            </h2>
            <p data-parallax className="mt-6 max-w-md text-neutral-400">
              Scroll inside the frame, or use the arrows.
            </p>
          </section>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="rounded-full border border-white/20 px-4 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-neutral-300 disabled:opacity-30"
        >
          Prev
        </button>
        <span className="font-mono text-[0.58rem] text-neutral-500">
          {index + 1} / {PANELS.length}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index === PANELS.length - 1}
          className="rounded-full border border-lime-300/40 bg-lime-300/10 px-4 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-lime-200 disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
