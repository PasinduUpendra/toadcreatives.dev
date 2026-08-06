"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";

/** Deliberately restrained: close enough to feel intentional, far from a gimmick. */
const MAGNET_RADIUS = 70;
/** Share of the gap the ring gives up to the target at full strength. */
const RING_PULL = 0.22;
/** Share of the gap the target itself travels toward the pointer. */
const ELEMENT_PULL = 0.1;
const HOVER_SCALE = 1.9;

export default function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const labelEl = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    // Capability, not touch support. `ontouchstart` is true on touchscreen
    // laptops that also have a mouse, which previously left those machines with
    // `cursor: none` and no replacement drawn.
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    const apply = () => setEnabled(mq.matches && !prefersReducedMotion());
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    // Only hide the system cursor once a replacement is actually on screen.
    document.documentElement.classList.toggle("has-custom-cursor", enabled);
    return () => document.documentElement.classList.remove("has-custom-cursor");
  }, [enabled]);

  useEffect(() => {
    const ringEl = ring.current;
    const dotEl = dot.current;
    // Captured now so cleanup acts on the same nodes this effect set up.
    const labelNode = labelEl.current;
    if (!enabled || !ringEl || !dotEl) return;

    // quickTo writes straight to the transform on GSAP's ticker. No React state
    // is touched while the pointer moves; the old build re-rendered on every
    // mouseover and tweened width/height, which relayouts each frame.
    const ringX = gsap.quickTo(ringEl, "x", { duration: 0.5, ease: "power3" });
    const ringY = gsap.quickTo(ringEl, "y", { duration: 0.5, ease: "power3" });
    const dotX = gsap.quickTo(dotEl, "x", { duration: 0.1, ease: "power3" });
    const dotY = gsap.quickTo(dotEl, "y", { duration: 0.1, ease: "power3" });
    // The label rides with the ring but is never scaled by it.
    const labX = labelNode
      ? gsap.quickTo(labelNode, "x", { duration: 0.5, ease: "power3" })
      : null;
    const labY = labelNode
      ? gsap.quickTo(labelNode, "y", { duration: 0.5, ease: "power3" })
      : null;

    let active: HTMLElement | null = null;
    let pulled: HTMLElement[] = [];

    const setActive = (next: HTMLElement | null) => {
      if (next === active) return;
      active = next;
      setLabel(next?.dataset.cursorLabel ?? "");
      gsap.to(ringEl, {
        scale: next ? HOVER_SCALE : 1,
        borderColor: next ? "rgba(190,242,100,0.85)" : "rgba(190,242,100,0.4)",
        backgroundColor: next
          ? "rgba(190,242,100,0.07)"
          : "rgba(190,242,100,0)",
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(dotEl, {
        scale: next ? 0 : 1,
        duration: 0.3,
        ease: "power3.out",
      });
      if (labelNode) {
        gsap.to(labelNode, {
          autoAlpha: next ? 1 : 0,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    };

    const onMove = (e: PointerEvent) => {
      const px = e.clientX;
      const py = e.clientY;

      const targets = Array.from(
        document.querySelectorAll<HTMLElement>("[data-cursor]"),
      );
      let nearest: HTMLElement | null = null;
      let nearestDist = Infinity;
      const nowPulled: HTMLElement[] = [];

      for (const t of targets) {
        const r = t.getBoundingClientRect();
        if (!r.width) continue;
        // Distance to the element's edge, not its centre, so a wide button
        // attracts evenly along its whole length.
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        const dist = Math.hypot(dx, dy);
        if (dist >= MAGNET_RADIUS) continue;

        nowPulled.push(t);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = t;
        }
        const strength = 1 - dist / MAGNET_RADIUS;
        gsap.to(t, {
          x: (px - (r.left + r.width / 2)) * ELEMENT_PULL * strength,
          y: (py - (r.top + r.height / 2)) * ELEMENT_PULL * strength,
          duration: 0.6,
          ease: "power3.out",
        });
      }

      // Release anything that just left the field.
      for (const t of pulled) {
        if (!nowPulled.includes(t)) {
          gsap.to(t, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
        }
      }
      pulled = nowPulled;

      setActive(nearest);

      let rx = px;
      let ry = py;
      if (nearest) {
        const r = nearest.getBoundingClientRect();
        const strength = 1 - nearestDist / MAGNET_RADIUS;
        rx += (r.left + r.width / 2 - px) * RING_PULL * strength;
        ry += (r.top + r.height / 2 - py) * RING_PULL * strength;
      }

      ringX(rx);
      ringY(ry);
      labX?.(rx);
      labY?.(ry);
      dotX(px);
      dotY(py);
    };

    const show = () =>
      gsap.to([ringEl, dotEl], { autoAlpha: 1, duration: 0.25 });
    const hide = () => {
      gsap.to([ringEl, dotEl], { autoAlpha: 0, duration: 0.25 });
      setActive(null);
    };
    const onDown = () =>
      gsap.to(ringEl, { scale: active ? 1.6 : 0.75, duration: 0.18 });
    const onUp = () =>
      gsap.to(ringEl, { scale: active ? HOVER_SCALE : 1, duration: 0.28 });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerenter", show);
    document.addEventListener("pointerleave", hide);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerenter", show);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      gsap.killTweensOf([ringEl, dotEl, labelNode].filter(Boolean));
      gsap.set(pulled, { x: 0, y: 0 });
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-9998 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-0"
        style={{
          borderColor: "rgba(190,242,100,0.4)",
          willChange: "transform",
        }}
      />
      {/* The label is a sibling of the ring, not a child. Nested inside, it was
          rasterised at its own tiny size and then blown up by the ring's 1.9×
          hover scale, which is what made it look smeared. Here it renders at a
          real font size and is never scaled. */}
      <span
        ref={labelEl}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-9998 -translate-x-1/2 -translate-y-1/2 font-mono text-[9px] leading-none tracking-[0.14em] text-lime-200 uppercase opacity-0 select-none"
        style={{ willChange: "transform" }}
      >
        {label}
      </span>
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-9999 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300 opacity-0"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
