"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SCROLL_STEPS,
  MIN_SCROLL_STEP_INDEX,
  MAX_SCROLL_STEP_INDEX,
  type ScrollStep,
} from "./scrollTimeline";

type Direction = "up" | "down" | "none";

interface ScrollContextValue {
  step: ScrollStep;
  index: number;
  direction: Direction;
  goToIndex: (index: number) => void;
}

const ScrollContext = createContext<ScrollContextValue | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

const clampIndex = (value: number): number => {
  if (value < MIN_SCROLL_STEP_INDEX) return MIN_SCROLL_STEP_INDEX;
  if (value > MAX_SCROLL_STEP_INDEX) return MAX_SCROLL_STEP_INDEX;
  return value;
};

export const ScrollProgressProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [index, setIndex] = useState<number>(0);
  const [direction, setDirection] = useState<Direction>("none");

  const indexRef = useRef<number>(0);

  // Hard step lock: while true, wheel cannot change the step.
  const isSteppingRef = useRef<boolean>(false);
  const stepTimeoutRef = useRef<number | null>(null);

  const DEADZONE = 5;       // ignore tiny jitter
  const STEP_DELAY = 600;   // ms between allowed steps – tune to taste
  const TOUCH_THRESHOLD = 50; // minimum swipe distance in pixels

  // Touch handling state
  const touchStartYRef = useRef<number | null>(null);
  const shouldHijackTouchRef = useRef<boolean>(false);

  /**
   * Helper to determine if a touch gesture should be allowed to scroll normally
   * (i.e., we should NOT hijack it for section stepping).
   * Returns true if the target is inside a scrollable region or is a form control.
   */
  const isGestureInsideScrollableRegion = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;

    let el: HTMLElement | null = target;

    // Walk up the DOM tree to check for exemptions
    while (el && el !== document.body) {
      // 1. Check for explicit opt-in via data attribute
      if (el.dataset.allowScroll === "true") {
        return true;
      }

      // 2. Check if it's a native form control that should always work
      const tagName = el.tagName.toLowerCase();
      if (["input", "textarea", "select", "button", "a"].includes(tagName)) {
        return true;
      }

      // 3. Check if element is actually scrollable
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        // Verify it has scrollable content
        if (el.scrollHeight > el.clientHeight) {
          return true;
        }
      }

      el = el.parentElement;
    }

    return false;
  };

  const updateIndex = (next: number) => {
    const clamped = clampIndex(next);
    indexRef.current = clamped;
    setIndex(clamped);
  };

  const unlockStep = () => {
    isSteppingRef.current = false;
    if (stepTimeoutRef.current !== null) {
      window.clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleWheel = (event: WheelEvent) => {
      const deltaY = event.deltaY;
      if (Math.abs(deltaY) < DEADZONE) return;

      // We fully own scroll.
      event.preventDefault();

      // If a step is currently animating / locked, ignore everything.
      if (isSteppingRef.current) {
        return;
      }

      const dir: Direction = deltaY > 0 ? "down" : "up";
      const current = indexRef.current;
      const next = clampIndex(current + (dir === "down" ? 1 : -1));

      // At bounds → nothing to do; don’t change direction (prevents hero flicker).
      if (next === current) return;

      // Commit single step.
      isSteppingRef.current = true;
      setDirection(dir);
      updateIndex(next);

      // Keep real page scroll pinned.
      window.scrollTo({ top: 0, left: 0 });

      // Unlock after STEP_DELAY so another wheel can trigger next step.
      if (stepTimeoutRef.current !== null) {
        window.clearTimeout(stepTimeoutRef.current);
      }
      stepTimeoutRef.current = window.setTimeout(unlockStep, STEP_DELAY);
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        // Check if this gesture should be hijacked for section stepping
        const shouldHijack = !isGestureInsideScrollableRegion(event.target);
        shouldHijackTouchRef.current = shouldHijack;

        if (shouldHijack) {
          touchStartYRef.current = event.touches[0].clientY;
        } else {
          touchStartYRef.current = null;
        }
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      // Only prevent default scrolling if we're hijacking this gesture for section stepping
      if (shouldHijackTouchRef.current) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      // If we're not hijacking this touch, ignore it
      if (!shouldHijackTouchRef.current) {
        touchStartYRef.current = null;
        shouldHijackTouchRef.current = false;
        return;
      }

      if (touchStartYRef.current === null || event.changedTouches.length === 0) {
        shouldHijackTouchRef.current = false;
        return;
      }

      const touchEndY = event.changedTouches[0].clientY;
      const deltaY = touchStartYRef.current - touchEndY;

      // Reset touch state
      touchStartYRef.current = null;
      shouldHijackTouchRef.current = false;

      // Check if swipe is significant enough
      if (Math.abs(deltaY) < TOUCH_THRESHOLD) {
        return;
      }

      // If a step is currently animating / locked, ignore
      if (isSteppingRef.current) {
        return;
      }

      const dir: Direction = deltaY > 0 ? "down" : "up";
      const current = indexRef.current;
      const next = clampIndex(current + (dir === "down" ? 1 : -1));

      // At bounds → nothing to do
      if (next === current) return;

      // Commit single step
      isSteppingRef.current = true;
      setDirection(dir);
      updateIndex(next);

      // Keep real page scroll pinned
      window.scrollTo({ top: 0, left: 0 });

      // Unlock after STEP_DELAY
      if (stepTimeoutRef.current !== null) {
        window.clearTimeout(stepTimeoutRef.current);
      }
      stepTimeoutRef.current = window.setTimeout(unlockStep, STEP_DELAY);
    };

    // Add event listeners for both wheel and touch
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Disable native scroll globally.
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      unlockStep();
    };
  }, []);

  const goToIndex = (target: number) => {
    const clamped = clampIndex(target);
    const prev = indexRef.current;

    if (clamped === prev) {
      setDirection("none");
      return;
    }

    const dir: Direction = clamped > prev ? "down" : "up";

    // Lock briefly so nav jump isn’t immediately overridden by wheel momentum.
    isSteppingRef.current = true;
    if (stepTimeoutRef.current !== null) {
      window.clearTimeout(stepTimeoutRef.current);
    }
    stepTimeoutRef.current = window.setTimeout(unlockStep, STEP_DELAY);

    setDirection(dir);
    updateIndex(clamped);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0 });
    }
  };

  const step: ScrollStep = SCROLL_STEPS[index];

  const value: ScrollContextValue = {
    step,
    index,
    direction,
    goToIndex,
  };

  return (
    <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
  );
};

export const useScrollSteps = (): ScrollContextValue => {
  const ctx = useContext(ScrollContext);
  if (!ctx) {
    throw new Error("useScrollSteps must be used within ScrollProgressProvider");
  }
  return ctx;
};
export const useScrollProgress = (): ScrollStep => {
  const { step } = useScrollSteps();
  return step;
};