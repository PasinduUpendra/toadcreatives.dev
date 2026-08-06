/** Trimmed project set for the lab demos. The real one moves to content/projects.ts in Phase 2. */
export interface LabProject {
  id: string;
  name: string;
  title: string;
  category: string;
  year: string;
  role: string;
  summary: string;
  cover: string;
  shots: string[];
}

export const labProjects: LabProject[] = [
  {
    id: "coast67",
    name: "Coast 67",
    title: "Oceanfront motion hotel website",
    category: "Hotel website · Interaction design",
    year: "2024",
    role: "Creative direction · UX · Front-end",
    summary:
      "A motion-driven hotel site tuned for spotty coastal Wi-Fi, where WebGL frames the story instead of blocking the booking.",
    cover: "/assets/projects/Work-Coast67.png",
    shots: ["/assets/projects/Coast67-1.png", "/assets/projects/Coast67-2.png"],
  },
  {
    id: "b48",
    name: "B48 Studios",
    title: "Leather apparel storefront",
    category: "E-commerce · Brand site",
    year: "2024",
    role: "UX · Visual design · Front-end",
    summary:
      "A material-driven storefront built to make leather feel tactile on screen, with checkout friction stripped out of the WooCommerce flow.",
    cover: "/assets/projects/Work-B48.png",
    shots: ["/assets/projects/B48Studio-2.png"],
  },
  {
    id: "elitetapp",
    name: "EliteTapp",
    title: "NFC sharing product and app ecosystem",
    category: "Product design · Mobile app",
    year: "2023",
    role: "Tech lead · Product design",
    summary:
      "One tap to share a digital identity — Flutter app, backend services and a Shopify store for the physical cards, all speaking the same language.",
    cover: "/assets/projects/Work-EliteTapp.png",
    shots: ["/assets/projects/EliteTapp-2.png"],
  },
];
