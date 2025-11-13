"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

const GRID_ROWS = 8;
const GRID_COLS = 12;

const cells = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => i);

export function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20 });

  const cardTranslateX = useTransform(smoothX, [0, 1], ["-8px", "8px"]);
  const cardTranslateY = useTransform(smoothY, [0, 1], ["-8px", "8px"]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative flex min-h-screen items-center px-4 py-10 sm:px-8 lg:px-16">
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start gap-12 lg:flex-row lg:items-center">
        {/* LEFT – TEXT */}
        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
            ToadCreatives.dev
          </p>

          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Motion-driven web experiences{" "}
            <span className="block text-slate-400">
              designed to feel <span className="italic text-sky-400/90">alive</span>.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-sm text-slate-400 sm:text-base">
            I&apos;m Pasindu Upendra, a front-end developer crafting kinetic,
            scroll-first interfaces for brands that want to stand out. This is my
            playground of experiments, case studies and motion systems.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Now building the next scroll story</span>
            </div>
            <span className="hidden sm:inline text-slate-500">
              Scroll to peel back the layers.
            </span>
          </div>

          <div className="mt-8 max-w-sm rounded-3xl border border-slate-800/80 bg-slate-900/70 px-5 py-4 text-xs text-slate-300 shadow-[0_0_40px_rgba(15,23,42,0.9)] backdrop-blur-xl">
            <p className="font-medium uppercase tracking-[0.24em] text-slate-500">
              Focus
            </p>
            <ul className="mt-3 space-y-1.5 text-[0.78rem] leading-relaxed">
              <li>• Scroll-driven storytelling</li>
              <li>• Micro-interactions &amp; kinetic typography</li>
              <li>• High-end, Awwwards-grade web builds</li>
            </ul>
          </div>

          <div className="mt-8 flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.26em] text-slate-500">
            <span className="h-[1px] w-10 bg-slate-700" />
            <span>Scroll</span>
            <motion.span
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/80"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="h-3 w-[1px] bg-slate-400" />
            </motion.span>
          </div>
        </motion.div>

        {/* RIGHT – GRID CARD */}
        <motion.div
          className="flex w-full justify-center lg:flex-1 lg:justify-end"
          style={{
            translateX: cardTranslateX,
            translateY: cardTranslateY,
          }}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative h-[380px] w-[320px] sm:w-[380px] md:w-[420px] rounded-[32px] border border-sky-500/40 bg-slate-900/40 p-[5px] shadow-[0_0_60px_rgba(56,189,248,0.35)] backdrop-blur-2xl">
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-sky-500/10 via-slate-900/0 to-sky-500/10 mix-blend-screen pointer-events-none" />
            <div className="relative z-10 grid h-full w-full grid-cols-12 grid-rows-8 gap-[3px]">
              {cells.map((i) => {
                const row = Math.floor(i / GRID_COLS);
                const col = i % GRID_COLS;

                const distToCenterRow = Math.abs(row - GRID_ROWS / 2);
                const distToCenterCol = Math.abs(col - GRID_COLS / 2);
                const dist = Math.sqrt(
                  distToCenterRow ** 2 + distToCenterCol ** 2
                );
                const baseScale = 1 - dist * 0.06;

                return (
                  <motion.div
                    key={i}
                    className="rounded-[4px] bg-sky-400/22"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{
                      opacity: [0.25, 0.8, 0.3],
                      scale: [0.9 * baseScale, 1.1 * baseScale, 0.95 * baseScale],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: (row + col) * 0.03,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}