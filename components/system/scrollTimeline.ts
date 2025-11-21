export type ScrollStep =
  | "hero_intro"
  | "about_intro"
  | "about_p1"
  | "about_p2"
  | "about_p3"
  | "what_intro"
  | "what_p1"
  | "what_p2"
  | "what_p3"
  | "work_intro";

export const SCROLL_STEPS: ScrollStep[] = [
  "hero_intro",
  "about_intro",
  "about_p1",
  "about_p2",
  "about_p3",
  "what_intro",
  "what_p1",
  "what_p2",
  "what_p3",
  "work_intro",
];

export const MIN_SCROLL_STEP_INDEX = 0;
export const MAX_SCROLL_STEP_INDEX = SCROLL_STEPS.length - 1;
