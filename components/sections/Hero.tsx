// components/sections/Hero.tsx
"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10"
    >
      <div className="flex flex-col items-center text-center gap-6">
        {/* Logo with halo */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-toad-green/25 blur-3xl" />
          <Image
            src="/toad-creatives-logo.png"
            alt="Toad Creatives logo"
            width={180}
            height={180}
            className="h-auto w-40 sm:w-48"
            priority
          />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Hybrid nature × tech motion.
        </h1>
      </div>
    </section>
  );
}