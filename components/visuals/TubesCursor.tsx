"use client";

import { useEffect, useRef } from "react";

export interface TubesConfig {
  tubes: {
    colors: string[];
    lights: { intensity: number; colors: string[] };
  };
}

/** The vendored bundle's runtime surface, as far as this component uses it. */
interface TubesApp {
  resize?: () => void;
  dispose?: () => void;
}

type TubesFactory = (canvas: HTMLCanvasElement, config: TubesConfig) => TubesApp;

interface Props {
  config: TubesConfig;
}

/** Cap the drawing buffer: at DPR 3 this scene shades ~9M pixels a frame for no
 *  visible gain on a soft, glowing field. */
const MAX_DPR = 1.75;

export default function TubesCursor({ config }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const configRef = useRef<TubesConfig>(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let app: TubesApp | null = null;
    let disposed = false;

    const originalDpr = window.devicePixelRatio;
    // The vendored bundle reads devicePixelRatio directly and offers no option
    // for it, so it is clamped for the duration of initialisation.
    const cappedDpr = Math.min(originalDpr, MAX_DPR);

    const run = async () => {
      try {
        Object.defineProperty(window, "devicePixelRatio", {
          configurable: true,
          get: () => cappedDpr,
        });

        // A real dynamic import of a file served from /public. The bundler is
        // told to leave the specifier alone rather than trying to resolve it at
        // build time. This replaces an `eval('import(...)')` hack, which forced
        // `unsafe-eval` into any Content-Security-Policy the site might ship.
        const mod = (await import(
          /* webpackIgnore: true */ /* turbopackIgnore: true */
          "/vendor/tubes1.min.js"
        )) as { default?: TubesFactory } & TubesFactory;

        if (disposed) return;

        const factory: TubesFactory = mod.default ?? (mod as TubesFactory);
        app = factory(canvas, configRef.current);
      } catch (err) {
        // The field is decoration; the site must still work without it.
        console.error("Tubes field failed to initialise", err);
      }
    };

    void run();

    const handleResize = () => app?.resize?.();
    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", handleResize);
      app?.dispose?.();
      Object.defineProperty(window, "devicePixelRatio", {
        configurable: true,
        get: () => originalDpr,
      });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="tubes-canvas"
      className="pointer-events-none h-full w-full"
      aria-hidden="true"
    />
  );
}
