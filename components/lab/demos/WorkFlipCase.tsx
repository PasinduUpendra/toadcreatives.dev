"use client";

import { useEffect, useRef, useState } from "react";
import { Flip } from "gsap/Flip";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { labProjects } from "./workData";

gsap.registerPlugin(Flip);

export default function WorkFlipCase() {
  const [openId, setOpenId] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const pending = useRef<Flip.FlipState | null>(null);

  const open = (id: string) => {
    const el = root.current?.querySelector<HTMLElement>(`[data-media="${id}"]`);
    if (el) pending.current = Flip.getState(el);
    setOpenId(id);
  };

  const close = () => {
    const el = root.current?.querySelector<HTMLElement>(`[data-media="${openId}"]`);
    if (el) pending.current = Flip.getState(el);
    setOpenId(null);
  };

  // The card's media element is the same DOM node in both layouts, so Flip can
  // measure it before and after and tween the difference. The thing you clicked
  // physically becomes the thing you are reading.
  useEffect(() => {
    const state = pending.current;
    if (!state) return;
    pending.current = null;

    const reduced = prefersReducedMotion();
    Flip.from(state, {
      duration: reduced ? 0.25 : 0.85,
      ease: "expo.inOut",
      absolute: true,
      scale: true,
    });

    if (openId) {
      gsap.fromTo(
        root.current?.querySelectorAll("[data-case-copy]") ?? [],
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: reduced ? 0.2 : 0.7, ease: "expo.out", stagger: 0.07, delay: 0.25 }
      );
    }
  }, [openId]);

  // Replay remounts this component via LabShell's key, so state resets itself.

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && openId) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const active = labProjects.find((p) => p.id === openId) ?? null;

  return (
    <div ref={root} className="relative h-full w-full overflow-hidden">
      <div className="flex h-full w-full flex-col justify-center px-6 py-8 sm:px-12">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
          Selected work
        </p>
        <h2
          className={`${displayFont.className} mt-4 text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-tight text-white`}
        >
          Click a card
        </h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {labProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => open(project.id)}
              className="group text-left"
              aria-label={`Open case study: ${project.name}`}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10">
                {openId !== project.id && (
                  <div
                    data-media={project.id}
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${project.cover})` }}
                  />
                )}
              </div>
              <p className={`${displayFont.className} mt-3 font-semibold text-white`}>
                {project.name}
              </p>
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-neutral-500">
                {project.category}
              </p>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${active.name} case study`}
          className="absolute inset-0 z-40 flex flex-col overflow-y-auto bg-[#05070b]"
        >
          <div
            data-media={active.id}
            className="relative h-[38%] min-h-[180px] w-full shrink-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${active.cover})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070b] via-transparent to-transparent" />
          </div>

          <div className="flex-1 px-6 pb-10 sm:px-12">
            <p
              data-case-copy
              className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-lime-300"
            >
              Case study · {active.year}
            </p>
            <h3
              data-case-copy
              className={`${displayFont.className} mt-3 max-w-2xl text-[clamp(1.5rem,3.4vw,2.4rem)] font-semibold leading-tight tracking-tight text-white`}
            >
              {active.title}
            </h3>
            <p data-case-copy className="mt-4 max-w-xl leading-relaxed text-neutral-400">
              {active.summary}
            </p>
            <p
              data-case-copy
              className="mt-5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-neutral-500"
            >
              Role — {active.role}
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            className="absolute top-5 right-5 z-50 rounded-full border border-white/30 bg-black/60 px-4 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-white backdrop-blur transition-colors hover:bg-white hover:text-black"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
