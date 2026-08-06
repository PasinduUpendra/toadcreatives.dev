"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import ScrubText from "@/components/motion/ScrubText";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { projects, type Project } from "@/content/projects";
import { work } from "@/content/site";
import CaseStudySheet from "./CaseStudySheet";

/** Cards start folded almost flat, hinged on their own top edge. */
const START_ROTATION = -88;
/** Peak tilt in degrees when the pointer sits at a card's corner. */
const TILT = 7;

export default function Works() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<Project | null>(null);

  // Remembered so focus lands back on the card that opened the sheet rather
  // than falling to the top of the document.
  const opener = useRef<HTMLAnchorElement | null>(null);

  // Whether the sheet's URL was pushed by us, so closing can unwind exactly
  // what we added and nothing more.
  const didPush = useRef(false);

  // Stable identity: an inline arrow here would be a new prop every render,
  // which re-ran the sheet's open effect and restarted its entrance animation.
  const closeSheet = useCallback(() => {
    setActive(null);
    if (didPush.current) {
      // Pop our own entry rather than pushing a second one. Pushing on close
      // left two entries per open/close cycle, so Back landed on /work/<slug>
      // with no sheet open — the address bar and the page disagreed.
      didPush.current = false;
      window.history.back();
    } else if (window.location.pathname.startsWith("/work/")) {
      // Arrived here by deep link, so there is nothing of ours to pop.
      window.history.replaceState(null, "", "/#work");
    }
    opener.current?.focus();
  }, []);

  // Back button closes the sheet instead of leaving the site.
  useEffect(() => {
    const onPop = () => {
      // The entry is already gone; closeSheet must not try to pop again.
      didPush.current = false;
      setActive(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    // gsap.context reverts animations but knows nothing about DOM listeners, so
    // those are tracked here and removed explicitly.
    const teardown: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");

      cards.forEach((card, i) => {
        const media = card.querySelector<HTMLElement>("[data-media]");
        if (!media) return;

        // Entrance: the card swings down on its top edge while its artwork
        // rises to meet it and the shadow settles underneath. Three parts on one
        // timeline so they resolve together rather than as separate events.
        gsap
          .timeline({
            scrollTrigger: { trigger: card, start: "top 86%" },
            defaults: { ease: "power3.out" },
          })
          .fromTo(
            card,
            {
              rotateX: START_ROTATION,
              autoAlpha: 0,
              y: 40,
              transformOrigin: "50% 0%",
            },
            { rotateX: 0, autoAlpha: 1, y: 0, duration: 1.05, delay: i * 0.1 },
          )
          .fromTo(
            media,
            { scale: 1.25, yPercent: 8 },
            { scale: 1, yPercent: 0, duration: 1.3 },
            "<",
          )
          .fromTo(
            card.querySelector("[data-sweep]"),
            { xPercent: -110 },
            { xPercent: 130, duration: 1.1, ease: "power2.inOut" },
            "<0.15",
          );

        // Hover: the card tilts toward the pointer in the same 3D space the
        // entrance used, and the artwork drifts the opposite way for depth.
        const rotX = gsap.quickTo(card, "rotateX", {
          duration: 0.5,
          ease: "power3",
        });
        const rotY = gsap.quickTo(card, "rotateY", {
          duration: 0.5,
          ease: "power3",
        });
        const medX = gsap.quickTo(media, "xPercent", {
          duration: 0.7,
          ease: "power3",
        });
        const medY = gsap.quickTo(media, "yPercent", {
          duration: 0.7,
          ease: "power3",
        });

        const onMove = (event: PointerEvent) => {
          const r = card.getBoundingClientRect();
          const nx = (event.clientX - r.left) / r.width - 0.5;
          const ny = (event.clientY - r.top) / r.height - 0.5;
          rotY(nx * TILT * 2);
          rotX(-ny * TILT * 2);
          medX(-nx * 4);
          medY(-ny * 4);
        };
        const onEnter = () =>
          gsap.to(card, { y: -8, duration: 0.5, ease: "power3.out" });
        const onLeave = () => {
          rotX(0);
          rotY(0);
          medX(0);
          medY(0);
          gsap.to(card, { y: 0, duration: 0.6, ease: "power3.out" });
        };

        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerenter", onEnter);
        card.addEventListener("pointerleave", onLeave);
        teardown.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerenter", onEnter);
          card.removeEventListener("pointerleave", onLeave);
        });
      });
    }, el);

    return () => {
      teardown.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section
        ref={root}
        id="work"
        data-tube-mode="work"
        // Small bottom padding on purpose: contact should arrive immediately
        // after the cards, not after a screen of empty scroll.
        className="relative px-6 pt-[24vh] pb-[6vh] sm:px-10 lg:px-16"
      >
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
            {work.eyebrow}
          </p>

          <ScrubText
            as="h2"
            className={`${displayFont.className} mt-7 max-w-3xl text-[clamp(1.6rem,3.9vw,3.1rem)] font-semibold leading-[1.14] tracking-tight`}
          >
            {work.lead}
          </ScrubText>

          {/* Perspective on the container, so all three cards share one vanishing
              point instead of each folding in its own space. */}
          <div
            className="mt-20 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3"
            style={{ perspective: 1600 }}
          >
            {projects.map((project) => (
              // A real link, so it is crawlable, shareable, and works with
              // middle-click and "open in new tab". The click is intercepted to
              // open the sheet instead of navigating, and the URL is pushed so
              // the case study can still be copied out of the address bar.
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                data-card
                data-cursor
                data-cursor-label="View"
                onClick={(event) => {
                  if (
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.button !== 0
                  ) {
                    return; // let the browser handle new-tab / new-window
                  }
                  event.preventDefault();
                  opener.current = event.currentTarget;
                  window.history.pushState(null, "", `/work/${project.slug}`);
                  didPush.current = true;
                  setActive(project);
                }}
                aria-label={`${project.name} — open case study`}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/70 text-left shadow-[0_24px_60px_rgba(0,0,0,0.6)] transition-colors hover:border-lime-300/40 focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none"
                style={{
                  willChange: "transform",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <div
                    data-media
                    className="absolute inset-0"
                    style={{ willChange: "transform" }}
                  >
                    <Image
                      src={project.cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  {/* A single band of light crossing the card as it lands. */}
                  <span
                    data-sweep
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent"
                  />
                </div>

                {/* The covers are light brand lockups, so the caption sits on its
                    own solid panel rather than floating over white artwork where
                    it was effectively unreadable. */}
                <div className="border-t border-white/10 bg-neutral-950 p-5">
                  <p className="font-mono text-[0.52rem] uppercase tracking-[0.24em] text-neutral-400">
                    {project.category}
                  </p>
                  {/* Real text, not baked into the artwork — the old cards gave
                      assistive tech no project name at all. */}
                  <h3
                    className={`${displayFont.className} mt-1.5 text-lg font-semibold text-white`}
                  >
                    {project.name}
                  </h3>
                  <span className="mt-3 flex items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.2em] text-lime-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    Read the case study
                    <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <CaseStudySheet project={active} onClose={closeSheet} />
      )}
    </>
  );
}
