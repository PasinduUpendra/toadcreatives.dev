"use client";

import { useEffect, useRef } from "react";
import { displayFont } from "@/app/fonts";
import { prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

const HEADLINE = "Built end to end";
const MIN_WEIGHT = 250;
const MAX_WEIGHT = 800;
/** How far the cursor's influence reaches, in multiples of a character's width. */
const FALLOFF = 3.2;

export default function TextWeightWave({ replayKey }: DemoProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const chars = Array.from(el.querySelectorAll<HTMLElement>("[data-wave-char]"));
    if (!chars.length) return;

    const weights = new Float32Array(chars.length).fill(MIN_WEIGHT);
    const pointer = { x: -9999, active: false };
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    const tick = () => {
      const rect = el.getBoundingClientRect();

      chars.forEach((char, i) => {
        const box = char.getBoundingClientRect();
        const centre = box.left - rect.left + box.width / 2;
        const reach = Math.max(box.width, 12) * FALLOFF;
        const distance = Math.abs(centre - pointer.x);

        // Gaussian falloff reads more like a swell than a linear ramp does.
        const influence = pointer.active ? Math.exp(-(distance * distance) / (2 * reach * reach)) : 0;
        const target = MIN_WEIGHT + (MAX_WEIGHT - MIN_WEIGHT) * influence;

        weights[i] += (target - weights[i]) * 0.16;
        char.style.fontVariationSettings = `"wght" ${weights[i].toFixed(0)}`;
      });

      frame = requestAnimationFrame(tick);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [replayKey]);

  return (
    <div
      ref={root}
      className="flex h-full w-full cursor-crosshair flex-col justify-center px-8 sm:px-14"
    >
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
        Move your cursor across the headline
      </p>

      <h2
        aria-label={HEADLINE}
        className={`${displayFont.className} mt-6 text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.95] tracking-tight text-white`}
      >
        <span aria-hidden="true">
          {HEADLINE.split("").map((char, i) => (
            <span
              key={i}
              data-wave-char
              style={{
                display: "inline-block",
                fontVariationSettings: `"wght" ${MIN_WEIGHT}`,
                whiteSpace: "pre",
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </h2>

      <p className="mt-8 max-w-lg text-[1.05rem] leading-relaxed text-neutral-400">
        Nothing moves. The letters just thicken where you are, along the font&apos;s weight axis.
      </p>
    </div>
  );
}
