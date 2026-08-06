import type { ComponentType } from "react";

import TubeBehaviours from "./demos/TubeBehaviours";
import TextScrubSweep from "./demos/TextScrubSweep";
import NavHoverSwap from "./demos/NavHoverSwap";
import CursorField from "./demos/CursorField";
import WorkCardHinge from "./demos/WorkCardHinge";
import TextBlurSettle from "./demos/TextBlurSettle";
import TextMaskLines from "./demos/TextMaskLines";
import TextScramble from "./demos/TextScramble";
import TextWeightWave from "./demos/TextWeightWave";
import NavTakeover from "./demos/NavTakeover";
import NavProgressSpine from "./demos/NavProgressSpine";
import NavTubeTether from "./demos/NavTubeTether";
import TransitionDepthStack from "./demos/TransitionDepthStack";
import TransitionLightShutter from "./demos/TransitionLightShutter";
import TransitionPinnedScrub from "./demos/TransitionPinnedScrub";
import LoadKnotRelease from "./demos/LoadKnotRelease";
import LoadStrokeDraw from "./demos/LoadStrokeDraw";
import WorkShaderCards from "./demos/WorkShaderCards";
import WorkFlipCase from "./demos/WorkFlipCase";
import WorkMarqueeRail from "./demos/WorkMarqueeRail";
import WorkMobileSheet from "./demos/WorkMobileSheet";

export interface DemoProps {
  replayKey: number;
}

export interface Demo {
  id: string;
  code: string;
  name: string;
  group: string;
  /** Which of Pasindu's seven asks this answers. */
  answers: string;
  note: string;
  component: ComponentType<DemoProps>;
  /** Demos that only make sense at phone width open in the mobile frame. */
  prefersMobile?: boolean;
}

export const GROUPS = [
  "Answers",
  "Field",
  "Text",
  "Navigation",
  "Cursor",
  "Transitions",
  "Loading",
  "Work",
] as const;

export const demos: Demo[] = [
  {
    id: "text-scrub-sweep",
    code: "A1",
    name: "Scrub Sweep",
    group: "Answers",
    answers: "Ask 2 — the Trionn about-section reveal",
    note: "This is the effect you pointed at, rebuilt from measurement rather than impression. On trionn.com the heading sits at rgba(216,216,216,0.1) and each character's colour alpha is driven 0.1 → 1.0, staggered along the sentence and scrubbed against scroll position — transform and filter stay untouched, which is why it reads as light moving across the line instead of text flying in. Sampled at four scroll positions their chars went 0.125 / 1.0 / 1.0 / 1.0 as the wave passed. 'Toad sweep' is the same mechanism with the leading edge passing through your lime before settling to white, so it is yours rather than a copy. 'Current site' is today's triggered word-stagger: watch the progress readout — the sweep tracks scroll continuously and reverses when you scroll back up, the current one only ever fires once.",
    component: TextScrubSweep,
  },
  {
    id: "nav-hover-swap",
    code: "A2",
    name: "Hover Swap",
    group: "Answers",
    answers: "Ask 1 — hover effect on nav buttons",
    note: "Trionn's nav hover, measured frame by frame: each link holds two stacked copies of the word, split per character. On hover the visible copy dissolves to a 5px blur while fading out (0–200ms, staggered per char), and the hidden copy resolves in crisp behind it (200–600ms, same stagger). No transforms at all — only filter and opacity — so it costs nothing over a live WebGL canvas. 'Toad swap' lands the replacement word in your lime and cools it to white. Keyboard focus drives it too, which the current hover cannot do. Shown in both placements: the top bar and the menu panel.",
    component: NavHoverSwap,
  },
  {
    id: "cursor-field",
    code: "A3",
    name: "Magnetic Cursor",
    group: "Cursor",
    answers: "Ask 1 — cursor hover states",
    note: "Three fixes in one. Targets pull toward the pointer and the ring is pulled toward them, so hovering feels like a magnet catching rather than a box lighting up — and distance is measured to the element's edge, not its centre, so wide buttons attract evenly along their whole length. The ring animates scale, never width/height, which is what the current cursor tweens on every frame. And capability is detected with '(pointer: fine) and (hover: hover)' instead of 'ontouchstart', which today hides the cursor on any touch-capable laptop while CSS still sets cursor:none — leaving those machines with no pointer at all. The label names the action: Go, Menu, View, Send.",
    component: CursorField,
  },
  {
    id: "work-card-hinge",
    code: "A4",
    name: "Card Hinge",
    group: "Answers",
    answers: "Ask 5 — Work section animation",
    note: "Trionn's project cards enter on rotateX(-92deg) → 0 with transform-origin at 50% 0%, so each card swings down on its own top edge. Perspective sits on the grid container, so all three share one vanishing point instead of folding in separate spaces. Toggle to 'Current site' for today's y+scale fade. Also note the project name is real text over the artwork here — today it exists only baked into the background image, which is why the live cards read to a screen reader as 'Hotel website · Interaction design, View project story' with no project name anywhere.",
    component: WorkCardHinge,
  },
  {
    id: "tube-behaviours",
    code: "F",
    name: "10 Field Behaviours",
    group: "Field",
    answers: "Ask 1 — beyond cursor-follow",
    note: "One engine, ten physical behaviours — switch them with the row along the bottom. Comb parts like grass and springs back. Rope is real Verlet integration with weight (hold the mouse down and drag it). Field Lines treats the buttons as magnetic charges, so hovering one reorganises the whole field. Velocity Draw makes speed the input and form the output. Formation assembles the strands into the wordmark. Ink Flow is divergence-free curl noise you inject vorticity into. Weave threads the strands in front of AND behind the headline. Tear ruptures on click and knits back. Cable Route plugs a strand into whatever you hover. Orbit is what you have today, for comparison.",
    component: TubeBehaviours,
  },
  {
    id: "text-blur-settle",
    code: "X1",
    name: "Blur Settle",
    group: "Text",
    answers: "Ask 3 — text contents",
    note: "Characters resolve in random order out of a 12px blur rather than sweeping left to right. The randomness is what stops it reading as a typewriter. willChange is added for the tween and removed on completion, so you never keep 60 permanent GPU layers.",
    component: TextBlurSettle,
  },
  {
    id: "text-mask-lines",
    code: "X2",
    name: "Mask Line Rise",
    group: "Text",
    answers: "Ask 3 — text contents",
    note: "Lines rise out of a clipping mask with a hairline rule drawing beneath each one as it lands. Calmer than X1 and better for body copy — this is what the About and service paragraphs would use.",
    component: TextMaskLines,
  },
  {
    id: "text-scramble",
    code: "X3",
    name: "Decode Scramble",
    group: "Text",
    answers: "Ask 3 — text contents",
    note: "Monospace scramble that resolves to the final string. Built for the stat row and eyebrow labels. The numbers shown are PLACEHOLDERS until you send me the real ones.",
    component: TextScramble,
  },
  {
    id: "text-weight-wave",
    code: "X4",
    name: "Weight Wave",
    group: "Text",
    answers: "Ask 3 — text contents",
    note: "The headline gains weight under your cursor along the variable font's wght axis. The type is alive without anything moving. Needs the variable font — I already switched app/fonts.ts to load it, which also cut four static font files down to one.",
    component: TextWeightWave,
  },
  {
    id: "nav-takeover",
    code: "N1",
    name: "Takeover Menu",
    group: "Navigation",
    answers: "Ask 1 — navigation animation",
    note: "The two bars morph into an X, the panel wipes in from the right, and each item's characters rise out of a mask. Hovering an item brings up a full-bleed preview behind the type. The lime dot marks where you currently are — something the site has never told you.",
    component: NavTakeover,
  },
  {
    id: "nav-progress-spine",
    code: "N2",
    name: "Progress Spine",
    group: "Navigation",
    answers: "Ask 1 — navigation animation",
    note: "A rail on the right edge that fills as you scroll, with labels that unfurl on hover and jump on click. Quiet, always-on orientation. Pairs well with N1 rather than competing — N1 is the destination, this is the compass.",
    component: NavProgressSpine,
  },
  {
    id: "nav-tube-tether",
    code: "N3",
    name: "Tube Tether",
    group: "Navigation",
    answers: "Ask 1 — navigation animation",
    note: "Your existing tubes, rebuilt as a first-party three.js scene, physically bending toward the menu button as you approach it. Open the menu and the field flattens into a band behind the panel. This is the demo that proves the WebGL port: the vendored bundle cannot do any of this.",
    component: NavTubeTether,
  },
  {
    id: "transition-pinned-scrub",
    code: "T3",
    name: "Pinned Scrub Scenes",
    group: "Transitions",
    answers: "Ask 2 — scroll reveals",
    note: "The proposed architecture, running for real: Lenis stepped by gsap.ticker, ScrollTrigger pinning each scene and scrubbing its content against scroll position. Toggle to 'Current site' to feel the 600ms lockout you have today. Watch the progress readout — proposed moves continuously, current only ever reads 0.",
    component: TransitionPinnedScrub,
  },
  {
    id: "transition-depth-stack",
    code: "T1",
    name: "Depth Stack",
    group: "Transitions",
    answers: "Ask 2 — scroll reveals",
    note: "Outgoing recedes on Z with blur while incoming rises with counter-parallax on its contents. One continuous 3D space instead of fade-out then fade-in. Scroll inside the frame or use the arrows.",
    component: TransitionDepthStack,
  },
  {
    id: "transition-light-shutter",
    code: "T2",
    name: "Light Shutter",
    group: "Transitions",
    answers: "Ask 2 — scroll reveals",
    note: "The light strands gather into a tight band, sweep across as a travelling crest, and that crest is what uncovers the next section. Your signature element performs the transition instead of sitting behind it.",
    component: TransitionLightShutter,
  },
  {
    id: "load-knot-release",
    code: "L1",
    name: "Knot Release",
    group: "Loading",
    answers: "Loading effect",
    note: "The counter is not a fake timer — it streams the real assets and counts the bytes that actually arrive. The strands hold a braided knot while loading, then unravel outward and hand straight off to the hero. No loading card fading out over a separate page.",
    component: LoadKnotRelease,
  },
  {
    id: "load-stroke-draw",
    code: "L2",
    name: "Stroke Loader",
    group: "Loading",
    answers: "Loading effect",
    note: "Your logo's stroke draw becomes the progress bar itself — DrawSVG stroke length bound to load percentage, so the mark completing and the site being ready are the same moment. Then it floods to fill and the shutters split. Quieter than L1 and much cheaper.",
    component: LoadStrokeDraw,
  },
  {
    id: "work-flip-case",
    code: "W2",
    name: "FLIP Case Study",
    group: "Work",
    answers: "Asks 4 + 5 — Work section",
    note: "The card's image is the same DOM node before and after, so GSAP Flip tweens it into the case-study header. The thing you clicked becomes the thing you're reading, instead of today's unrelated fade. Escape closes it.",
    component: WorkFlipCase,
  },
  {
    id: "work-shader-cards",
    code: "W1",
    name: "Shader Cards",
    group: "Work",
    answers: "Asks 4 + 5 — Work section",
    note: "A real WebGL fragment shader per hovered card: a ripple centred on your pointer with the colour channels pulled apart along the wave. Also note the project name is real text over the image — today the names exist only baked into the artwork, which is why screen readers hear three identical buttons.",
    component: WorkShaderCards,
  },
  {
    id: "work-marquee-rail",
    code: "W3",
    name: "Marquee Rail",
    group: "Work",
    answers: "Asks 4 + 5 — Work section",
    note: "An endless rail of outlined project names that slows as you approach it; hovering one fills the type and brings its image up from a blurred greyscale state. Scales past three projects, which the current 3-card grid does not.",
    component: WorkMarqueeRail,
  },
  {
    id: "work-mobile-sheet",
    code: "W4",
    name: "Mobile Sheet",
    group: "Work",
    answers: "Ask 4 — mobile case study",
    note: "The direct fix for the broken overlay. Full-height sheet, drag the handle to dismiss with rubber-band resistance and velocity detection, snap-scrolling gallery, sticky header, and the close button inside the sheet where the nav can't sit on top of it. Drag only takes over when the article is already scrolled to the top. Open it in the MOBILE frame.",
    component: WorkMobileSheet,
    prefersMobile: true,
  },
];

export const demoById = (id: string) => demos.find((d) => d.id === id);
