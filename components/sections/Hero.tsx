"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { CreativesMotion } from "@/components/visuals/CreativesMotion";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { hero } from "@/content/site";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // fromTo, not from — the last section still using `from` here. `from`
      // reads the element's current value as its destination, so an effect that
      // re-runs mid-tween (Strict Mode does this in dev) can bake a
      // half-finished opacity in as the target and strand the hero near-invisible.
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo(
          "[data-hero-mark]",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 1.1 },
        )
        .fromTo(
          "[data-hero-line]",
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          0.25,
        )
        .fromTo(
          "[data-hero-sub]",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.9 },
          0.4,
        )
        .fromTo(
          "[data-hero-cue]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6 },
          0.7,
        );

      // The whole hero drifts up and dims as you leave it, so the field behind
      // it is uncovered rather than the hero simply disappearing.
      gsap.to("[data-hero-inner]", {
        yPercent: -12,
        autoAlpha: 0.15,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.5 },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="intro"
      data-tube-mode="hero"
      className="relative flex min-h-dvh items-center justify-center px-6"
    >
      <div
        data-hero-inner
        className="flex w-full max-w-[780px] flex-col items-center gap-3"
      >
        <div
          data-hero-mark
          className="flex w-full max-w-[540px] flex-col items-center gap-3"
        >
          <Image
            src="/toad.svg"
            alt="Toad Creatives"
            width={540}
            height={270}
            priority
            className="h-auto w-full"
          />
          <CreativesMotion className="-mt-10 w-full" />
        </div>

        <h1
          data-hero-line
          className={`${displayFont.className} text-center text-[clamp(1.35rem,2.4vw,2.1rem)] font-semibold leading-[1.1] tracking-tight text-neutral-50`}
        >
          {hero.headline}
        </h1>

        <p
          data-hero-sub
          className="max-w-lg text-center text-sm text-neutral-400 sm:text-base"
        >
          {hero.sub}
        </p>
      </div>

      <span
        data-hero-cue
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-neutral-400"
      >
        scroll
      </span>
    </section>
  );
}
