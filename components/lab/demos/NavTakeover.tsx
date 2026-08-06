"use client";

import { useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, SplitText, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

const ITEMS = [
  { label: "Intro", preview: "/assets/projects/Work-Coast67.png" },
  { label: "About", preview: "/assets/projects/Work-B48.png" },
  { label: "What I do", preview: "/assets/projects/Work-EliteTapp.png" },
  { label: "Work", preview: "/assets/projects/Work-Coast67.png" },
  { label: "Contact", preview: "/assets/projects/Work-B48.png" },
];

export default function NavTakeover({ replayKey }: DemoProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const bars = useRef<HTMLDivElement>(null);

  // Open once on mount so the demo shows itself without a click.
  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), 450);
    return () => window.clearTimeout(t);
  }, [replayKey]);

  useEffect(() => {
    const top = bars.current?.querySelector("[data-bar='top']");
    const bottom = bars.current?.querySelector("[data-bar='bottom']");
    if (!top || !bottom) return;

    const d = prefersReducedMotion() ? 0.15 : 0.5;
    gsap.to(top, { y: open ? 4 : 0, rotate: open ? 45 : 0, width: 28, duration: d, ease: "power3.inOut" });
    gsap.to(bottom, { y: open ? -4 : 0, rotate: open ? -45 : 0, width: open ? 28 : 18, duration: d, ease: "power3.inOut" });
  }, [open]);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (!open) {
        gsap.to(el, { clipPath: "inset(0% 0% 0% 100%)", duration: reduced ? 0.15 : 0.6, ease: "power3.inOut" });
        return;
      }

      const tl = gsap.timeline();
      tl.fromTo(
        el,
        { clipPath: "inset(0% 0% 0% 100%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: reduced ? 0.2 : 0.85, ease: "expo.inOut" }
      );

      const links = gsap.utils.toArray<HTMLElement>("[data-nav-item]");
      links.forEach((link, i) => {
        const split = SplitText.create(link.querySelector("[data-nav-label]"), {
          type: "chars",
          mask: "chars",
        });
        tl.fromTo(
          split.chars,
          { yPercent: 110 },
          { yPercent: 0, duration: reduced ? 0.2 : 0.8, ease: "expo.out", stagger: 0.022 },
          0.28 + i * 0.06
        );
      });

      tl.fromTo(
        "[data-nav-meta]",
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 },
        0.6
      );
    }, el);

    return () => ctx.revert();
  }, [open, replayKey]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050505]">
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-neutral-700">
          Site content sits here
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="absolute top-6 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur"
      >
        <span ref={bars} className="flex flex-col items-end gap-[5px]">
          <span data-bar="top" className="block h-[1.5px] w-7 rounded-full bg-neutral-100" />
          <span data-bar="bottom" className="block h-[1.5px] w-[18px] rounded-full bg-neutral-100" />
        </span>
      </button>

      <div
        ref={panel}
        className="absolute inset-0 z-20 bg-[#070807]"
        style={{ clipPath: "inset(0% 0% 0% 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {ITEMS.map((item, i) => (
            <div
              key={item.label}
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
              style={{
                backgroundImage: `url(${item.preview})`,
                opacity: hovered === i ? 0.28 : 0,
                filter: "grayscale(1) contrast(1.15)",
                transform: hovered === i ? "scale(1.04)" : "scale(1)",
                transition: "opacity 500ms cubic-bezier(0.19,1,0.22,1), transform 900ms cubic-bezier(0.19,1,0.22,1)",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070807] via-[#070807]/70 to-transparent" />
        </div>

        <nav className="relative flex h-full flex-col justify-center gap-1 px-8 sm:px-16">
          {ITEMS.map((item, i) => (
            <button
              key={item.label}
              type="button"
              data-nav-item
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group flex w-fit items-baseline gap-5 text-left"
            >
              <span className="font-mono text-[0.6rem] text-lime-300/70">
                0{i + 1}
              </span>
              <span
                data-nav-label
                className={`${displayFont.className} text-[clamp(2rem,6vw,4.4rem)] font-semibold leading-[1.05] tracking-tight transition-colors duration-300 ${
                  hovered === i ? "text-white" : "text-neutral-500"
                }`}
              >
                {item.label}
              </span>
              {i === 1 && (
                <span className="mb-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-300" title="Current section" />
              )}
            </button>
          ))}

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-3">
            <p data-nav-meta className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-neutral-500">
              hello@toadcreatives.dev
            </p>
            <p data-nav-meta className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-neutral-500">
              Sri Lanka — available
            </p>
          </div>
        </nav>
      </div>
    </div>
  );
}
