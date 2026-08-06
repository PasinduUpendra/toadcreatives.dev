"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { displayFont } from "@/app/fonts";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

const SCENES = [
  {
    eyebrow: "01 — Intro",
    title: "One person. Whole stack.",
    body: "The headline holds while the sub-copy and the rule scrub through on your scroll.",
  },
  {
    eyebrow: "02 — About",
    title: "Specs first, then code.",
    body: "Each scene pins, plays out against scroll position, then releases into the next.",
  },
  {
    eyebrow: "03 — Work",
    title: "Three builds, start to ship.",
    body: "Scroll position drives progress directly — no timers, no lockout, no dropped gestures.",
  },
];

export default function TransitionPinnedScrub({ replayKey }: DemoProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"scrub" | "teleport">("scrub");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const wrap = wrapper.current;
    const cont = content.current;
    if (!wrap || !cont || mode !== "scrub") return;

    const reduced = prefersReducedMotion();

    const lenis = new Lenis({
      wrapper: wrap,
      content: cont,
      duration: reduced ? 0.4 : 1.15,
      smoothWheel: true,
    });

    // One heartbeat for everything: Lenis is stepped by GSAP's ticker, and every
    // ScrollTrigger updates off the same frame. This is what keeps WebGL, type and
    // scroll position from drifting apart.
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]");

      scenes.forEach((scene, i) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scene,
            scroller: wrap,
            start: "top top",
            end: "+=100%",
            pin: true,
            pinSpacing: true,
            scrub: reduced ? true : 0.6,
            onUpdate: (self) => {
              if (self.isActive) {
                setProgress(self.progress);
                setStep(i);
              }
            },
          },
        });

        tl.fromTo(
          scene.querySelector("[data-scene-title]"),
          { yPercent: 0, autoAlpha: 1 },
          { yPercent: -18, autoAlpha: 0.25, ease: "none" },
          0
        );
        tl.fromTo(
          scene.querySelector("[data-scene-body]"),
          { yPercent: 60, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, ease: "none" },
          0
        );
        tl.fromTo(
          scene.querySelector("[data-scene-rule]"),
          { scaleX: 0 },
          { scaleX: 1, ease: "none", transformOrigin: "left" },
          0
        );
      });

      ScrollTrigger.refresh();
    }, wrap);

    return () => {
      ctx.revert();
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [mode, replayKey]);

  // The current site's behaviour, reproduced honestly: one gesture = one instant
  // index change, with a 600ms lockout and nothing in between.
  useEffect(() => {
    const wrap = wrapper.current;
    if (!wrap || mode !== "teleport") return;
    let lock = 0;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const now = Date.now();
      if (now - lock < 600 || Math.abs(event.deltaY) < 5) return;
      lock = now;
      setStep((s) => Math.max(0, Math.min(SCENES.length - 1, s + (event.deltaY > 0 ? 1 : -1))));
      setProgress(0);
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });
    return () => wrap.removeEventListener("wheel", onWheel);
  }, [mode]);

  // Switching mode has to rewind the demo, but mode is local state so the
  // component does not remount. Doing it in the handler keeps it out of an
  // effect, where it would trigger a second render pass every time.
  const chooseMode = (next: "scrub" | "teleport") => {
    setMode(next);
    setStep(0);
    setProgress(0);
    wrapper.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 rounded-full border border-white/15 bg-black/70 p-0.5 backdrop-blur">
        {(["scrub", "teleport"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => chooseMode(m)}
            aria-pressed={mode === m}
            className={`rounded-full px-4 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] transition-colors ${
              mode === m ? "bg-lime-300 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            {m === "scrub" ? "Proposed" : "Current site"}
          </button>
        ))}
      </div>

      <div className="absolute right-4 bottom-4 z-30 rounded-lg border border-white/10 bg-black/70 px-3 py-2 font-mono text-[0.56rem] text-neutral-400 backdrop-blur">
        <div>scene {step + 1}/3</div>
        <div className="mt-1 text-lime-300">progress {progress.toFixed(3)}</div>
        <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-lime-300 transition-[width] duration-75"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {mode === "scrub" ? (
        <div ref={wrapper} className="h-full w-full overflow-y-auto">
          <div ref={content}>
            {SCENES.map((scene) => (
              <section
                key={scene.eyebrow}
                data-scene
                className="flex h-screen max-h-full min-h-full flex-col justify-center px-8 sm:px-16"
                style={{ height: "100%" }}
              >
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
                  {scene.eyebrow}
                </p>
                <h2
                  data-scene-title
                  className={`${displayFont.className} mt-5 max-w-3xl text-[clamp(1.9rem,5vw,3.8rem)] font-semibold leading-[1] tracking-tight text-white`}
                >
                  {scene.title}
                </h2>
                <span
                  data-scene-rule
                  aria-hidden="true"
                  className="mt-6 block h-px w-48 origin-left bg-gradient-to-r from-lime-300 to-transparent"
                />
                <p data-scene-body className="mt-6 max-w-md text-neutral-400">
                  {scene.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div ref={wrapper} className="h-full w-full overflow-hidden">
          <section className="flex h-full flex-col justify-center px-8 sm:px-16">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
              {SCENES[step].eyebrow}
            </p>
            <h2
              className={`${displayFont.className} mt-5 max-w-3xl text-[clamp(1.9rem,5vw,3.8rem)] font-semibold leading-[1] tracking-tight text-white`}
            >
              {SCENES[step].title}
            </h2>
            <p className="mt-6 max-w-md text-neutral-400">{SCENES[step].body}</p>
            <p className="mt-8 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-amber-400/70">
              600ms lockout — gesture speed ignored
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
