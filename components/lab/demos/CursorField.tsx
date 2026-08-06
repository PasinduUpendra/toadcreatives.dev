"use client";

import { useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

type Variant = "toad" | "current";

/** How close the pointer must get before a target starts pulling on it. */
const MAGNET_RADIUS = 90;
/** Share of the gap the ring gives up to the target's centre at full strength. */
const RING_PULL = 0.42;
/** Share of the gap the target itself travels toward the pointer. */
const ELEMENT_PULL = 0.22;

export default function CursorField({ replayKey }: DemoProps) {
  const scope = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const labelEl = useRef<HTMLSpanElement>(null);

  const [variant, setVariant] = useState<Variant>("toad");
  const [label, setLabel] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Pointer capability, not touch capability. `ontouchstart` is true on
    // touchscreen laptops that also have a mouse, which is what currently
    // leaves those machines with no cursor at all.
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    const apply = () => setSupported(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const box = scope.current;
    const ringEl = ring.current;
    const dotEl = dot.current;
    if (!box || !ringEl || !dotEl || variant !== "toad" || !supported) return;
    if (prefersReducedMotion()) return;

    // quickTo keeps the follow on GSAP's ticker and writes straight to the
    // transform. No React state is touched while the pointer moves.
    const ringX = gsap.quickTo(ringEl, "x", { duration: 0.42, ease: "power3" });
    const ringY = gsap.quickTo(ringEl, "y", { duration: 0.42, ease: "power3" });
    const dotX = gsap.quickTo(dotEl, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dotEl, "y", { duration: 0.12, ease: "power3" });

    const targets = gsap.utils.toArray<HTMLElement>("[data-cursor]", box);
    let active: HTMLElement | null = null;

    const setState = (next: HTMLElement | null) => {
      if (next === active) return;
      if (active) {
        gsap.to(active, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.5)" });
      }
      active = next;
      setLabel(next?.dataset.cursorLabel ?? "");
      gsap.to(ringEl, {
        // Scale, never width/height — animating box dimensions relayouts the
        // element on every frame.
        scale: next ? 2.6 : 1,
        borderColor: next ? "rgba(190,242,100,0.95)" : "rgba(190,242,100,0.55)",
        backgroundColor: next ? "rgba(190,242,100,0.10)" : "rgba(190,242,100,0)",
        duration: 0.42,
        ease: "power3.out",
      });
      gsap.to(dotEl, { scale: next ? 0 : 1, duration: 0.3, ease: "power3.out" });
      if (labelEl.current) {
        gsap.to(labelEl.current, {
          autoAlpha: next ? 1 : 0,
          duration: 0.28,
          ease: "power2.out",
        });
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      let nearest: HTMLElement | null = null;
      let nearestDist = Infinity;

      for (const t of targets) {
        const r = t.getBoundingClientRect();
        const cx = r.left + r.width / 2 - rect.left;
        const cy = r.top + r.height / 2 - rect.top;
        // Distance to the element's box, not its centre, so wide buttons pull
        // evenly along their whole length instead of only in the middle.
        const dx = Math.max(r.left - rect.left - px, 0, px - (r.right - rect.left));
        const dy = Math.max(r.top - rect.top - py, 0, py - (r.bottom - rect.top));
        const dist = Math.hypot(dx, dy);
        if (dist < MAGNET_RADIUS && dist < nearestDist) {
          nearestDist = dist;
          nearest = t;
        }
        if (dist < MAGNET_RADIUS) {
          const strength = 1 - dist / MAGNET_RADIUS;
          gsap.to(t, {
            x: (px - cx) * ELEMENT_PULL * strength,
            y: (py - cy) * ELEMENT_PULL * strength,
            duration: 0.5,
            ease: "power3.out",
          });
        } else if (t !== active) {
          gsap.to(t, { x: 0, y: 0, duration: 0.5, ease: "power3.out" });
        }
      }

      setState(nearest);

      let rx = px;
      let ry = py;
      if (nearest) {
        const r = nearest.getBoundingClientRect();
        const cx = r.left + r.width / 2 - rect.left;
        const cy = r.top + r.height / 2 - rect.top;
        const strength = 1 - nearestDist / MAGNET_RADIUS;
        rx += (cx - px) * RING_PULL * strength;
        ry += (cy - py) * RING_PULL * strength;
      }

      ringX(rx);
      ringY(ry);
      dotX(px);
      dotY(py);
    };

    const onEnter = () => gsap.to([ringEl, dotEl], { autoAlpha: 1, duration: 0.25 });
    const onLeave = () => {
      gsap.to([ringEl, dotEl], { autoAlpha: 0, duration: 0.25 });
      setState(null);
    };
    const onDown = () => gsap.to(ringEl, { scale: active ? 2.2 : 0.7, duration: 0.2 });
    const onUp = () => gsap.to(ringEl, { scale: active ? 2.6 : 1, duration: 0.3 });

    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerenter", onEnter);
    box.addEventListener("pointerleave", onLeave);
    box.addEventListener("pointerdown", onDown);
    box.addEventListener("pointerup", onUp);

    return () => {
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerenter", onEnter);
      box.removeEventListener("pointerleave", onLeave);
      box.removeEventListener("pointerdown", onDown);
      box.removeEventListener("pointerup", onUp);
      gsap.killTweensOf([ringEl, dotEl, ...targets]);
      gsap.set(targets, { x: 0, y: 0 });
    };
  }, [variant, replayKey, supported]);

  const custom = variant === "toad" && supported;

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 rounded-full border border-white/15 bg-black/70 p-0.5 backdrop-blur">
        {(
          [
            ["toad", "Proposed"],
            ["current", "Current site"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            aria-pressed={variant === v}
            className={`rounded-full px-4 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] transition-colors ${
              variant === v ? "bg-lime-300 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div
        ref={scope}
        className={`relative h-full w-full overflow-hidden ${custom ? "[&_*]:cursor-none" : ""}`}
        style={{ cursor: custom ? "none" : "auto" }}
      >
        <div className="flex h-full flex-col justify-center gap-12 px-8 pt-16 sm:px-16">
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.28em] text-neutral-600">
              navigation
            </p>
            <nav className="mt-4 flex flex-wrap items-center gap-7">
              {["Work", "About", "Services"].map((l) => (
                <button
                  key={l}
                  type="button"
                  data-cursor
                  data-cursor-label="Go"
                  className="text-[0.72rem] uppercase tracking-[0.2em] text-neutral-300"
                >
                  {l}
                </button>
              ))}
              <button
                type="button"
                data-cursor
                data-cursor-label="Menu"
                className="flex flex-col gap-1.5"
                aria-label="Open menu"
              >
                <span className="block h-[1.5px] w-7 bg-neutral-200" />
                <span className="block h-[1.5px] w-5 bg-neutral-200" />
              </button>
            </nav>
          </div>

          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.28em] text-neutral-600">
              cards
            </p>
            <div className="mt-4 flex flex-wrap gap-5">
              {["Coast 67", "B48 Studios"].map((l) => (
                <button
                  key={l}
                  type="button"
                  data-cursor
                  data-cursor-label="View"
                  className={`${displayFont.className} h-28 w-44 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-neutral-200`}
                >
                  {l}
                </button>
              ))}
              <button
                type="button"
                data-cursor
                data-cursor-label="Send"
                className="h-28 rounded-2xl bg-lime-300 px-7 text-sm font-medium text-black"
              >
                Send message
              </button>
            </div>
          </div>

          <p className="max-w-md font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-neutral-600">
            targets pull toward the pointer · the ring is pulled toward them ·
            the label names the action
          </p>
        </div>

        {custom && (
          <>
            <div
              ref={ring}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-40 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border opacity-0"
              style={{
                borderColor: "rgba(190,242,100,0.55)",
                boxShadow: "0 0 30px rgba(190,242,100,0.3)",
                willChange: "transform",
              }}
            >
              <span
                ref={labelEl}
                className="pointer-events-none select-none font-mono text-[0.3rem] uppercase tracking-[0.1em] text-lime-200 opacity-0"
              >
                {label}
              </span>
            </div>
            <div
              ref={dot}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 z-40 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300 opacity-0"
              style={{ willChange: "transform" }}
            />
          </>
        )}

        {!supported && (
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-amber-400/30 bg-black/70 px-4 py-2 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-amber-400/80">
            coarse pointer detected — native cursor kept
          </p>
        )}
      </div>
    </div>
  );
}
