"use client";

import Image from "next/image";
import { CreativesMotion } from "@/components/visuals/CreativesMotion";
import OverlayParallax from "@/components/visuals/OverlayParallax";
import TubesCursor  from "@/components/visuals/TubesCursor";
import { displayFont } from "@/app/fonts";

export function Hero() {
  return (
    <section 
      id="hero"
      className="relative flex min-h-screen items-center justify-center text-white"
    >
      {/* Tubes background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <TubesCursor />
      </div>

      {/* Tiled overlay pattern (between Tubes + Logo) */}
      <OverlayParallax />

      {/* Logo + text */}
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