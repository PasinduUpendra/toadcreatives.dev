// FILE: components/sections/Works.tsx
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollSteps } from "../system/ScrollProgressProvider";
import { displayFont } from "@/app/fonts";

const Works: React.FC = () => {
  const { step } = useScrollSteps();
  const isActive = step === "work_intro";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.section
          key="works-section"
          className="fixed inset-0 flex flex-col items-center justify-center px-6 md:px-10 lg:px-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="max-w-5xl w-full mx-auto">
            <div className="mb-8 text-center">
              <p className="text-[0.68rem] tracking-[0.28em] uppercase text-neutral-500 mb-2">
                Selected work
              </p>
              <h2
                className={`${displayFont.className} text-[clamp(2.2rem,3vw,3rem)] font-semibold`}
              >
                WORK
              </h2>
              <p className="mt-3 text-sm md:text-base text-neutral-300 max-w-xl mx-auto">
                A small grid of projects will live here. For now we just block
                out the layout with neutral cards over the black canvas.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-[32px] bg-neutral-900/90 border border-neutral-800 shadow-[0_24px_60px_rgba(0,0,0,0.75)]"
                />
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default Works;
