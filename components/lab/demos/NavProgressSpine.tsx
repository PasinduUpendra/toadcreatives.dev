"use client";

import { useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import type { DemoProps } from "../registry";

const SECTIONS = [
  { id: "intro", label: "Intro" },
  { id: "about", label: "About" },
  { id: "what", label: "What I do" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

export default function NavProgressSpine({ replayKey }: DemoProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      setProgress(p);
      setActiveIndex(Math.min(SECTIONS.length - 1, Math.round(p * (SECTIONS.length - 1))));
      frame = 0;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    el.scrollTo({ top: 0 });
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [replayKey]);

  const jump = (index: number) => {
    const el = scroller.current;
    const target = el?.querySelector<HTMLElement>(`#spine-${SECTIONS[index].id}`);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative h-full w-full">
      <div ref={scroller} className="h-full w-full overflow-y-auto scroll-smooth">
        {SECTIONS.map((section, i) => (
          <section
            key={section.id}
            id={`spine-${section.id}`}
            className="flex h-full min-h-full items-center px-8 sm:px-16"
          >
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-lime-300">
                0{i + 1}
              </p>
              <h2
                className={`${displayFont.className} mt-4 text-[clamp(2.2rem,6vw,4.5rem)] font-semibold tracking-tight text-white`}
              >
                {section.label}
              </h2>
              <p className="mt-4 max-w-md text-neutral-500">
                Scroll. Watch the rail on the right fill and the label lock on.
              </p>
            </div>
          </section>
        ))}
      </div>

      <div className="absolute top-1/2 right-5 z-20 -translate-y-1/2">
        <div className="relative flex flex-col items-end gap-6">
          <span
            aria-hidden="true"
            className="absolute top-0 right-[3.5px] w-px bg-white/12"
            style={{ height: "100%" }}
          />
          <span
            aria-hidden="true"
            className="absolute top-0 right-[3px] w-[2px] origin-top rounded-full bg-lime-300 transition-[height] duration-150 ease-out"
            style={{ height: `${progress * 100}%`, boxShadow: "0 0 12px rgba(190,242,100,0.7)" }}
          />

          {SECTIONS.map((section, i) => {
            const isActive = i === activeIndex;
            const isShown = hovered === i || isActive;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => jump(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                aria-current={isActive ? "true" : undefined}
                className="group relative flex items-center gap-3"
              >
                <span
                  className={`whitespace-nowrap font-mono text-[0.58rem] uppercase tracking-[0.2em] transition-all duration-300 ${
                    isShown ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                  } ${isActive ? "text-lime-300" : "text-neutral-400"}`}
                >
                  {section.label}
                </span>
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive ? "h-2 w-2 bg-lime-300" : "h-1.5 w-1.5 bg-white/30 group-hover:bg-white/70"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
