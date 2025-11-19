export type TubesMode =
  | "follow"
  | "drift-left"
  | "fixed-left"
  | "glide-right"
  | "hidden";

export type TimelineSection =
  | "hero"
  | "transition-to-about"
  | "about"
  | "what-we-do"
  | "works-transition";

export interface ScrollTimelineState {
  scroll: number;
  section: TimelineSection;
  paragraphId?: number;
  mode: TubesMode;
  positionX: number;
  recolor: number;
  dim: number;
}

const sectionRanges: Array<{
  start: number;
  end: number;
  section: TimelineSection;
}> = [
  { start: 0, end: 0.2, section: "hero" },
  { start: 0.2, end: 0.3, section: "transition-to-about" },
  { start: 0.3, end: 0.6, section: "about" },
  { start: 0.6, end: 0.8, section: "what-we-do" },
  { start: 0.8, end: 1, section: "works-transition" },
];

const paragraphRanges: Array<{
  start: number;
  end: number;
  paragraphId: number;
}> = [
  { start: 0.3, end: 0.4, paragraphId: 1 },
  { start: 0.4, end: 0.5, paragraphId: 2 },
  { start: 0.5, end: 0.6, paragraphId: 3 },
  { start: 0.6, end: 0.7, paragraphId: 4 },
  { start: 0.7, end: 0.8, paragraphId: 6 },
  { start: 0.8, end: 0.9, paragraphId: 7 },
];

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function resolveSection(scroll: number): TimelineSection {
  const found =
    sectionRanges.find(
      ({ start, end }) => scroll >= start && scroll < end
    ) ?? sectionRanges[sectionRanges.length - 1];
  return found.section;
}

function resolveParagraph(scroll: number): number | undefined {
  return paragraphRanges.find(
    ({ start, end }) => scroll >= start && scroll < end
  )?.paragraphId;
}

function resolveTubesState(scroll: number) {
  if (scroll < 0.2) {
    return {
      mode: "follow" as const,
      positionX: 0,
      recolor: 0,
      dim: 0,
    };
  }

  if (scroll < 0.3) {
    const t = (scroll - 0.2) / 0.1;
    return {
      mode: "drift-left" as const,
      positionX: lerp(0, -0.7, t),
      recolor: lerp(0, 1, t),
      dim: 0,
    };
  }

  if (scroll < 0.6) {
    return {
      mode: "fixed-left" as const,
      positionX: -0.8,
      recolor: 1,
      dim: 0,
    };
  }

  if (scroll < 0.8) {
    const t = (scroll - 0.6) / 0.2;
    return {
      mode: "glide-right" as const,
      positionX: lerp(-0.8, 0.8, t),
      recolor: 1,
      dim: 0,
    };
  }

  if (scroll < 0.9) {
    const t = (scroll - 0.8) / 0.1;
    return {
      mode: "glide-right" as const,
      positionX: 0.8,
      recolor: 1,
      dim: lerp(0, 1, t),
    };
  }

  return {
    mode: "hidden" as const,
    positionX: 0.8,
    recolor: 1,
    dim: 1,
  };
}

export function getScrollTimelineState(
  inputScroll: number
): ScrollTimelineState {
  const scroll = clamp01(inputScroll);
  const section = resolveSection(scroll);
  const paragraphId = resolveParagraph(scroll);
  const tubes = resolveTubesState(scroll);

  return {
    scroll,
    section,
    paragraphId,
    ...tubes,
  };
}
