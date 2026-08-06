"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { displayFont } from "@/app/fonts";
import {
  gsap,
  ScrollTrigger,
  SplitText,
  prefersReducedMotion,
} from "@/components/motion/gsap";
import type { DemoProps } from "../registry";

/** The unlit colour every character starts from — a ghost of the finished line. */
const DIM = "rgba(229,231,235,0.10)";
const LIT = "rgb(245,245,245)";
/** Brand accent the leading edge of the wave passes through on the Toad variant. */
const EDGE = "rgb(190,242,100)";

type Variant = "toad" | "trionn" | "current";

const COPY = {
  eyebrow: "About",
  headline:
    "I build websites, apps and automation for founders who would rather hire one person who can hold the whole thing than assemble a committee.",
  body: "Scroll slowly. Then scroll back up. The sweep is bound to scroll position, so it runs backwards just as smoothly — there is no play button and no lockout.",
};

export default function TextScrubSweep({ replayKey }: DemoProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);

  const [variant, setVariant] = useState<Variant>("toad");
  const [progress, setProgress] = useState(0);
  const [lit, setLit] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const wrap = wrapper.current;
    const cont = content.current;
    const head = headline.current;
    if (!wrap || !cont || !head) return;

    const reduced = prefersReducedMotion();
    let split: SplitText | null = null;
    let ctx: gsap.Context | null = null;
    let cancelled = false;
    let lastCount = 0;

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

    // Splitting before webfonts settle measures the wrong glyph widths, which
    // shows up as a ragged wave on the first scroll.
    document.fonts.ready.then(() => {
      if (cancelled) return;

      ctx = gsap.context(() => {
        // aria defaults to "auto": SplitText lifts the full sentence onto the
        // heading as aria-label and marks every fragment aria-hidden, so screen
        // readers still hear one sentence rather than 140 letters.
        split = new SplitText(head, { type: "chars,words", charsClass: "sweep-char" });
        const chars = split.chars as HTMLElement[];
        setTotal(chars.length);

        if (reduced) {
          gsap.set(chars, { color: LIT });
          setLit(chars.length);
          return;
        }

        gsap.set(chars, { color: variant === "current" ? LIT : DIM });

        if (variant === "current") {
          // What the site does today: one triggered word-stagger, start to finish,
          // ignoring how fast or how far you actually scrolled.
          gsap.fromTo(
            split.words as HTMLElement[],
            { yPercent: 115, autoAlpha: 0, filter: "blur(6px)" },
            {
              yPercent: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: 0.45,
              stagger: 0.03,
              ease: "expo.out",
              scrollTrigger: { trigger: head, scroller: wrap, start: "top 75%" },
            }
          );
          return;
        }

        // The measured Trionn technique: each character's colour alpha is driven
        // from 0.1 to 1 and the whole set is staggered, with the tween scrubbed
        // against scroll position rather than played on a trigger.
        const tween =
          variant === "toad"
            ? gsap.to(chars, {
                // Three stops, so the leading edge of the wave passes through
                // lime before settling to white. Trionn goes straight to white;
                // this is the same mechanism carrying Toad's accent.
                keyframes: [
                  { color: EDGE, duration: 0.35 },
                  { color: LIT, duration: 0.65 },
                ],
                ease: "none",
                stagger: { amount: 0.85 },
              })
            : gsap.to(chars, {
                color: LIT,
                ease: "none",
                stagger: { amount: 0.85 },
              });

        ScrollTrigger.create({
          trigger: head,
          scroller: wrap,
          // Deliberately long: the sweep should be something you read at your
          // own pace, not a transition you trip over. Roughly 1.5 frame-heights
          // of scroll from first character lit to last.
          start: "top 80%",
          end: () => `+=${wrap.clientHeight * 1.5}`,
          scrub: 0.6,
          animation: tween,
          onUpdate: (self) => {
            setProgress(self.progress);
            // Count what is actually lit rather than inferring it from progress,
            // so the readout measures the DOM instead of restating the input.
            // Throttled: this forces style resolution on every character, which
            // is fine a few times a second and wasteful at 120fps.
            const now = performance.now();
            const atRest = self.progress <= 0 || self.progress >= 1;
            // Always settle the readout at the ends, or the throttle can leave a
            // stale count on screen once scrolling stops.
            if (!atRest && now - lastCount < 90) return;
            lastCount = now;
            let count = 0;
            for (const c of chars) {
              // A settled character is rgb() with no alpha channel; an unlit one
              // is rgba(...,0.1). Reading the last number blindly would treat the
              // blue channel of rgb(…,146) as an alpha of 146.
              const m = getComputedStyle(c).color.match(/rgba?\(([^)]+)\)/);
              if (!m) continue;
              const parts = m[1].split(",").map((v) => parseFloat(v));
              if ((parts.length > 3 ? parts[3] : 1) > 0.85) count++;
            }
            setLit(count);
          },
        });

        ScrollTrigger.refresh();
      }, wrap);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
      split?.revert();
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [variant, replayKey]);

  const chooseVariant = (next: Variant) => {
    setVariant(next);
    setProgress(0);
    setLit(0);
    wrapper.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 left-1/2 z-30 flex -translate-x-1/2 rounded-full border border-white/15 bg-black/70 p-0.5 backdrop-blur">
        {(
          [
            ["toad", "Toad sweep"],
            ["trionn", "Trionn sweep"],
            ["current", "Current site"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => chooseVariant(v)}
            aria-pressed={variant === v}
            className={`rounded-full px-4 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] transition-colors ${
              variant === v ? "bg-lime-300 text-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="absolute right-4 bottom-4 z-30 rounded-lg border border-white/10 bg-black/70 px-3 py-2 font-mono text-[0.56rem] text-neutral-400 backdrop-blur">
        <div>
          scroll progress{" "}
          <span className="text-lime-300">
            {variant === "current" ? "—" : progress.toFixed(3)}
          </span>
        </div>
        <div className="mt-1">
          chars lit <span className="text-lime-300">{lit}</span>/{total}
        </div>
        <div className="mt-1.5 h-1 w-28 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-lime-300"
            style={{ width: `${(total ? lit / total : 0) * 100}%` }}
          />
        </div>
      </div>

      <div ref={wrapper} className="h-full w-full overflow-y-auto">
        <div ref={content}>
          {/* Fixed pixel spacers, not vh — inside the lab frame vh resolves
              against the window and collapses the scrollable distance. */}
          <div className="flex h-[420px] items-center justify-center px-8">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.28em] text-neutral-600">
              scroll ↓
            </p>
          </div>

          <section className="px-8 py-[200px] sm:px-16">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
              {COPY.eyebrow}
            </p>
            <h2
              ref={headline}
              className={`${displayFont.className} mt-6 max-w-4xl text-[clamp(1.5rem,3.6vw,2.9rem)] font-semibold leading-[1.15] tracking-tight`}
            >
              {COPY.headline}
            </h2>
            <p className="mt-10 max-w-md text-sm text-neutral-500">{COPY.body}</p>
          </section>

          <div className="flex h-[600px] items-center justify-center px-8">
            <p className="max-w-sm text-center font-mono text-[0.56rem] uppercase tracking-[0.2em] text-neutral-600">
              scroll back up — the sweep reverses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
