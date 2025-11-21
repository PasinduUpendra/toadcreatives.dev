// FILE: components/visuals/TubesSystem.tsx
"use client";

import React, { useMemo } from "react";
import { useTubesScrollState } from "../system/useTubesScrollState";
import TubesCursor, { TubesConfig } from "./TubesCursor";

export const TubesSystem: React.FC = () => {
  const { mode } = useTubesScrollState();

  // Initialise tubes once with your hero palette
  const baseConfig: TubesConfig = useMemo(
    () => ({
      tubes: {
        colors: ["#74a443", "#f1f0f1", "#6c9442"],
        lights: {
          intensity: 300,
          colors: ["#64943c", "#f1f0f1", "#72A06B", "#7cb444"],
        },
      },
    }),
    []
  );

  // Per-section color treatment applied as a filter on the canvas.
  // This actually shifts the rendered tube colors (no overlays).
  const filter = useMemo(() => {
    switch (mode) {
      case "about":
        // cooler cyan shift, slightly brighter
        return "hue-rotate(155deg) saturate(1.3) brightness(1.05)";
      case "what":
        // energetic lime / yellowish shift
        return "hue-rotate(70deg) saturate(1.4) brightness(1.08)";
      case "work":
        // more neutral, slightly desaturated and brighter
        return "saturate(0.6) brightness(1.15)";
      case "hero":
      default:
        // raw hero look
        return "none";
    }
  }, [mode]);

  return (
    <div
      className="w-full h-full"
      style={{
        // Apply filter directly to the WebGL canvas output
        filter,
        transition: "filter 420ms cubic-bezier(0.19, 1, 0.22, 1)",
      }}
    >
      <TubesCursor config={baseConfig} />
    </div>
  );
};
