"use client";

import React, { MouseEvent, useRef } from "react";
import {
  motion,
  AnimatePresence,
  type Transition,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useScrollSteps } from "../system/ScrollProgressProvider";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
}

type SectionId = "hero" | "about" | "what" | "work" | "contact";

interface MenuItem {
  label: string;
  id: SectionId;
  stepIndex: number;
}

// Map each nav item to the scroll step index in scrollTimeline.ts
// hero_intro      -> 0
// about_intro     -> 1
// about_p1        -> 2
// about_p2        -> 3
// about_p3        -> 4
// what_intro      -> 5
// what_p1         -> 6
// what_p2         -> 7
// what_p3         -> 8
// work_intro      -> 9
// contact_intro   -> 10
const menuItems: MenuItem[] = [
  { label: "Intro", id: "hero", stepIndex: 0 },
  { label: "About", id: "about", stepIndex: 1 },
  { label: "What we do", id: "what", stepIndex: 5 },
  { label: "Work", id: "work", stepIndex: 9 },
  { label: "Contact", id: "contact", stepIndex: 10 },
];

const panelTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
};

interface MagnetNavItemProps {
  item: MenuItem;
  delay: number;
  onClick: (item: MenuItem) => void;
}

const MagnetNavItem: React.FC<MagnetNavItemProps> = ({
  item,
  delay,
  onClick,
}) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.4 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);

    // Subtle pull, not crazy
    x.set(relX * 0.25);
    y.set(relY * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      data-cursor="magnet"
      onClick={() => onClick(item)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="
        group
        relative
        text-2xl sm:text-3xl lg:text-4xl
        font-light
        text-neutral-200
        text-left
        leading-tight
        cursor-none
      "
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        delay,
        duration: 0.45,
        ease: [0.25, 1, 0.5, 1],
      }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="relative inline-block">
        <span
          className="
            transition-all
            duration-300
            ease-[0.25,1,0.5,1]
            group-hover:opacity-100
            group-hover:translate-y-[-2px]
            group-hover:text-white
            opacity-80
          "
        >
          {item.label}
        </span>
        <span
          className="
            pointer-events-none
            absolute left-0 -bottom-2 h-[1px] w-full
            bg-gradient-to-r from-lime-300/0 via-lime-300 to-lime-300/0
            transform origin-left scale-x-0
            transition-transform duration-300 ease-[0.19,1,0.22,1]
            group-hover:scale-x-100
          "
        />
      </span>
    </motion.button>
  );
};

const MenuOverlay: React.FC<Props> = ({ open, setOpen }) => {
  const { goToIndex } = useScrollSteps();

  const handleNavigate = (item: MenuItem) => {
    goToIndex(item.stepIndex);
    setOpen(false);
  };

  const handleBackdropClick = () => {
    setOpen(false);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu-overlay"
          className="fixed inset-0 z-[80] bg-black/0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          onClick={handleBackdropClick}
        >
          {/* Right-side drawer (≈35% width on desktop) */}
          <motion.aside
            className="
              pointer-events-auto
              fixed top-0 right-0 h-full
              w-full sm:w-[70vw] lg:w-[35vw]
              bg-black/92 border-l border-white/10
              text-white flex flex-col
              px-8 sm:px-10 lg:px-12
              pt-8 pb-10
            "
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={panelTransition}
            onClick={stopPropagation}
          >
            {/* Close button (top-right) */}
            <div className="flex items-center justify-end mb-10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs uppercase tracking-[0.22em] text-neutral-400 hover:text-white flex items-center gap-2 cursor-none"
                data-cursor="magnet"
              >
                <span>Close</span>
                <span className="block h-[1px] w-4 bg-neutral-400" />
              </button>
            </div>

            {/* Menu items */}
            <div className="flex-1 flex flex-col justify-center gap-4 sm:gap-6">
              {menuItems.map((item, index) => (
                <MagnetNavItem
                  key={item.id}
                  item={item}
                  delay={0.05 + index * 0.07}
                  onClick={handleNavigate}
                />
              ))}
            </div>

            <div className="mt-6 text-[0.65rem] text-neutral-500 uppercase tracking-[0.2em]">
              Navigation
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MenuOverlay;