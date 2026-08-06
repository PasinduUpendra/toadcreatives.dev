export interface ProjectShot {
  src: string;
  /** Video wins when present; the still is used as its poster. */
  video?: string;
  caption: string;
}

export interface Project {
  slug: string;
  name: string;
  title: string;
  category: string;
  year: string;
  role: string;
  /** One or two sentences, shown under the title in the case study. */
  summary: string;
  story: string[];
  cover: string;
  shots: ProjectShot[];
  /** Present when the work is publicly visitable. */
  liveUrl?: string;
}

export const projects: Project[] = [
  {
    slug: "coast-67",
    name: "Coast 67",
    title: "Built in 2024, rebuilt from the ground up in 2026",
    category: "Hotel website · Build & redesign",
    year: "2024 — 2026",
    role: "Creative direction · UX · Front-end",
    cover: "/assets/projects/Work-Coast67.png",
    liveUrl: "https://coast67.com",
    summary:
      "A barefoot-luxe hotel on Kabalana Beach, Sri Lanka. I built the original site in 2024, then two years later tore the design down and rebuilt it — same property, same booking engine, an entirely different experience.",
    story: [
      "The 2024 site did its job. By 2026 the brief had changed: the navigation was tired, the inner pages felt templated, and the client wanted the whole thing to carry the weight of the property rather than describe it. The instruction was blunt — it should look nothing like the old site.",
      "I kept exactly one thing from the old build: the content structure, what each page needs to say. Everything else was rewritten. New copy, new page order, an editorial layout built on whitespace and restraint instead of stacked widgets.",
      "The motion is written by hand — GSAP, ScrollTrigger and Lenis in a WordPress child theme — rather than dropped in from page-builder presets. That distinction is the whole redesign: default animation is what makes a site look templated, and no amount of new photography fixes it.",
      "The constraint that shaped everything: the booking engine had to keep taking reservations throughout. The property never stopped selling rooms, so the rebuild ran on staging and went live in one move.",
    ],
    shots: [
      {
        src: "/assets/projects/Coast67-new-hero.webp",
        caption: "The 2026 rebuild — arrival.",
      },
      {
        src: "/assets/projects/Coast67-new-rooms.webp",
        caption: "Rooms, rebuilt as an editorial spread.",
      },
      {
        src: "/assets/projects/Coast67-1.png",
        caption: "The 2024 build, for comparison.",
      },
    ],
  },
  {
    slug: "b48-studios",
    name: "B48 Studios",
    title: "Leather apparel storefront",
    category: "E-commerce · Brand site",
    year: "2024",
    role: "UX · Visual design · Front-end",
    cover: "/assets/projects/Work-B48.png",
    summary:
      "A storefront for a leather label, built to make material read through a screen and to get out of the way at checkout.",
    story: [
      "B48 sells on texture. The whole visual system leans on tight crops and macro photography so grain and stitching carry the product where a flat catalogue shot would not.",
      "I cut the information architecture down to a few strong categories and rebuilt the product cards and PDP around material, fit and silhouette. Motion is deliberately minimal — enough to confirm a tap, never enough to comment on itself.",
      "The WooCommerce checkout was where the drop-off lived, so field layout, error states and step order were rebuilt around getting through it quickly.",
    ],
    shots: [
      {
        src: "/assets/projects/B48Studio-2.png",
        video: "/assets/projects/B48Studio-1.webm",
        caption: "Landing experience and featured pieces.",
      },
      { src: "/assets/projects/B48Studio-2.png", caption: "Products page, WooCommerce." },
    ],
  },
  {
    slug: "elitetapp",
    name: "EliteTapp",
    title: "NFC sharing product and app ecosystem",
    category: "Product design · Mobile app",
    year: "2023",
    role: "Tech lead · Product design",
    cover: "/assets/projects/Work-EliteTapp.png",
    summary:
      "One tap to hand over your digital identity — a Flutter app, the backend behind it, and a store selling the physical cards.",
    story: [
      "EliteTapp started as a single idea: make sharing who you are take one tap. Turning that into a product meant leading a team across backend, frontend and design rather than building it alone.",
      "I set the technical direction — Flutter, so one codebase covered both platforms and the design system stayed honest — then architected the services behind profile creation, NFC handling, link routing and live updates across devices.",
      "The app needed something to tap. I built the Shopify store from scratch so the cards and tags could be bought and activated in one continuous flow, instead of a purchase in one place and a setup in another.",
    ],
    shots: [
      {
        src: "/assets/projects/EliteTapp-2.png",
        video: "/assets/projects/EliteTapp-1.webm",
        caption: "Dashboard and key actions.",
      },
      { src: "/assets/projects/EliteTapp-2.png", caption: "Guest access and device management." },
    ],
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
