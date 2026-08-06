"use client";

import { useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { labProjects, type LabProject } from "./workData";

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.55;

export default function WorkMobileSheet() {
  const [active, setActive] = useState<LabProject | null>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const drag = useRef({ startY: 0, startTime: 0, dragging: false, atTop: true });

  // Replay remounts this component via LabShell's key, so state resets itself.

  useEffect(() => {
    if (!active || !sheet.current) return;
    const reduced = prefersReducedMotion();
    gsap.fromTo(
      sheet.current,
      { yPercent: 100 },
      { yPercent: 0, duration: reduced ? 0.2 : 0.6, ease: "expo.out" }
    );
  }, [active]);

  const dismiss = () => {
    const el = sheet.current;
    if (!el) return setActive(null);
    gsap.to(el, {
      yPercent: 100,
      duration: prefersReducedMotion() ? 0.15 : 0.4,
      ease: "power3.in",
      onComplete: () => setActive(null),
    });
  };

  // Drag only takes over when the scroll area is already at the top, so pulling
  // down mid-article scrolls the article instead of fighting the sheet.
  const onPointerDown = (event: React.PointerEvent) => {
    drag.current.atTop = (body.current?.scrollTop ?? 0) <= 0;
    if (!drag.current.atTop) return;
    drag.current.startY = event.clientY;
    drag.current.startTime = performance.now();
    drag.current.dragging = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current.dragging || !sheet.current) return;
    const delta = event.clientY - drag.current.startY;
    if (delta < 0) return;
    // Rubber band, so the sheet resists rather than tracking the finger one to one.
    gsap.set(sheet.current, { y: delta * 0.55 });
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (!drag.current.dragging || !sheet.current) return;
    drag.current.dragging = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    const delta = event.clientY - drag.current.startY;
    const velocity = delta / Math.max(1, performance.now() - drag.current.startTime);

    if (delta > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
      gsap.to(sheet.current, {
        y: window.innerHeight,
        duration: 0.32,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(sheet.current, { y: 0 });
          setActive(null);
        },
      });
    } else {
      gsap.to(sheet.current, { y: 0, duration: 0.45, ease: "elastic.out(1, 0.7)" });
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && active) dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050505]">
      {/* The card grid scrolls. Today it is clipped inside a fixed, unscrollable box. */}
      <div className="h-full w-full overflow-y-auto px-5 py-8">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-lime-300">
          Selected work
        </p>
        <h2
          className={`${displayFont.className} mt-3 text-3xl font-semibold tracking-tight text-white`}
        >
          Work
        </h2>

        <div className="mt-6 space-y-5 pb-10">
          {labProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setActive(project)}
              className="block w-full text-left"
            >
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-cover bg-center active:scale-[0.985]"
                style={{ backgroundImage: `url(${project.cover})`, transition: "transform 200ms" }}
              >
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                  <p className={`${displayFont.className} font-semibold text-white`}>{project.name}</p>
                  <p className="mt-0.5 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-neutral-400">
                    {project.category}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <>
          <button
            type="button"
            aria-label="Close case study"
            onClick={dismiss}
            className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          <div
            ref={sheet}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.name} case study`}
            className="absolute inset-x-0 bottom-0 z-50 flex h-[94%] flex-col overflow-hidden rounded-t-3xl border-t border-white/15 bg-[#0a0c0a]"
          >
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="shrink-0 cursor-grab touch-none px-5 pt-3 pb-4 active:cursor-grabbing"
            >
              <span className="mx-auto block h-1 w-10 rounded-full bg-white/25" />
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-lime-300">
                    Case study · {active.year}
                  </p>
                  <p className={`${displayFont.className} truncate text-lg font-semibold text-white`}>
                    {active.name}
                  </p>
                </div>
                {/* Sits inside the sheet, so it can never collide with the site nav. */}
                <button
                  type="button"
                  onClick={dismiss}
                  className="shrink-0 rounded-full border border-white/25 px-3.5 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white"
                >
                  Close
                </button>
              </div>
            </div>

            <div ref={body} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-8">
              <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
                {[active.cover, ...active.shots].map((src) => (
                  <div
                    key={src}
                    className="aspect-[4/3] w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-cover bg-center"
                    style={{ backgroundImage: `url(${src})` }}
                  />
                ))}
              </div>

              <h3
                className={`${displayFont.className} mt-6 text-2xl font-semibold leading-tight tracking-tight text-white`}
              >
                {active.title}
              </h3>
              <p className="mt-4 leading-relaxed text-neutral-300">{active.summary}</p>

              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
                <div>
                  <dt className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-neutral-500">
                    Year
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">{active.year}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-neutral-500">
                    Role
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-200">{active.role}</dd>
                </div>
              </dl>

              <p className="mt-8 text-sm leading-relaxed text-neutral-500">
                Drag the handle down to dismiss, or pull from the top of this text. Everything
                scrolls, nothing is clipped, and the close button lives inside the sheet.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
