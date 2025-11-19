"use client";

import { useMemo } from "react";
import { useScrollProgress } from "@/components/system/ScrollProgressProvider";
import { getScrollTimelineState } from "@/components/system/scrollTimeline";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function BackgroundLayer() {
  const scrollProgress = useScrollProgress();
  const timelineState = useMemo(
    () => getScrollTimelineState(scrollProgress),
    [scrollProgress]
  );

  const lightMix = timelineState.recolor;
  const dim = timelineState.dim;
  const brightness = Math.max(0, Math.min(1, lightMix * (1 - 0.6 * dim)));
  const parallaxX = (timelineState.scroll - 0.5) * 3;
  const baseBlur = 6 * brightness;
  const worksFadeStart = 0.8;
  const worksFadeEnd = 1;
  const worksT = clamp01(
    (timelineState.scroll - worksFadeStart) / (worksFadeEnd - worksFadeStart)
  );
  const extraBlur = worksT * 6;
  const effectiveBlur = baseBlur + extraBlur + 3;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      <div
        className="absolute -inset-[20%]"
        style={{
          transform: `translate3d(${parallaxX}rem, 0, 0)`,
          filter: `blur(${effectiveBlur.toFixed(1)}px)`,
          opacity: 0.85,
          backgroundImage:
            "radial-gradient(circle at 10% 0%, rgba(255,255,255,0.04), transparent 55%), " +
            "radial-gradient(circle at 90% 30%, rgba(255,255,255,0.06), transparent 60%), " +
            "linear-gradient(to bottom, #05070b 0%, #10131b 20%, #d9d6cc 52%, #10131b 80%, #05070b 100%)",
          mixBlendMode: "screen",
          backgroundColor: `rgba(255,255,255,${0.3 * brightness})`,
          transition: "transform 0.6s ease, filter 0.6s ease, background-color 0.6s ease",
        }}
      />
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-[#05070b]"
          style={{
            opacity: worksT,
            transition: "opacity 160ms linear, transform 220ms ease-out",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
            transform: `translateY(${(1 - worksT) * 20}%)`,
          }}
        />
      </div>
    </div>
  );
}
