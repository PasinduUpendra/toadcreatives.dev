"use client";

import { useMemo } from "react";
import { useScrollProgress } from "@/components/system/ScrollProgressProvider";
import { getScrollTimelineState } from "@/components/system/scrollTimeline";
import { displayFont } from "@/app/fonts";

const PARAGRAPHS: Record<number, string> = {
  1: "Paragraph 1 — About: opening statement about motion-driven web experiences.",
  2: "Paragraph 2 — About: how Toad Creatives blends nature and tech motion.",
  3: "Paragraph 3 — About: philosophy / process focused on handcrafted systems.",
  4: "Paragraph 4 — What we do: overview of services / offerings.",
  6: "Paragraph 6 — What we do: focus on WebGL motion systems and kinetic branding.",
  7: "Paragraph 7 — What we do: collaboration / outcomes / impact.",
};

export function Narrative() {
  const scrollProgress = useScrollProgress();
  const timelineState = useMemo(
    () => getScrollTimelineState(scrollProgress),
    [scrollProgress]
  );

  const isAbout =
    timelineState.section === "about" ||
    timelineState.section === "transition-to-about";
  const isWhatWeDo =
    timelineState.section === "what-we-do" ||
    (timelineState.section === "works-transition" &&
      !!timelineState.paragraphId &&
      timelineState.paragraphId >= 4);

  const activeParagraphId = timelineState.paragraphId;
  const isLightPhase =
    timelineState.section === "about" ||
    timelineState.section === "what-we-do";
  const headingColorClass = isLightPhase ? "text-slate-900" : "text-slate-50";
  const bodyColorClass = isLightPhase ? "text-slate-800" : "text-slate-200";
  const accentColorClass = isLightPhase ? "text-lime-500" : "text-lime-300";
  const labelColorClass = isLightPhase ? "text-slate-500" : "text-slate-400";

  return (
    <section
      id="narrative"
      className="relative min-h-[500vh] bg-transparent"
    >
      <div className="sticky top-0 flex min-h-screen items-center">
        <div className="grid w-full grid-cols-1 gap-12 px-6 py-16 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:px-16">
          <div />
          <div className="space-y-6">
            <p
              className={`text-xs uppercase tracking-[0.25em] ${labelColorClass}`}
            >
              Studio narrative
            </p>

            <div className="relative h-[3rem] overflow-hidden">
              <span
                className={`absolute text-sm uppercase tracking-[0.25em] transition-opacity duration-500 ${
                  isAbout ? "opacity-100" : "opacity-0"
                }`}
              >
                About
              </span>
              <span
                className={`absolute text-sm uppercase tracking-[0.25em] transition-opacity duration-500 ${
                  isWhatWeDo ? "opacity-100" : "opacity-0"
                }`}
              >
                What we do
              </span>
            </div>

            <div
              className={`${displayFont.className} text-4xl font-semibold leading-tight transition-opacity duration-500 ${headingColorClass}`}
            >
              {isAbout && "About Toad Creatives"}
              {isWhatWeDo && "What we do"}
            </div>

            <div
              className={`relative mt-4 min-h-[6rem] overflow-hidden text-base leading-relaxed md:text-lg ${bodyColorClass}`}
            >
              {Object.entries(PARAGRAPHS).map(([id, text]) => {
                const pid = Number(id);
                const isActive = pid === activeParagraphId;
                return (
                  <p
                    key={id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {text}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
