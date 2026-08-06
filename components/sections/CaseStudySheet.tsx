"use client";

import { useCallback, useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { displayFont } from "@/app/fonts";
import { setScrollLocked } from "@/components/system/SmoothScroll";
import CaseStudyBody from "@/components/work/CaseStudyBody";
import type { Project } from "@/content/projects";

const DISMISS_DISTANCE = 130;
const DISMISS_VELOCITY = 0.55;
const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

interface CaseStudySheetProps {
  project: Project;
  onClose: () => void;
}

/**
 * The case study, as a sheet.
 *
 * Replaces an overlay that centred 988px of content inside a 677px viewport with
 * `overflow: visible`, clipping 131px off the top and 179px off the bottom with
 * no way to reach either. Everything here lives in one scroll container, the
 * close control sits inside the sheet where the fixed nav cannot cover it, and
 * the panel is layered above the nav rather than beneath it.
 */
export default function CaseStudySheet({
  project,
  onClose,
}: CaseStudySheetProps) {
  const sheet = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const drag = useRef({ startY: 0, startTime: 0, dragging: false });
  const restoreFocus = useRef<HTMLElement | null>(null);

  const dismiss = useCallback(() => {
    const el = sheet.current;
    if (!el || prefersReducedMotion()) return onClose();
    gsap.to(backdrop.current, {
      autoAlpha: 0,
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(el, {
      yPercent: 100,
      duration: 0.38,
      ease: "power3.in",
      onComplete: onClose,
    });
  }, [onClose]);

  // Entrance, scroll lock, focus handling and Escape all belong to the lifetime
  // of the open sheet, so they live together.
  useEffect(() => {
    const el = sheet.current;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    setScrollLocked(true);
    // The sheet already layers above the nav, but leaving a menu button floating
    // over a case study is noise. It also stops the nav being a tab target from
    // inside the dialog.
    document.documentElement.dataset.sheetOpen = "true";

    const reduced = prefersReducedMotion();
    // Scoped to a context so every tween is killed and reverted on cleanup.
    // Without it, React re-running this effect (Strict Mode does exactly that)
    // left `gsap.from` reading a half-finished opacity as its target, so the
    // article settled at ~3% opacity and looked like an unlit page.
    const ctx = gsap.context(() => {
      if (!el || reduced) return;
      gsap.fromTo(
        backdrop.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, ease: "power2.out" },
      );
      gsap.fromTo(
        el,
        { yPercent: 100 },
        { yPercent: 0, duration: 0.7, ease: "expo.out" },
      );
      // fromTo, never from: both ends are stated outright, so a re-run cannot
      // inherit a transient value as the destination.
      gsap.fromTo(
        el.querySelectorAll("[data-stagger]"),
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.06,
          delay: 0.18,
          ease: "expo.out",
        },
      );

    }, el ?? undefined);

    // Move focus into the dialog so keyboard and screen-reader users are not
    // left behind on the page underneath.
    el?.querySelector<HTMLElement>("[data-close]")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== "Tab" || !el) return;
      const items = Array.from(
        el.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Kill the entrance tweens rather than leaving them mid-flight.
      ctx.revert();
      setScrollLocked(false);
      delete document.documentElement.dataset.sheetOpen;
      restoreFocus.current?.focus?.();
    };
  }, [dismiss]);

  const onScroll = () => {
    const el = body.current;
    const bar = progress.current;
    if (!el || !bar) return;
    const max = el.scrollHeight - el.clientHeight;
    gsap.set(bar, { scaleX: max > 0 ? el.scrollTop / max : 0 });
  };

  // Drag-to-dismiss only engages from the top of the article, so pulling down
  // mid-read scrolls the text instead of fighting the sheet.
  const onPointerDown = (event: React.PointerEvent) => {
    // Never start a drag on a control. The header captures the pointer, and
    // capturing it from a button swallows the click that follows — which is
    // exactly what stopped Close from working.
    if ((event.target as HTMLElement).closest("button")) return;
    if ((body.current?.scrollTop ?? 0) > 0) return;
    drag.current = {
      startY: event.clientY,
      startTime: performance.now(),
      dragging: true,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current.dragging || !sheet.current) return;
    const delta = event.clientY - drag.current.startY;
    if (delta < 0) return;
    // Resistance rather than 1:1 tracking, so the sheet feels weighted.
    gsap.set(sheet.current, { y: delta * 0.5 });
    gsap.set(backdrop.current, { autoAlpha: Math.max(0.25, 1 - delta / 420) });
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (!drag.current.dragging || !sheet.current) return;
    drag.current.dragging = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    const delta = event.clientY - drag.current.startY;
    const velocity =
      delta / Math.max(1, performance.now() - drag.current.startTime);

    if (delta > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
      gsap.to(backdrop.current, { autoAlpha: 0, duration: 0.28 });
      gsap.to(sheet.current, {
        y: window.innerHeight,
        duration: 0.32,
        ease: "power3.in",
        onComplete: onClose,
      });
    } else {
      gsap.to(sheet.current, {
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.7)",
      });
      gsap.to(backdrop.current, { autoAlpha: 1, duration: 0.3 });
    }
  };

  return (
    // z-100 clears the fixed nav at z-90; the old overlay sat at z-50 and the
    // hamburger rendered on top of the case study.
    <div className="fixed inset-0 z-100">
      <div
        ref={backdrop}
        onClick={dismiss}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        aria-hidden="true"
      />

      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        className="absolute inset-x-0 bottom-0 flex h-[94dvh] flex-col overflow-hidden rounded-t-[28px] border-t border-white/15 bg-[#080a08] shadow-[0_-30px_90px_rgba(0,0,0,0.75)] sm:inset-x-4 sm:bottom-4 sm:h-[92dvh] sm:rounded-[28px] sm:border lg:inset-x-auto lg:right-4 lg:bottom-4 lg:top-4 lg:h-auto lg:w-[min(900px,60vw)]"
      >
        <span
          ref={progress}
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-lime-300"
        />

        <header
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="shrink-0 touch-none border-b border-white/10 px-5 pt-3 pb-4 sm:px-8"
        >
          <span
            aria-hidden="true"
            className="mx-auto block h-1 w-10 rounded-full bg-white/25 lg:hidden"
          />
          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-lime-300">
                Case study · {project.year}
              </p>
              <p
                className={`${displayFont.className} truncate text-lg font-semibold text-white`}
              >
                {project.name}
              </p>
            </div>
            <button
              data-close
              type="button"
              onClick={dismiss}
              data-cursor
              data-cursor-label="Close"
              className="shrink-0 rounded-full border border-white/25 px-4 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none"
            >
              Close
            </button>
          </div>
        </header>

        {/* One scroll container for the whole article. data-lenis-prevent stops
            the page scroller from stealing the gesture. */}
        <div
          ref={body}
          onScroll={onScroll}
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-16 sm:px-8"
        >
          <div className="mt-8">
            {/* Same markup the /work/<slug> route renders, so the shareable
                page and the modal can never disagree. */}
            <CaseStudyBody
              project={project}
              as="h2"
              stagger
              headingId="case-study-title"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
