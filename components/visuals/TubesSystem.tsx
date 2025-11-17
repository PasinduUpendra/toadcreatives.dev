"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

declare global {
  interface Window {
    tubesControls?: {
      setMode: (mode: "hero" | "about" | "off") => void;
    };
  }
}

export function TubesSystem() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let app: any;

    (async () => {
      try {
        // Load local vendor script from /public/vendor/tubes1.min.js
        // This stays browser-only and won’t break Vercel build.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mod = await import(
          /* webpackIgnore: true */
          "/vendor/tubes1.min.js"
        );

        const TubesCursorImpl = (mod as any).default ?? (mod as any);

        app = TubesCursorImpl(canvas, {
          tubes: {
            colors: ["#a8ff78", "#78ffd6", "#b7f465"],
          },
          lights: {
            intensity: 220,
          },
        });

        // Start hidden
        gsap.set(canvas, {
          opacity: 0,
          scale: 1,
          xPercent: 0,
          yPercent: 0,
        });

        const setMode = (mode: "hero" | "about" | "off") => {
          if (!canvas) return;

          // Kill any in-flight tweens on this canvas
          gsap.killTweensOf(canvas);

          if (mode === "hero") {
            gsap.to(canvas, {
              duration: 1.2,
              opacity: 1,
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              ease: "power3.out",
            });
          }

          if (mode === "about") {
            gsap.to(canvas, {
              duration: 1.2,
              opacity: 1,
              // Shift slightly left/up so it “sits behind” the About layout
              xPercent: -25,
              yPercent: -5,
              scale: 1.2,
              ease: "power3.out",
            });
          }

          if (mode === "off") {
            gsap.to(canvas, {
              duration: 0.8,
              opacity: 0,
              ease: "power2.out",
            });
          }
        };

        // Expose global control API
        window.tubesControls = { setMode };

        // Default to hero when page loads
        setMode("hero");

        const handleResize = () => {
          if (app?.resize) app.resize();
        };

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
        };
      } catch (err) {
        console.error("Failed to init TubesSystem", err);
      }
    })();

    return () => {
      if (app?.dispose) app.dispose();
      if (window.tubesControls) window.tubesControls = undefined;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="tubes-canvas"
      className="pointer-events-none fixed inset-0 z-[0]"
      aria-hidden="true"
    />
  );
}