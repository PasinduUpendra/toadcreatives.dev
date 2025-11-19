export type NarrativeParagraphId = 1 | 2 | 3 | 4 | 6 | 7;

interface NarrativeCopy {
  title: string;
  body: string;
}

export const narrativeParagraphs: Record<
  NarrativeParagraphId,
  NarrativeCopy
> = {
  1: {
    title: "Origins",
    body: "We grew up studying how wetlands breathe — those slow gradients, sudden sparks, and gentle spirals. Toad Creatives borrows from that bioluminescent logic to craft interfaces that feel organic instead of ornamental.",
  },
  2: {
    title: "Principles",
    body: "Nature × technology is more than an aesthetic. It is the discipline of orchestrating force, stillness, and light so every motion has intent. We remove decoration until only behaviors that guide, respond, and reward remain.",
  },
  3: {
    title: "Practice",
    body: "Research, sketch, simulate, refine: we cycle motion ideas through code prototypes until the physics matches the story. When the choreography is right, we layer in typography, systems, and production constraints.",
  },
  4: {
    title: "Capabilities",
    body: "We design and build reactive launch sites, interactive films, and WebGL canvases that sync with editorial layouts. Strategy, art direction, and development stay within one small team so the motion logic never fractures.",
  },
  6: {
    title: "Process",
    body: "Every engagement starts with a scroll map like this one — mapping beats, friction, and delight onto a single normalized curve. That shared spine keeps product, marketing, and engineering aligned from the first sketch to the QA checklist.",
  },
  7: {
    title: "Toward the Work",
    body: "By the time we lead you into case studies, the tubes have dimmed and the interface takes over. Each project is choreographed around the same continuum: narrative momentum that ends where the work begins.",
  },
};
