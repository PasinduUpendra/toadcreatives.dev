"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { displayFont } from "@/app/fonts";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/components/motion/gsap";
import { labProjects } from "./workData";
import type { DemoProps } from "../registry";

type Variant = "hinge" | "current";

/** Measured off trionn.com: cards start folded almost flat away from the viewer. */
const START_ROTATION = -92;

export default function WorkCardHinge({ replayKey }: DemoProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<Variant>("hinge");

  useEffect(() => {
    const wrap = wrapper.current;
    const cont = content.current;
    if (!wrap || !cont) return;

    const reduced = prefersReducedMotion();

    const lenis = new Lenis({
      wrapper: wrap,
      content: cont,
      duration: reduced ? 0.4 : 1.15,
      smoothWheel: true,
    });
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");

      if (reduced) {
        gsap.set(cards, { rotateX: 0, autoAlpha: 1, y: 0 });
        return;
      }

      if (variant === "hinge") {
        // The hinge is the card's own top edge, so it swings down into place
        // like a panel dropping rather than sliding up from nowhere.
        gsap.fromTo(
          cards,
          { rotateX: START_ROTATION, autoAlpha: 0, transformOrigin: "50% 0%" },
          {
            rotateX: 0,
            autoAlpha: 1,
            transformOrigin: "50% 0%",
            duration: 1,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: "[data-grid]", scroller: wrap, start: "top 78%" },
          }
        );
      } else {
        // Today's card entrance, for comparison.
        gsap.fromTo(
          cards,
          { y: 40, scale: 0.92, autoAlpha: 0 },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.55,
            ease: "expo.out",
            stagger: 0.08,
            scrollTrigger: { trigger: "[data-grid]", scroller: wrap, start: "top 78%" },
          }
        );
      }

      ScrollTrigger.refresh();
    }, wrap);

    return () => {
      ctx.revert();
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [variant, replayKey]);

  useEffect(() => {
    wrapper.current?.scrollTo({ top: 0 });
  }, [variant, replayKey]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 rounded-full border border-white/15 bg-black/70 p-0.5 backdrop-blur">
        {(
          [
            ["hinge", "Hinge reveal"],
            ["current", "Current site"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            aria-pressed={variant === v}
            className={`rounded-full px-4 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] transition-colors ${
              variant === v ? "bg-lime-300 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div ref={wrapper} className="h-full w-full overflow-y-auto">
        <div ref={content}>
          {/* Fixed pixels, not vh — inside the lab frame vh resolves against the
              window, which leaves almost nothing to scroll. */}
          <div className="flex h-[380px] items-center justify-center">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.28em] text-neutral-600">
              scroll ↓
            </p>
          </div>

          <section className="px-6 pb-[420px] sm:px-10">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
              Selected work
            </p>
            <h2
              className={`${displayFont.className} mt-3 text-[clamp(1.6rem,3vw,2.4rem)] font-semibold tracking-tight text-white`}
            >
              Three builds, start to ship.
            </h2>

            {/* Perspective lives on the container, so the cards share one vanishing
                point instead of each folding in its own private space. */}
            <div
              data-grid
              className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              style={{ perspective: 1400 }}
            >
              {labProjects.map((p) => (
                <article
                  key={p.id}
                  data-card
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80"
                  style={{ willChange: "transform" }}
                >
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={p.cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-mono text-[0.52rem] uppercase tracking-[0.24em] text-neutral-400">
                      {p.category}
                    </p>
                    {/* The project name is real text here. Today it exists only
                        inside the artwork, so assistive tech never hears it. */}
                    <h3
                      className={`${displayFont.className} mt-1.5 text-lg font-semibold text-white`}
                    >
                      {p.name}
                    </h3>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
