"use client";

import { useEffect, useRef } from "react";

// we’ll hang the app instance on window so we can tweak colors later
declare global {
  interface Window {
    __tubesCursorApp?: any;
  }
}

export default function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cleanup = () => {};

    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // --- THIS IS BASICALLY THE CODEPEN IMPORT ---
      // The webpackIgnore comment tells Next/webpack:
      // “don’t try to bundle this; let the browser load it at runtime”.
      // @ts-ignore
      const mod = await import(
        /* webpackIgnore: true */
        "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"
      );

      const TubesCursorImpl = (mod as any).default ?? (mod as any);

      const app = TubesCursorImpl(canvas, {
        tubes: {
          colors: ["#f967fb", "#53bc28", "#6958d5"],
          lights: {
            intensity: 200,
            colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
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
    })();

    return () => cleanup();
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