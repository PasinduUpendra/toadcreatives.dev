"use client";

import React, { useMemo } from "react";
import { useTubesMode } from "../system/useTubesScrollState";
import TubesCursor from "./TubesCursor";

export const TubesSystem: React.FC = () => {
  const mode = useTubesMode();

  // Initialised once with the hero palette; the per-section shift is applied as
  // a filter so the WebGL scene never has to be torn down and rebuilt.
  const baseConfig = useMemo(
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

  const filter = useMemo(() => {
    switch (mode) {
      case "about":
        return "hue-rotate(155deg) saturate(1.3) brightness(1.05)";
      case "what":
        return "hue-rotate(70deg) saturate(1.4) brightness(1.08)";
      case "work":
        return "saturate(0.6) brightness(1.15)";
      case "contact":
        return "hue-rotate(200deg) saturate(1.15) brightness(1.02)";
      case "hero":
      default:
        return "none";
    }
  }, [mode]);

  return (
    <div
      className="h-full w-full"
      style={{
        filter,
        // Slower than the old 420ms: with continuous scrolling the boundary is
        // crossed gradually, so a longer blend keeps the shift from snapping.
        transition: "filter 700ms cubic-bezier(0.19, 1, 0.22, 1)",
      }}
    >
      <TubesCursor config={baseConfig} />
    </div>
  );
};
