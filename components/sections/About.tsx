// FILE: components/sections/About.tsx
"use client";

import React, { useMemo } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useScrollSteps } from "../system/ScrollProgressProvider";
import type { ScrollStep } from "../system/scrollTimeline";
import { displayFont } from "@/app/fonts";

const ABOUT_STEPS: ScrollStep[] = [
  "about_intro",
  "about_p1",
  "about_p2",
  "about_p3",
];

const paragraphs = [
  {
    id: "about_p1",
    label: "Opening statement",
    body: "We tune light, depth, and motion until digital scenes feel like living systems—not flat screens.",
  },
  {
    id: "about_p2",
    label: "How we work",
    body: "We prototype fast in WebGL, SVG, and code, then sculpt every transition by hand until the interface breathes.",
  },
  {
    id: "about_p3",
    label: "Who we team up with",
    body: "Studios, founders, and art directors who need motion that carries a story from first hover to final launch.",
  },
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
    },
  },
  exit: {
    opacity: 0,
    y: -70,
    scale: 1.02,
    transition: { duration: 0.55, ease: [0.19, 1, 0.22, 1] },
  },
};

const About: React.FC = () => {
  const { step } = useScrollSteps();

  const isActiveSection = ABOUT_STEPS.includes(step);
  const isIntroOnly = step === "about_intro";

  const activeParagraph = useMemo(() => {
    if (step === "about_p1") return paragraphs[0];
    if (step === "about_p2") return paragraphs[1];
    if (step === "about_p3") return paragraphs[2];
    return null;
  }, [step]);

  return (
    <AnimatePresence>
      {isActiveSection && (
        <motion.section
          key="about-section"
          data-section="about"
          className="fixed inset-0 flex items-center justify-center px-6 md:px-12 lg:px-20 pointer-events-none"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] gap-12 md:gap-16 items-center">
            {/* Left column – kinetic heading */}
            <div className="pointer-events-none">
              <motion.div
                className="inline-flex flex-col gap-4"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: {} }}
              >
                <motion.h2
                  className={`${displayFont.className} text-[clamp(2.7rem,4vw,3.6rem)] font-semibold leading-none text-glow-strong`}
                >
                  <span className="inline-flex overflow-hidden align-top">
                    {"About".split("").map((char, index) => (
                      <motion.span
                        key={`about-char-${index}-${char}`}
                        className="inline-block"
                        initial={{ y: "120%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.03 * index,
                          ease: [0.19, 1, 0.22, 1],
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                  <motion.span
                    className="inline-block overflow-hidden align-top ml-2"
                    initial={{ y: "120%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{
                      duration: 0.45,
                      delay: 0.26,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                  >
                    <motion.span
                      className="inline-block"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: [0.9, 1.05, 1] }}
                      transition={{
                        duration: 0.4,
                        delay: 0.26,
                        ease: [0.19, 1, 0.22, 1],
                      }}
                    >
                      us
                    </motion.span>
                  </motion.span>
                </motion.h2>

                <motion.div
                  className="h-[2px] w-40 bg-gradient-to-r from-lime-400/0 via-lime-300 to-lime-400/0 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.38,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />

                <motion.p
                  className="text-sm md:text-base text-neutral-300 max-w-md text-glow-soft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.55,
                    delay: 0.44,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                >
                  The studio layer: who’s behind the tubes, what drives the
                  experiments, and why everything moves the way it does.
                </motion.p>
              </motion.div>
            </div>

            {/* Right column – paragraph slides */}
            <div className="pointer-events-auto">
              <AnimatePresence mode="wait">
                {!isIntroOnly && activeParagraph && (
                  <motion.div
                    key={activeParagraph.id}
                    className="relative"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -32 }}
                    transition={{
                      duration: 0.55,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                  >
                    <motion.p
                      className="text-[0.7rem] uppercase tracking-[0.28em] text-neutral-400 mb-4 text-glow-soft"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.19, 1, 0.22, 1],
                      }}
                    >
                      {activeParagraph.label}
                    </motion.p>

                    <WordStaggerText text={activeParagraph.body} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default About;

const WordStaggerText: React.FC<{ text: string }> = ({ text }) => {
  const words = text.split(" ");

  return (
    <p className="text-[0.98rem] md:text-[1.05rem] leading-relaxed text-neutral-50/95 text-glow-medium">
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block mr-[0.32em]"
          initial={{ y: "115%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-115%", opacity: 0, filter: "blur(4px)" }}
          transition={{
            duration: 0.45,
            delay: 0.03 * index,
            ease: [0.19, 1, 0.22, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
};
