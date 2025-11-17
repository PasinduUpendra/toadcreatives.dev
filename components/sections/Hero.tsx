"use client";

import { useEffect } from "react";
import Image from "next/image";
import { CreativesMotion } from "@/components/visuals/CreativesMotion";
import { displayFont } from "@/app/fonts";
// import TubesCursor – NO LONGER NEEDED

export function Hero() {
  useEffect(() => {
    // Make sure tubes snap into "hero" position when landing at top
    window.tubesControls?.setMode("hero");
  }, []);

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center text-white"
    >
      {/* your overlay grid / hero_overlay.svg / content stay as-is */}

      <div className="flex w-full max-w-[780px] flex-col items-center gap-3 px-4">
        <div className="flex w-full max-w-[540px] flex-col items-center gap-3">
          <Image
            src="/toad.svg"
            alt="Toad Creatives logo"
            width={540}
            height={270}
            className="h-auto w-full"
          />

          <CreativesMotion className="w-full -mt-10" />
        </div>

        <h1
          className={`${displayFont.className} text-[clamp(1.5rem,2vw,2.5rem)] font-semibold leading-[0.95] tracking-tight`}
        >
          Hybrid nature <span className="text-lime-300">×</span> tech motion
        </h1>
      </div>
    </section>
  );
}