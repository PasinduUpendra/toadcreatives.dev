// FILE: components/visuals/TubesCursor.tsx
"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    __tubesCursorApp?: any;
  }
}

export type TubesLightsConfig = {
  intensity: number;
  colors: string[];
};

export type TubesConfig = {
  tubes: {
    colors: string[];
    lights: TubesLightsConfig;
  };
};

type Props = {
  config: TubesConfig;
};

export default function TubesCursor({ config }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const configRef = useRef<TubesConfig>(config);

  // Keep latest config in a ref if we want to use it in the future
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    let cleanup = () => {};

    const run = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      try {
        const importer = (window as any).eval || eval;
        const mod = await importer('import("/vendor/tubes1.min.js")');
        const TubesCursorImpl = (mod as any).default ?? (mod as any);

        // Just in case there was an old instance from an HMR refresh
        if (window.__tubesCursorApp?.dispose) {
          window.__tubesCursorApp.dispose();
        }

        // Use the initial config once
        const app = TubesCursorImpl(canvas, configRef.current);
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

    // Run only once on mount / unmount
    return () => cleanup();
  }, []); // <-- no config in deps, prevents re-init on scroll

  return (
    <canvas
      ref={canvasRef}
      id="tubes-canvas"
      className="h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
