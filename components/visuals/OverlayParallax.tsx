// components/visuals/OverlayParallax.tsx
"use client";

import { useEffect, useRef } from "react";

export default function OverlayParallax() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let vx = 0;
    let vy = 0;
    let rafId: number;

    // Inertia settings
    const SPRING = 0.08; // how strongly we chase the target
    const DAMPING = 0.85; // how much we slow down each frame

    // For auto-pan on mobile / no mouse
    const AUTO_X_AMPLITUDE = 20; // px
    const AUTO_Y_AMPLITUDE = 16; // px
    const AUTO_X_SPEED = 0.0004; // smaller = slower
    const AUTO_Y_SPEED = 0.0006;

    const handleMove = (e: MouseEvent) => {
      // On touch devices we ignore mouse (we'll auto-pan instead)
      if (isTouchDevice) return;

      const xNorm = e.clientX / window.innerWidth - 0.5; // -0.5 → 0.5
      const yNorm = e.clientY / window.innerHeight - 0.5;

      // Small, tasteful movement
      targetX = xNorm * 20;
      targetY = yNorm * 20;
    };

    const animate = (time: number) => {
      // Auto-pan path for mobile (and as a fallback if no mouse moves)
      if (isTouchDevice) {
        targetX = Math.sin(time * AUTO_X_SPEED) * AUTO_X_AMPLITUDE;
        targetY = Math.cos(time * AUTO_Y_SPEED) * AUTO_Y_AMPLITUDE;
      }

      // Spring + damping = inertia
      vx += (targetX - currentX) * SPRING;
      vy += (targetY - currentY) * SPRING;

      vx *= DAMPING;
      vy *= DAMPING;

      currentX += vx;
      currentY += vy;

      node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-[5] opacity-[0.35] mix-blend-screen will-change-transform"
      style={{
        backgroundImage: "url('/hero_overlay.svg')",
        backgroundRepeat: "repeat",
        backgroundSize: "400px 400px",
        backgroundPosition: "center",
      }}
    />
  );
}