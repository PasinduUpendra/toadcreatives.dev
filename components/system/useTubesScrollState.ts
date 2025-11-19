import { useEffect, useState } from "react";

export type TubesMode =
  | "hero"
  | "heroToAbout"
  | "aboutLeft"
  | "aboutRight"
  | "aboutToWork"
  | "work";

export type TubesScrollState = {
  heroProgress: number;
  heroToAboutProgress: number;
  aboutProgress: number;
  aboutToWorkProgress: number;
  workProgress: number;
  mode: TubesMode;
  segmentProgress: number;
};

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function getSectionProgress(el: HTMLElement | null, viewportH: number): number {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  const sectionHeight = rect.height || 1;
  // Progress: 0 when bottom is above viewport, 1 when top is below viewport
  const visible =
    rect.bottom > 0 && rect.top < viewportH;
  if (!visible) return 0;
  const start = Math.max(0, viewportH - rect.top) / (viewportH + sectionHeight);
  const end = Math.max(0, viewportH - rect.bottom) / (viewportH + sectionHeight);
  // Use top-based progress
  const progress = clamp01((viewportH - rect.top) / (viewportH + sectionHeight));
  return progress;
}

export function useTubesScrollState(): TubesScrollState {
  const [progress, setProgress] = useState({
    hero: 0,
    heroToAbout: 0,
    about: 0,
    aboutToWork: 0,
    work: 0,
  });

  useEffect(() => {
    function updateProgress() {
      const viewportH = window.innerHeight || 1;
      const heroEl = document.getElementById("hero");
      const heroToAboutEl = document.getElementById("hero-about-transition");
      const aboutEl = document.getElementById("about");
      const aboutToWorkEl = document.getElementById("about-work-transition");
      const workEl = document.getElementById("work");

      setProgress({
        hero: getSectionProgress(heroEl, viewportH),
        heroToAbout: getSectionProgress(heroToAboutEl, viewportH),
        about: getSectionProgress(aboutEl, viewportH),
        aboutToWork: getSectionProgress(aboutToWorkEl, viewportH),
        work: getSectionProgress(workEl, viewportH),
      });
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const heroProgress = clamp01(progress.hero);
  const heroToAboutProgress = clamp01(progress.heroToAbout);
  const aboutProgress = clamp01(progress.about);
  const aboutToWorkProgress = clamp01(progress.aboutToWork);
  const workProgress = clamp01(progress.work);

  let mode: TubesMode = "hero";
  let segmentProgress = heroProgress;

  if (workProgress > 0.05) {
    mode = "work";
    segmentProgress = workProgress;
  } else if (aboutToWorkProgress > 0.05) {
    mode = "aboutToWork";
    segmentProgress = aboutToWorkProgress;
  } else if (aboutProgress > 0.5) {
    mode = "aboutRight";
    segmentProgress = clamp01((aboutProgress - 0.5) / 0.5);
  } else if (aboutProgress > 0.05) {
    mode = "aboutLeft";
    segmentProgress = aboutProgress;
  } else if (heroToAboutProgress > 0.05) {
    mode = "heroToAbout";
    segmentProgress = heroToAboutProgress;
  } else {
    mode = "hero";
    segmentProgress = heroProgress;
  }

  return {
    heroProgress,
    heroToAboutProgress,
    aboutProgress,
    aboutToWorkProgress,
    workProgress,
    mode,
    segmentProgress,
  };
}
