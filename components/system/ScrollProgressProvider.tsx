"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const ScrollProgressContext = createContext<number | undefined>(undefined);

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function ScrollProgressProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress =
        scrollable <= 0 ? 0 : clamp01(scrollTop / scrollable || 0);
      setScrollProgress(progress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const value = useMemo(() => scrollProgress, [scrollProgress]);

  return (
    <ScrollProgressContext.Provider value={value}>
      {children}
    </ScrollProgressContext.Provider>
  );
}

export function useScrollProgress() {
  const context = useContext(ScrollProgressContext);
  if (context === undefined) {
    throw new Error(
      "useScrollProgress must be used within a ScrollProgressProvider"
    );
  }
  return context;
}
