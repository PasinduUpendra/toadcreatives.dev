"use client";

import { useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { labProjects } from "./workData";
import type { DemoProps } from "../registry";

export default function WorkMarqueeRail({ replayKey }: DemoProps) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;

    // Two identical halves; translating by -50% and wrapping gives a seamless loop
    // without measuring anything.
    const tween = gsap.to(el, {
      xPercent: -50,
      duration: 26,
      ease: "none",
      repeat: -1,
    });

    const slow = () => gsap.to(tween, { timeScale: 0.25, duration: 0.6, ease: "power2.out" });
    const resume = () => gsap.to(tween, { timeScale: 1, duration: 0.8, ease: "power2.out" });

    el.addEventListener("pointerenter", slow);
    el.addEventListener("pointerleave", resume);

    return () => {
      el.removeEventListener("pointerenter", slow);
      el.removeEventListener("pointerleave", resume);
      tween.kill();
    };
  }, [replayKey]);

  const rows = [...labProjects, ...labProjects];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050505]">
      {labProjects.map((project, i) => (
        <div
          key={project.id}
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${project.cover})`,
            opacity: active === i ? 0.42 : 0,
            transform: active === i ? "scale(1.06)" : "scale(1.14)",
            filter: active === i ? "grayscale(0.15) blur(0px)" : "grayscale(1) blur(14px)",
            transition:
              "opacity 700ms cubic-bezier(0.19,1,0.22,1), transform 1200ms cubic-bezier(0.19,1,0.22,1), filter 700ms cubic-bezier(0.19,1,0.22,1)",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />

      <div className="relative flex h-full flex-col justify-center">
        <p className="px-6 font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300 sm:px-12">
          Selected work — hover a name
        </p>

        <div className="mt-8 overflow-hidden">
          <div ref={track} className="flex w-max items-center gap-10 will-change-transform">
            {rows.map((project, i) => {
              const index = i % labProjects.length;
              const isActive = active === index;
              return (
                <button
                  key={`${project.id}-${i}`}
                  type="button"
                  onPointerEnter={() => setActive(index)}
                  onPointerLeave={() => setActive(null)}
                  className="flex shrink-0 items-baseline gap-5"
                >
                  <span
                    className={`${displayFont.className} whitespace-nowrap text-[clamp(2.4rem,7vw,5.5rem)] font-semibold tracking-tight transition-all duration-500`}
                    style={{
                      color: isActive ? "#ffffff" : "transparent",
                      WebkitTextStroke: isActive ? "0px" : "1px rgba(255,255,255,0.35)",
                    }}
                  >
                    {project.name}
                  </span>
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-lime-300/70">
                    {project.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-8 h-6 px-6 text-sm text-neutral-400 transition-opacity duration-300 sm:px-12">
          {active !== null ? labProjects[active].category : ""}
        </p>
      </div>
    </div>
  );
}
