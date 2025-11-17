"use client";

import { useEffect, useRef } from "react";
import { displayFont } from "@/app/fonts";

export function About() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // ABOUT in view → pin tubes to “about” position
          window.tubesControls?.setMode("about");
        } else {
          // ABOUT out of view (scroll back up) → go back to hero for now
          window.tubesControls?.setMode("hero");
        }
      },
      {
        threshold: 0.4, // adjust how much of About needs to be visible
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center bg-about-ink text-slate-50"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-24 lg:flex-row lg:items-center">
        {/* LEFT COLUMN — COPY */}
        <div className="max-w-xl space-y-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            About Toad Creatives
          </p>

          <h2
            className={`${displayFont.className} text-balance text-4xl font-semibold leading-tight sm:text-5xl`}
          >
            I design{" "}
            <span className="text-lime-300">motion–driven interfaces</span>{" "}
            that feel alive, not loud.
          </h2>

          <p className="max-w-xl text-sm leading-relaxed text-slate-300">
            I'm Pasindu, a developer obsessed with kinetic layouts, subtle
            physics and that sweet spot where nature-inspired motion meets clean
            product thinking. Toad Creatives is my lab for Next.js, WebGL and
            GSAP experiments — refined into production-ready experiences.
          </p>
        </div>

        {/* RIGHT COLUMN — SNAPSHOT / WHAT I DO (keep your existing content) */}
        <div className="w-full max-w-md rounded-3xl bg-[radial-gradient(circle_at_top,#14191f,#05060a)] p-8 shadow-[0_0_120px_rgba(123,255,120,0.15)]">
          {/* ...your snapshot / what I do / how we work blocks... */}
        </div>
      </div>
    </section>
  );
}