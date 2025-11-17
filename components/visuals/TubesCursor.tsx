"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    __tubesCursorApp?: any;
  }
}

export default function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cleanup = () => {};

    const run = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        // Use the browser's native dynamic import via eval,
        // so Next/Turbopack doesn't try to bundle/resolve it.
        const importer = (window as any).eval || eval;
        const mod = await importer(
          'import("/vendor/tubes1.min.js")'
        );

        const TubesCursorImpl = (mod as any).default ?? (mod as any);

        const app = TubesCursorImpl(canvas, {
          tubes: {
            colors: ["#74a443", "#f1f0f1", "#6c9442"],
            lights: {
              intensity: 150,
              colors: ["#64943c", "#f1f0f1", "#72A06B", "#7cb444"],
            },
          },
        });

        window.__tubesCursorApp = app;

        const handleResize = () => {
          if (app?.resize) app.resize();
        };

        window.addEventListener("resize", handleResize);

        cleanup = () => {
          window.removeEventListener("resize", handleResize);
          if (app?.dispose) app.dispose();
        };
      } catch (err) {
        console.error("Failed to init TubesCursor", err);
      }
    };

    run();

    return () => cleanup();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="tubes-canvas"
      className="h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}