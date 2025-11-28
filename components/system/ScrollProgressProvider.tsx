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

    window.addEventListener("wheel", handleWheel, { passive: false });

    // Disable native scroll globally.
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("wheel", handleWheel);
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
