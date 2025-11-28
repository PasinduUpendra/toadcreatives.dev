// FILE: components/sections/Works.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useScrollSteps } from "../system/ScrollProgressProvider";
import { displayFont } from "@/app/fonts";

type ProjectId = "coast67" | "b48" | "eliteTapp";

interface ProjectImage {
  id: string;
  src?: string;
  caption: string;
  videoSrc?: string;
}

interface Project {
  id: ProjectId;
  label: string;
  title: string;
  category: string;
  year: string;
  role: string;
  summary: string;
  story: string[];
  images?: ProjectImage[];
  background?: string;
}

const projects: Project[] = [
  {
    id: "coast67",
    label: "Coast 67",
    title: "Coast 67 — Oceanfront Motion Hotel Website",
    category: "Hotel website · Interaction design",
    background: "/assets/projects/Work-Coast67.png",
    year: "2024",
    role: "Creative direction · UX · Front-end",
    summary:
      "A motion-driven hotel website designed to communicate relaxed luxury through atmosphere, scroll-based interaction, and precision layout. The project required balancing advanced WebGL animation with real-world constraints like slow hotel Wi-Fi, high-density images, and a hospitality user journey focused on bookings.",
    story: [
      "Coast 67 wanted a website that feels like the property itself: calm, premium, and ocean-driven. The digital experience needed to match the brand's personality — relaxed luxury — without cluttering the user journey or sacrificing clarity.",
      "I designed an interaction model built around soft motion, scroll-driven pacing, and minimal UI framing. Each section reveals in a rhythm that mimics moving through the physical spaces: from arrival, to rooms, to restaurant, to booking.",
      "Because many guests browse on spotty coastal Wi-Fi, every motion element and image was tuned for performance. WebGL was used as a framing layer rather than a distraction, and the layout is built so guests can get from 'first impression' to 'book now' without friction."
    ],
    images: [
      {
        id: "coast67-hero",
        src: "/assets/projects/Coast67-1.png",
        caption: "Hero view and first scroll impression."
      },
      {
        id: "coast67-lobby",
        src: "/assets/projects/Coast67-2.png",
        caption: "Lobby and reception — material-driven hospitality story."
      }
    ]
  },
  {
    id: "b48",
    label: "B48 Studios",
    title: "B48 Studios — Leather Apparel Storefront",
    category: "E-commerce · Brand site",
    background: "/assets/projects/Work-B48.png",
    year: "2024",
    role: "UX · Visual design · Front-end",
    summary:
      "A material-driven storefront built to make leather feel tactile on screen, with a curated product hierarchy and calm, focused PDP flows.",
    story: [
      "B48 is all about craft and texture. The visual system leans into tight crops, macro photography, and high contrast so visitors can almost feel the leather through the screen.",
      "I simplified the information architecture into a few strong categories and rebuilt the product cards and PDP layout to keep focus on materials, fit, and silhouette. Motion is minimal and precise—just enough to communicate responsiveness without adding noise.",
      "Checkout friction was reduced by cleaning up the WooCommerce flow, improving field layout and error states, and tightening the overall rhythm. The result is a store that feels premium but stays fast and direct for shoppers."
    ],
    images: [
      {
        id: "b48-home",
        videoSrc: "/assets/projects/B48Studio-1.webm",
        caption: "Landing experience with bold hero and featured pieces."
      },
      {
        id: "b48-pdp",
        src: "/assets/projects/B48Studio-2.png",
        caption: "Products page with WooCommerce integration."
      }
    ]
  },
  {
    id: "eliteTapp",
    label: "Elite Tapp",
    title: "EliteTapp — NFC Social Sharing Product & App Ecosystem",
    category: "Product design · Mobile app",
    background: "/assets/projects/Work-EliteTapp.png",
    year: "2023",
    role: "Tech Lead & Product Designer",
    summary:
      "EliteTapp began as a simple idea — make sharing your digital identity feel effortless. One tap, and everything about you is there. I led a multidisciplinary team of backend engineers, frontend developers, and UI/UX designers to turn that idea into a complete product ecosystem.",
    story: [
      "I defined the technical direction for the entire project, selecting Flutter as our core framework so we could build fast, ship on both platforms, and maintain a unified design system. On the server side, I architected the backend services that power profile creation, NFC interactions, link routing, and real-time updates across devices.",
      "While the app handled the digital identity, we needed a physical counterpart. I built the EliteTapp Shopify store from scratch — product structure, layout, checkout flow — enabling us to sell NFC cards and tags as part of a seamless purchase-to-activation experience.",
      "The result was a fully connected environment: the app, the backend, and the physical products all speaking the same language. A clean interface, progressive disclosure, and micro-interactions that keep the user moving forward without thinking."
    ],
    images: [
      {
        id: "elite-dashboard",
        videoSrc: "/assets/projects/EliteTapp-1.webm",
        caption: "Main dashboard with key access actions surfaced."
      },
      {
        id: "elite-flows",
        src: "/assets/projects/EliteTapp-2.png",
        caption: "Guest access and device management flow screens."
      }
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

  // Auto-close overlay when we leave the Work section
  useEffect(() => {
    if (step !== "work_intro" && activeProjectId !== null) {
      setActiveProjectId(null);
    }
  }, [step, activeProjectId]);

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
            data-section="work"
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
                  Work
                </h2>
                <motion.div
                  className="h-[2px] w-40 mx-auto bg-gradient-to-r from-lime-300/0 via-lime-300 to-lime-300/0 rounded-full origin-center"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.19, 1, 0.22, 1],
                    delay: 0.3,
                  }}
                />
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
                    data-cursor="magnet"
                    onClick={() => setActiveProjectId(project.id)}
                    className="group relative aspect-[4/3] rounded-[32px] bg-neutral-900/90 border border-neutral-800 shadow-[0_26px_70px_rgba(0,0,0,0.85)] overflow-hidden text-left cursor-pointer"
                  >
                    {/* Background image */}
                  <div
                    className="
                      absolute inset-0
                      bg-cover bg-center
                      scale-105
                      opacity-90
                      group-hover:scale-110
                      group-hover:brightness-105
                      group-hover:opacity-100
                      transition-[transform,opacity,filter]
                      duration-700
                      ease-[0.19,1,0.22,1]
                    "
                    style={{ backgroundImage: `url(${project.background})` }}
                  />

                  {/* Overlay gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/5 pointer-events-none" />

                    {/* Content */}
                    <div className="relative h-full w-full flex flex-col justify-between p-5">
                      <div className="space-y-1">
                        <p className="text-[0.55rem] uppercase tracking-[0.26em] text-neutral-500">
                          {project.category}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.22em] font-light">
                        <span>View project story</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          ↗
                        </span>
                      </div>
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
              data-cursor="magnet"
              onClick={closeOverlay}
              variants={metaItemVariants}
              className="absolute top-5 right-6 md:top-6 md:right-20 border border-white/30 rounded-full px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.22em] hover:bg-white hover:text-black transition-all duration-200"
            >
              Close
            </motion.button>

            <motion.div
              variants={metaItemVariants}
              className="max-w-6xl w-full grid gap-10 md:gap-14 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-start"
            >
              {/* Left: images / visual column */}
              <div className="space-y-5 h-[70vh] overflow-y-auto pr-1 scrollbar-contrast">
                {(activeProject.images ?? []).map((image) => (
                  <motion.div
                    key={image.id}
                    variants={metaItemVariants}
                    className="
                      relative
                      rounded-[28px]
                      border border-white/5
                      bg-gradient-to-b from-neutral-950 to-neutral-800
                      shadow-[0_30px_80px_rgba(0,0,0,0.9)]
                      overflow-hidden
                    "
                  >
                    {image.videoSrc ? (
                      <video
                        src={image.videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="block w-full aspect-[16/10] object-cover"
                      />
                    ) : image.src ? (
                      <img
                        src={image.src}
                        alt={image.caption}
                        className="block w-full aspect-[16/10] object-cover"
                      />
                    ) : (
                      <div
                        className="
                          aspect-[16/10] w-full
                          bg-[radial-gradient(circle_at_0%_0%,#b7f46533,transparent_55%),radial-gradient(circle_at_50%_120%,#24e0ff22,transparent_55%)]
                        "
                      />
                    )}

                    <div
                      className="
                        absolute bottom-4 left-4
                        text-[0.7rem] uppercase tracking-[0.22em]
                        bg-black/60 backdrop-blur-sm
                        px-3 py-1.5 rounded-full text-neutral-200
                      "
                    >
                      {image.caption}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Right: meta + story */}
              <div className="h-[70vh] overflow-y-auto pl-0 md:pl-2 flex flex-col gap-8 scrollbar-contrast">
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
                  className="space-y-5 text-base md:text-[1.1rem] leading-relaxed text-neutral-200"
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
