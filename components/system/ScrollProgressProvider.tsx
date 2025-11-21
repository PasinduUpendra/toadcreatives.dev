// FILE: components/system/ScrollProgressProvider.tsx
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  SCROLL_STEPS,
  MIN_SCROLL_STEP_INDEX,
  MAX_SCROLL_STEP_INDEX,
  ScrollStep,
} from "./scrollTimeline";

type ScrollDirection = "up" | "down" | "none";

type ScrollContextValue = {
  stepIndex: number;
  step: ScrollStep;
  direction: ScrollDirection;
  goToStep: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
};

const ScrollContext = createContext<ScrollContextValue | null>(null);

// How much wheel delta we require before advancing a step
const SCROLL_THRESHOLD = 120; // tweak: higher = needs more scroll
const TOUCH_THRESHOLD = 40;   // px finger travel for a step
// How long we "lock" the stepper while section animations play
const STEP_COOLDOWN_MS = 650;

export const ScrollProgressProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [direction, setDirection] = useState<ScrollDirection>("none");

  const isLockedRef = useRef(false);
  const wheelAccumRef = useRef(0);
  const touchStartYRef = useRef(0);

  const goToStep = useCallback((index: number) => {
    setStepIndex((prev) => {
      const clamped = Math.min(
        MAX_SCROLL_STEP_INDEX,
        Math.max(MIN_SCROLL_STEP_INDEX, index)
      );
      if (clamped > prev) setDirection("down");
      else if (clamped < prev) setDirection("up");
      else setDirection("none");
      return clamped;
    });
  }, []);

  const goNext = useCallback(() => {
    goToStep(stepIndex + 1);
  }, [goToStep, stepIndex]);

  const goPrev = useCallback(() => {
    goToStep(stepIndex - 1);
  }, [goToStep, stepIndex]);

  const lockStepper = useCallback(() => {
    isLockedRef.current = true;
    window.setTimeout(() => {
      isLockedRef.current = false;
      wheelAccumRef.current = 0;
    }, STEP_COOLDOWN_MS);
  }, []);

  // Always start at hero_intro on mount (even after Fast Refresh)
  useEffect(() => {
    goToStep(0);
  }, [goToStep]);

  // Wheel + touch handlers (stepper behaviour)
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // We fully own scrolling on this page
      event.preventDefault();

      if (isLockedRef.current) return;

      wheelAccumRef.current += event.deltaY;

      if (wheelAccumRef.current > SCROLL_THRESHOLD) {
        goNext();
        lockStepper();
      } else if (wheelAccumRef.current < -SCROLL_THRESHOLD) {
        goPrev();
        lockStepper();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartYRef.current = touch.clientY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (isLockedRef.current) return;

      const touch = event.changedTouches[0];
      if (!touch) return;

      const delta = touchStartYRef.current - touch.clientY;
      if (Math.abs(delta) < TOUCH_THRESHOLD) return;

      if (delta > 0) {
        goNext();
      } else {
        goPrev();
      }
      lockStepper();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      document.body.style.overflow = originalOverflow;
    };
  }, [goNext, goPrev, lockStepper]);

  const value: ScrollContextValue = {
    stepIndex,
    step: SCROLL_STEPS[stepIndex],
    direction,
    goToStep,
    goNext,
    goPrev,
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
