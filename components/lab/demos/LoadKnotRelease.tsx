"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

/** Real assets, measured for real. No fake timer. */
const ASSETS = ["/toad.svg", "/assets/projects/Work-Coast67.png", "/assets/projects/Work-B48.png"];

const STRAND_COUNT = 14;

export default function LoadKnotRelease({ replayKey }: DemoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);
  const [released, setReleased] = useState(false);
  const knot = useRef({ tightness: 1, release: 0 });

  // Byte-accurate progress: stream each asset and count what actually arrives.
  useEffect(() => {
    let cancelled = false;
    knot.current.tightness = 1;
    knot.current.release = 0;
    setPercent(0);
    setReleased(false);

    const run = async () => {
      const sizes = await Promise.all(
        ASSETS.map(async (url) => {
          try {
            const head = await fetch(url, { method: "HEAD", cache: "no-store" });
            return Number(head.headers.get("content-length") ?? 0);
          } catch {
            return 0;
          }
        })
      );

      const total = sizes.reduce((a, b) => a + b, 0) || 1;
      let loaded = 0;

      for (const url of ASSETS) {
        if (cancelled) return;
        try {
          const response = await fetch(url, { cache: "no-store" });
          const reader = response.body?.getReader();
          if (!reader) continue;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            loaded += value?.length ?? 0;
            if (!cancelled) setPercent(Math.min(99, Math.round((loaded / total) * 100)));
          }
        } catch {
          // A failed asset must not strand the loader at 40%.
          loaded += 0;
        }
      }

      if (cancelled) return;
      setPercent(100);

      const reduced = prefersReducedMotion();
      const tl = gsap.timeline({ delay: 0.25 });
      tl.to(knot.current, { tightness: 0, duration: reduced ? 0.3 : 1.1, ease: "expo.out" }, 0);
      tl.to(knot.current, { release: 1, duration: reduced ? 0.3 : 1.3, ease: "expo.out" }, 0);
      tl.add(() => setReleased(true), reduced ? 0.15 : 0.35);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [replayKey]);

  useEffect(() => {
    if (!released) return;
    const el = hero.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-item]",
        { autoAlpha: 0, y: reduced ? 0 : 34, filter: reduced ? "blur(0px)" : "blur(10px)" },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: reduced ? 0.3 : 1,
          ease: "expo.out",
          stagger: 0.09,
        }
      );
    }, el);
    return () => ctx.revert();
  }, [released]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

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
      phase: (i / STRAND_COUNT) * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.7,
      spread: 0.6 + Math.random() * 0.9,
      hue: i % 3,
      escape: (Math.random() - 0.5) * 2,
    }));
    const colors = ["rgba(190,242,100,", "rgba(123,178,55,", "rgba(245,255,235,"];

    let time = 0;
    let frame = 0;

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const cx = width / 2;
      const cy = height / 2;
      const { tightness, release } = knot.current;
      time += 0.016;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      strands.forEach((strand) => {
        ctx.beginPath();
        const knotRadius = Math.min(width, height) * 0.09 * strand.spread;
        const outRadius = Math.max(width, height) * 0.85;

        for (let s = 0; s <= 60; s++) {
          const t = s / 60;
          const angle = t * Math.PI * 6 + strand.phase + time * strand.speed;
          // Braided knot when tight, unravelling outward as release climbs.
          const r =
            knotRadius * (0.6 + Math.sin(t * Math.PI * 3 + time) * 0.4) * tightness +
            outRadius * release * t * (0.4 + strand.spread * 0.5);
          const x = cx + Math.cos(angle + strand.escape * release * 2) * r;
          const y = cy + Math.sin(angle * 1.3 + strand.escape * release) * r * 0.62;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const alpha = 0.5 * (1 - release * 0.55);
        ctx.strokeStyle = `${colors[strand.hue]}${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.4 + tightness * 1.6;
        ctx.shadowBlur = 18;
        ctx.shadowColor = `${colors[strand.hue]}0.8)`;
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
  }, [replayKey]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050505]">
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500"
        style={{ opacity: released ? 0 : 1 }}
      >
        <p
          className={`${displayFont.className} text-[clamp(3rem,10vw,7rem)] font-semibold tabular-nums tracking-tight text-white`}
        >
          {String(percent).padStart(3, "0")}
        </p>
        <p className="mt-2 font-mono text-[0.58rem] uppercase tracking-[0.3em] text-lime-300">
          Loading real bytes
        </p>
      </div>

      <div
        ref={hero}
        className="absolute inset-0 flex flex-col items-center justify-center px-8"
        style={{ visibility: released ? "visible" : "hidden" }}
      >
        <div data-hero-item className="relative h-20 w-52 sm:h-28 sm:w-72">
          <Image src="/toad.svg" alt="Toad Creatives" fill priority className="object-contain" />
        </div>
        <h2
          data-hero-item
          className={`${displayFont.className} mt-6 text-center text-[clamp(1.1rem,2.6vw,1.9rem)] font-semibold tracking-tight text-white`}
        >
          Websites, apps and AI systems — built end to end
        </h2>
      </div>
    </div>
  );
}
