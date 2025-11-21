// FILE: components/sections/Works.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useScrollSteps } from "../system/ScrollProgressProvider";
import { displayFont } from "@/app/fonts";

type ProjectId = "coast67" | "b48" | "eliteTapp";

interface Project {
  id: ProjectId;
  label: string;
  title: string;
  category: string;
  year: string;
  role: string;
  summary: string;
  story: string[];
  // You can plug real images later; for now we show visual placeholders
  images?: { id: string; caption: string }[];
}

const projects: Project[] = [
  {
    id: "coast67",
    label: "Coast 67",
    title: "Coast 67 — Oceanfront Motion Hotel Website",
    category: "Hotel website · Interaction design",
    year: "2024",
    role: "Creative direction · UX · Front-end",
    summary:
      "A motion-driven hotel website designed to communicate relaxed luxury through atmosphere, scroll-based interaction, and precision layout. The project required balancing advanced WebGL animation with real-world constraints like slow hotel Wi-Fi, high-density images, and a hospitality user journey focused on bookings.",
    story: [
      "Coast 67 wanted a website that feels like the property itself: calm, premium, and ocean-driven. The digital experience needed to match the brand’s personality — relaxed luxury — without cluttering the user journey or sacrificing clarity.",
      "Designed an interaction model built around soft motion, scroll-driven pacing, and minimal UI framing. Each section reveals in a rhythm that mimics “walking through the hotel” rather than clicking through menus. Background gradients and atmospheric motion reinforce the coastal setting without competing with real photography.",
      "The booking journey was redesigned to be more direct: rooms and rates surface earlier, CTAs become visible at natural scroll points, and the entire flow feels linear and calm. The goal was to maximize conversions without breaking the narrative experience of the brand."
    ],
    images: [
      { id: "hero", caption: "Hero view and first scroll impression." },
      { id: "rooms", caption: "Room overview and booking-oriented layout." }
    ]
  },
  {
    id: "b48",
    label: "B48 Studios",
    title: "B48 Studios — Leather Apparel Storefront",
    category: "E-commerce · Brand site",
    year: "2024",
    role: "UX · Visual design · Front-end",
    summary:
      "A high-contrast ecommerce site built to communicate material quality, craftsmanship, and a premium streetwear aesthetic. The main goal was to make leather products feel “tangible” through photography, layout, and controlled micro-interactions.",
    story: [
      "B48 is a leather apparel brand where texture is everything. The site had to express that quality visually — tight crops, macro angles, natural shadows, and a product grid that puts the craftsmanship front and center. My design direction focused on creating a storefront that feels bold but never busy.",
      "I restructured the product hierarchy to keep the store clean and decisive. Instead of deep categories, B48 uses a concise, curated structure. This gives the brand a premium feel while also making navigation extremely fast, especially on mobile.",
      "The PDP (product detail page) was rebuilt for clarity: large gallery images, detail shots, and a sizing/fit structure inspired by modern luxury ecommerce. Micro-motions were added around hover states, image changes, and variant toggles — enough to feel alive while staying elegant."
    ],
    images: [
      { id: "home", caption: "Landing experience and primary navigation." },
      { id: "pdp", caption: "Product detail page emphasizing material and fit." }
    ]
  },
  {
    id: "eliteTapp",
    label: "Elite Tapp",
    title: "Elite Tapp — Mobile-First Access Control",
    category: "Product design · Mobile app",
    year: "2023",
    role: "Product design · UI motion · Front-end",
    summary:
      "A mobile access management app that explains complex flows through clean UI, guided states, and lightweight motion.",
    story: [
      "Elite Tapp solves a complex problem—secure access control—through mobile flows that feel obvious even for non-technical users.",
      "The interface relies on progressive disclosure: you only see the controls that matter for the current task, with micro-interactions guiding the next step.",
      "We built an interactive prototype that doubled as marketing collateral. Screens and flows were re-used across the landing page, investor deck and in-app onboarding."
    ],
    images: [
      { id: "dashboard", caption: "Main dashboard with key actions surfaced." },
      { id: "flows", caption: "Guest access and device management flows." }
    ]
  }
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 90, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.19, 1, 0.22, 1],
      when: "beforeChildren",
      staggerChildren: 0.08
    }
  },
  exit: {
    opacity: 0,
    y: -70,
    scale: 1.02,
    transition: { duration: 0.55, ease: [0.19, 1, 0.22, 1] }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.19, 1, 0.22, 1] }
  }
};

const overlayVariants: Variants = {
  hidden: { opacity: 0, y: 80, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.19, 1, 0.22, 1],
      when: "beforeChildren",
      staggerChildren: 0.06
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.98,
    transition: { duration: 0.55, ease: [0.19, 1, 0.22, 1] }
  }
};

const metaItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.19, 1, 0.22, 1] }
  }
};

const Works: React.FC = () => {
  const { step } = useScrollSteps();
  const isActive = step === "work_intro";

  const [activeProjectId, setActiveProjectId] = useState<ProjectId | null>(null);
  const activeProject =
    activeProjectId != null
      ? projects.find((p) => p.id === activeProjectId) ?? null
      : null;

  // Lock global scroll while overlay is open
  useEffect(() => {
    if (!activeProject) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [activeProject]);

  const closeOverlay = () => {
    setActiveProjectId(null);
  };

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.section
            key="works-section"
            className="fixed inset-0 flex flex-col items-center justify-center px-6 md:px-10 lg:px-16 pointer-events-none"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className="max-w-5xl w-full mx-auto pointer-events-auto">
              {/* Header */}
              <motion.div
                className="mb-10 text-center"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
              >
                <p className="text-[0.68rem] tracking-[0.28em] uppercase text-neutral-500 mb-2">
                  Selected work
                </p>
                <h2
                  className={`${displayFont.className} text-[clamp(2.2rem,3vw,3rem)] font-semibold`}
                >
                  WORK
                </h2>
                <p className="mt-3 text-sm md:text-base text-neutral-300 max-w-xl mx-auto">
                  Three projects that show how motion, interaction, and narrative
                  come together across hospitality, commerce, and product design.
                </p>
              </motion.div>

              {/* Cards */}
              <motion.div
                className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
                variants={{ hidden: {}, visible: {} }}
              >
                {projects.map((project) => (
                  <motion.button
                    key={project.id}
                    type="button"
                    variants={cardVariants}
                    onClick={() => setActiveProjectId(project.id)}
                    className="group relative aspect-[4/3] rounded-[32px] bg-neutral-900/90 border border-neutral-800 shadow-[0_26px_70px_rgba(0,0,0,0.85)] overflow-hidden text-left cursor-pointer"
                  >
                    {/* Base gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/60 via-neutral-900/0 to-neutral-700/60 transition-opacity duration-500 group-hover:opacity-0" />

                    {/* Content */}
                    <div className="relative h-full w-full flex flex-col justify-between p-5">
                      <div className="space-y-2">
                        <p className="text-[0.62rem] uppercase tracking-[0.26em] text-neutral-500">
                          {project.category}
                        </p>
                        <p className="text-sm font-medium text-neutral-50">
                          {project.label}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.22em] text-neutral-400">
                        <span>View project story</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          ↗
                        </span>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-[0.19,1,0.22,1]">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    </div>

                    {/* Hover lift / scale */}
                    <div className="absolute inset-0 pointer-events-none group-hover:-translate-y-1 group-hover:scale-[1.02] transition-transform duration-400 ease-[0.19,1,0.22,1]" />
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Project detail overlay */}
      <AnimatePresence>
        {activeProject && (
          <motion.div
            key={`project-overlay-${activeProject.id}`}
            className="fixed inset-0 z-50 bg-[#05070b]/95 text-white flex items-center justify-center px-6 md:px-10 lg:px-16 pointer-events-auto"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onWheelCapture={(e) => {
              e.stopPropagation();
            }}
            onTouchMoveCapture={(e) => {
              e.stopPropagation();
            }}
          >
            <motion.div
              variants={metaItemVariants}
              className="absolute top-5 left-6 md:top-7 md:left-10 text-[0.62rem] uppercase tracking-[0.26em] text-neutral-500"
            >
              Selected project
            </motion.div>

            <motion.button
              type="button"
              onClick={closeOverlay}
              variants={metaItemVariants}
              className="absolute top-5 right-6 md:top-7 md:right-10 border border-white/30 rounded-full px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.22em] hover:bg-white hover:text-black transition-all duration-200"
            >
              Close
            </motion.button>

            <motion.div
              variants={metaItemVariants}
              className="max-w-6xl w-full grid gap-10 md:gap-14 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start"
            >
              {/* Left: images / visual column */}
              <div className="space-y-5 h-[70vh] overflow-y-auto pr-1">
                {(activeProject.images ?? []).map((image) => (
                  <motion.div
                    key={image.id}
                    variants={metaItemVariants}
                    className="relative rounded-[28px] border border-white/10 overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-800 shadow-[0_30px_80px_rgba(0,0,0,0.9)]"
                  >
                    {/* Placeholder visual block – replace with real <img /> or <Image /> later */}
                    <div className="aspect-[16/10] w-full bg-[radial-gradient(circle_at_0%_0%,#ffffff22,transparent_55%),radial-gradient(circle_at_100%_100%,#b7f46533,transparent_55%),radial-gradient(circle_at_50%_120%,#24e0ff22,transparent_55%)]" />
                    <div className="absolute bottom-4 left-4 text-[0.65rem] uppercase tracking-[0.22em] bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-neutral-200">
                      {image.caption}
                    </div>
                  </motion.div>
                ))}
                {(!activeProject.images || activeProject.images.length === 0) && (
                  <motion.div
                    variants={metaItemVariants}
                    className="rounded-[28px] border border-dashed border-white/15 p-6 text-xs text-neutral-400"
                  >
                    Drop in final project screens or mockups here. This column is
                    built to hold scrollable visual storytelling for the case
                    study.
                  </motion.div>
                )}
              </div>

              {/* Right: meta + story */}
              <div className="h-[70vh] overflow-y-auto pl-0 md:pl-2 flex flex-col gap-8">
                <motion.header
                  variants={metaItemVariants}
                  className="space-y-3"
                >
                  <p className="text-[0.68rem] uppercase tracking-[0.28em] text-neutral-500">
                    Case study
                  </p>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
                    {activeProject.title}
                  </h1>
                  <p className="text-sm md:text-[0.95rem] text-neutral-300">
                    {activeProject.summary}
                  </p>
                </motion.header>

                <motion.div
                  variants={metaItemVariants}
                  className="grid grid-cols-2 gap-4 text-[0.7rem] uppercase tracking-[0.2em] text-neutral-400"
                >
                  <div>
                    <p className="text-neutral-500 mb-1">Year</p>
                    <p className="text-neutral-200">{activeProject.year}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 mb-1">Role</p>
                    <p className="text-neutral-200">{activeProject.role}</p>
                  </div>
                </motion.div>

                <motion.div
                  variants={metaItemVariants}
                  className="space-y-5 text-sm md:text-[0.95rem] leading-relaxed text-neutral-200"
                >
                  {activeProject.story.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Works;
