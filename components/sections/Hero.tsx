// FILE: components/sections/Hero.tsx
"use client";

import Image from "next/image";
import { CreativesMotion } from "@/components/visuals/CreativesMotion";
import { displayFont } from "@/app/fonts";
import { AnimatePresence, motion } from "framer-motion";
import { useScrollSteps } from "../system/ScrollProgressProvider";
import React from "react";

const Hero: React.FC = () => {
  const { step } = useScrollSteps();

  // Hero ONLY lives on the first step.
  const isVisible = step === "hero_intro";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.section
          key="hero"
          data-section="hero"
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex w-full max-w-[780px] flex-col items-center gap-3 px-4">
            <div className="flex w-full max-w-[540px] flex-col items-center gap-3">
              <Image
                src="/toad.svg"
                alt="Toad Creatives logo"
                width={540}
                height={270}
                className="h-auto w-full"
              />

              <CreativesMotion className="w-full -mt-10" />
            </div>

            <h1
              className={`${displayFont.className} text-[clamp(1.5rem,2vw,2.5rem)] font-semibold leading-[0.95] tracking-tight text-glow-strong`}
            >
              Websites, Apps, AI Systems <span className="text-lime-300">×</span> Built end-to-end & right!
            </h1>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default Hero;
