"use client";

import { displayFont } from "@/app/fonts";
import TextReveal from "@/components/motion/TextReveal";
import type { DemoProps } from "../registry";

export default function TextBlurSettle({ replayKey }: DemoProps) {
  return (
    <div className="flex h-full w-full flex-col justify-center px-8 sm:px-14">
      <TextReveal
        as="p"
        mode="blur"
        splitBy="chars"
        stagger={0.03}
        replayKey={replayKey}
        className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300"
      >
        Toad Creatives
      </TextReveal>

      <TextReveal
        as="h2"
        mode="blur"
        splitBy="chars"
        delay={0.15}
        stagger={0.018}
        replayKey={replayKey}
        className={`${displayFont.className} mt-6 text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[0.95] tracking-tight text-white`}
      >
        One person. Whole stack.
      </TextReveal>

      <TextReveal
        as="p"
        mode="blur"
        splitBy="words"
        delay={0.5}
        stagger={0.03}
        replayKey={replayKey}
        className="mt-8 max-w-xl text-[1.05rem] leading-relaxed text-neutral-400"
      >
        Design, frontend, backend, infrastructure — held by the same head that scoped it. No
        handoffs, no telephone game.
      </TextReveal>
    </div>
  );
}
