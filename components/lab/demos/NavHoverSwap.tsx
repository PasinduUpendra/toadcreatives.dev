"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

type Variant = "toad" | "trionn" | "current";

const ITEMS = ["Work", "About", "Services", "Contact"];

/** Measured off trionn.com: the outgoing layer dissolves to a 5px blur. */
const BLUR_OUT = 5;
const EDGE = "rgb(190,242,100)";

interface SwapLinkProps {
  label: string;
  variant: Variant;
  large?: boolean;
}

/**
 * Two stacked copies of the same word. On hover the visible copy dissolves
 * character by character while the hidden copy resolves in behind it, so the
 * word is replaced rather than moved. Nothing here touches layout — only
 * `filter` and `opacity` — which is why it stays smooth over a live WebGL canvas.
 */
function SwapLink({ label, variant, large = false }: SwapLinkProps) {
  const root = useRef<HTMLButtonElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || variant === "current" || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const out = gsap.utils.toArray<HTMLElement>("[data-layer='out'] [data-char]");
      const inc = gsap.utils.toArray<HTMLElement>("[data-layer='in'] [data-char]");

      gsap.set(out, { autoAlpha: 1, filter: "blur(0px)" });
      gsap.set(inc, {
        autoAlpha: 0,
        filter: "blur(0px)",
        color: variant === "toad" ? EDGE : "inherit",
      });

      tl.current = gsap
        .timeline({ paused: true })
        .to(out, {
          autoAlpha: 0,
          filter: `blur(${BLUR_OUT}px)`,
          duration: 0.2,
          ease: "power2.in",
          stagger: { amount: 0.1 },
        })
        .to(
          inc,
          {
            autoAlpha: 1,
            duration: 0.3,
            ease: "power2.out",
            stagger: { amount: 0.14 },
          },
          0.18
        );

      if (variant === "toad") {
        // Toad's addition: the replacement word lands in the brand lime and
        // cools to white, so the swap reads as a signal rather than a flicker.
        tl.current.to(
          inc,
          { color: "rgb(245,245,245)", duration: 0.45, ease: "power2.out" },
          0.34
        );
      }
    }, el);

    return () => {
      ctx.revert();
      tl.current = null;
    };
  }, [variant, label]);

  const enter = useCallback(() => tl.current?.play(), []);
  const leave = useCallback(() => tl.current?.reverse(), []);

  const size = large
    ? "text-3xl sm:text-4xl"
    : "text-[0.72rem] uppercase tracking-[0.2em]";

  if (variant === "current") {
    // Reproduced from MenuOverlay.tsx as it stands today: opacity nudge,
    // a 2px lift and a gradient rule wiping in.
    return (
      <button
        type="button"
        className={`${large ? displayFont.className : ""} group relative ${size} font-light text-neutral-200`}
      >
        <span className="relative inline-block">
          <span className="inline-block opacity-80 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:text-white group-hover:opacity-100">
            {label}
          </span>
          <span className="pointer-events-none absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-linear-to-r from-lime-300/0 via-lime-300 to-lime-300/0 transition-transform duration-300 group-hover:scale-x-100" />
        </span>
      </button>
    );
  }

  return (
    <button
      ref={root}
      type="button"
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      aria-label={label}
      className={`${large ? displayFont.className : ""} relative inline-flex ${size} font-light text-neutral-200 outline-none focus-visible:ring-1 focus-visible:ring-lime-300/60`}
    >
      {/* Only the outgoing layer occupies space; the incoming copy is overlaid,
          so the two can never disagree about width. */}
      <span data-layer="out" aria-hidden="true" className="inline-flex">
        {[...label].map((c, i) => (
          <span key={`o-${i}`} data-char className="inline-block whitespace-pre">
            {c}
          </span>
        ))}
      </span>
      <span
        data-layer="in"
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 inline-flex"
      >
        {[...label].map((c, i) => (
          <span key={`i-${i}`} data-char className="inline-block whitespace-pre">
            {c}
          </span>
        ))}
      </span>
    </button>
  );
}

export default function NavHoverSwap({ replayKey }: DemoProps) {
  const [variant, setVariant] = useState<Variant>("toad");

  return (
    <div key={replayKey} className="relative h-full w-full overflow-hidden">
      <div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 rounded-full border border-white/15 bg-black/70 p-0.5 backdrop-blur">
        {(
          [
            ["toad", "Toad swap"],
            ["trionn", "Trionn swap"],
            ["current", "Current site"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            aria-pressed={variant === v}
            className={`rounded-full px-4 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] transition-colors ${
              variant === v ? "bg-lime-300 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex h-full flex-col">
        {/* Inline bar placement */}
        <div className="flex items-center justify-between border-b border-white/10 px-8 pb-5 pt-20">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-lime-300">
            Toad
          </span>
          <nav className="flex items-center gap-8">
            {ITEMS.map((item) => (
              <SwapLink key={item} label={item} variant={variant} />
            ))}
          </nav>
        </div>

        {/* Overlay-menu placement, where the site actually lists its sections */}
        <div className="flex flex-1 flex-col justify-center gap-5 px-8 sm:px-16">
          <p className="font-mono text-[0.56rem] uppercase tracking-[0.28em] text-neutral-600">
            menu panel
          </p>
          {ITEMS.map((item) => (
            <div key={item}>
              <SwapLink label={item} variant={variant} large />
            </div>
          ))}
        </div>

        <p className="border-t border-white/10 px-8 py-4 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-neutral-600">
          hover, or tab through with the keyboard — focus drives it too
        </p>
      </div>
    </div>
  );
}
