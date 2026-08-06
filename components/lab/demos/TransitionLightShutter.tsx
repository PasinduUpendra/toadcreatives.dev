"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

const PANELS = [
  { eyebrow: "01 — Intro", title: "One person. Whole stack." },
  { eyebrow: "02 — About", title: "Specs first, then code." },
  { eyebrow: "03 — Work", title: "Three builds, start to ship." },
];

const STRAND_COUNT = 26;

/**
 * Light-band wipe. The strands idle as loose horizontal filaments, gather into a
 * tight band on transition, sweep across, then relax again — so the site's
 * signature element performs the section change instead of a crossfade.
 */
function useShutterCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const state = useRef({ gather: 0, sweep: 0, time: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let frame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const strands = Array.from({ length: STRAND_COUNT }, (_, i) => ({
      offset: i / STRAND_COUNT,
      phase: Math.random() * Math.PI * 2,
      speed: 0.25 + Math.random() * 0.5,
      amp: 18 + Math.random() * 46,
      hue: i % 3,
    }));

    const colors = ["rgba(190,242,100,", "rgba(123,178,55,", "rgba(240,255,220,"];

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const s = state.current;
      s.time += 0.016;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      strands.forEach((strand) => {
        const idleY = height * (0.15 + strand.offset * 0.7);
        const bandY = height * 0.5;
        const y = idleY + (bandY - idleY) * s.gather;
        const amp = strand.amp * (1 - s.gather * 0.86);

        ctx.beginPath();
        for (let x = 0; x <= width; x += 8) {
          const t = x / width;
          const wobble = Math.sin(t * Math.PI * 2.2 + s.time * strand.speed + strand.phase) * amp;
          // The sweep pinches the band into a travelling crest.
          const crest = s.sweep > 0 ? Math.exp(-Math.pow((t - s.sweep) * 3.2, 2)) : 0;
          const py = y + wobble * (1 - crest * 0.8) - crest * 26 * s.gather;
          if (x === 0) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }

        const alpha = 0.06 + s.gather * 0.42;
        ctx.strokeStyle = `${colors[strand.hue]}${alpha.toFixed(3)})`;
        ctx.lineWidth = 1 + s.gather * 2.4;
        ctx.shadowBlur = 10 + s.gather * 26;
        ctx.shadowColor = `${colors[strand.hue]}0.65)`;
        ctx.stroke();
      });

      ctx.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [canvasRef]);

  // Exposed as a method so callers never reach in and write to `state.current`
  // themselves. The hook owns its own state; consumers only ask it to reset.
  const reset = useCallback(() => {
    state.current.gather = 0;
    state.current.sweep = 0;
  }, []);

  return { state, reset };
}

export default function TransitionLightShutter({ replayKey }: DemoProps) {
  const [index, setIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const { state: shutter, reset: resetShutter } = useShutterCanvas(canvasRef);

  const go = useCallback(
    (direction: 1 | -1) => {
      if (busy.current) return;
      const next = index + direction;
      if (next < 0 || next >= PANELS.length) return;

      busy.current = true;
      const reduced = prefersReducedMotion();
      const outgoing = stage.current?.querySelector<HTMLElement>(`[data-panel="${index}"]`);
      const incoming = stage.current?.querySelector<HTMLElement>(`[data-panel="${next}"]`);

      const s = shutter.current;
      const tl = gsap.timeline({
        onComplete: () => {
          busy.current = false;
          setIndex(next);
        },
      });

      tl.to(s, { gather: 1, duration: reduced ? 0.15 : 0.42, ease: "power2.in" }, 0);
      tl.fromTo(s, { sweep: 0 }, { sweep: 1, duration: reduced ? 0.25 : 0.85, ease: "power2.inOut" }, 0.18);
      tl.to(s, { gather: 0, duration: 0.55, ease: "power2.out" }, 0.78);

      if (outgoing && incoming) {
        gsap.set(incoming, { visibility: "visible", zIndex: 2 });
        gsap.set(outgoing, { zIndex: 1 });
        // The crest is what uncovers the incoming panel, so the clip tracks the sweep.
        tl.fromTo(
          incoming,
          { clipPath: "inset(0% 100% 0% 0%)", autoAlpha: 1 },
          { clipPath: "inset(0% 0% 0% 0%)", duration: reduced ? 0.25 : 0.85, ease: "power2.inOut" },
          0.18
        );
        tl.to(outgoing, { autoAlpha: 0, duration: 0.3 }, 0.75);
        tl.set(outgoing, { visibility: "hidden" });
        tl.fromTo(
          incoming.querySelectorAll("[data-rise]"),
          { yPercent: 60, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", stagger: 0.07 },
          0.55
        );
      }
    },
    // `shutter` is a ref with a stable identity, so it is not a dependency.
    [index, shutter]
  );

  useEffect(() => {
    // Index resets on its own; Replay remounts this via LabShell's key.
    busy.current = false;
    resetShutter();
    stage.current?.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel, i) => {
      gsap.set(panel, {
        visibility: i === 0 ? "visible" : "hidden",
        autoAlpha: i === 0 ? 1 : 0,
        clipPath: "inset(0% 0% 0% 0%)",
      });
    });
  }, [replayKey, resetShutter]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050505]">
      <div ref={stage} className="absolute inset-0">
        {PANELS.map((panel, i) => (
          <section
            key={panel.eyebrow}
            data-panel={i}
            className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16"
          >
            <p data-rise className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
              {panel.eyebrow}
            </p>
            <h2
              data-rise
              className={`${displayFont.className} mt-5 max-w-3xl text-[clamp(2rem,5.5vw,4.2rem)] font-semibold leading-[1] tracking-tight text-white`}
            >
              {panel.title}
            </h2>
          </section>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      />

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
          Sweep
        </button>
      </div>
    </div>
  );
}
