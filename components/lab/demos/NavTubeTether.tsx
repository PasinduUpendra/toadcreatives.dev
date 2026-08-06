"use client";

import { useEffect, useRef, useState } from "react";
import TetherField, { type Attractor } from "@/components/visuals/tube/TetherField";

const TETHER_RADIUS = 260;

export default function NavTubeTether() {
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [attractor, setAttractor] = useState<Attractor | null>(null);
  const [band, setBand] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const onMove = (event: PointerEvent) => {
      const btn = button.current?.getBoundingClientRect();
      if (!btn) return;
      const cx = btn.left + btn.width / 2;
      const cy = btn.top + btn.height / 2;
      const distance = Math.hypot(event.clientX - cx, event.clientY - cy);

      // Smoothstep so the pull arrives gradually instead of snapping on at the edge.
      const t = Math.max(0, Math.min(1, 1 - distance / TETHER_RADIUS));
      const strength = t * t * (3 - 2 * t);
      setAttractor(strength > 0.01 ? { x: cx, y: cy, strength } : null);
    };

    const onLeave = () => setAttractor(null);

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // No reset effect needed: LabShell keys each demo on replayKey, so Replay
  // remounts the component and state starts fresh on its own.

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Flattening the field into a band is what "the menu takes the light" looks like.
    const start = performance.now();
    const from = band;
    const to = next ? 1 : 0;
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / 650);
      const eased = 1 - Math.pow(1 - t, 3);
      setBand(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <div ref={root} className="relative h-full w-full overflow-hidden bg-[#050505]">
      <div className="absolute inset-0">
        <TetherField band={band} attractor={attractor} />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-neutral-600">
          Move toward the button — the light follows
        </p>
      </div>

      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="absolute top-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur transition-colors hover:border-lime-300/60"
      >
        <span className="flex flex-col items-end gap-[5px]">
          <span
            className="block h-[1.5px] rounded-full bg-neutral-100 transition-all duration-500"
            style={{ width: open ? 26 : 26, transform: open ? "rotate(45deg) translateY(4px)" : "none" }}
          />
          <span
            className="block h-[1.5px] rounded-full bg-neutral-100 transition-all duration-500"
            style={{ width: open ? 26 : 16, transform: open ? "rotate(-45deg) translateY(-4px)" : "none" }}
          />
        </span>
      </button>

      <div
        className="absolute inset-y-0 right-0 z-20 flex w-full flex-col justify-center gap-2 border-l border-white/10 bg-black/85 px-10 backdrop-blur-xl transition-transform duration-700 sm:w-[62%]"
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          transitionTimingFunction: "cubic-bezier(0.19,1,0.22,1)",
        }}
      >
        {["Intro", "About", "What I do", "Work", "Contact"].map((label) => (
          <p key={label} className="text-2xl font-semibold tracking-tight text-neutral-300">
            {label}
          </p>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 z-30 rounded-lg border border-white/10 bg-black/70 px-3 py-2 font-mono text-[0.55rem] text-neutral-400 backdrop-blur">
        tether {(attractor?.strength ?? 0).toFixed(2)} · band {band.toFixed(2)}
      </div>
    </div>
  );
}
