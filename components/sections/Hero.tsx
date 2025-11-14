"use client";

import Image from "next/image";
import { CreativesMotion } from "@/components/visuals/CreativesMotion";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-black text-white">
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

    <p className="mt-2 text-center text-base sm:text-lg">
      Hybrid nature × tech motion.
    </p>
  </div>
</section>
  );
}