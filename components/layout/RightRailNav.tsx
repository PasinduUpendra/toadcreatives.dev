// components/layout/RightRailNav.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const sections = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "What we do" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

function useShuffleText(label: string) {
  const [display, setDisplay] = useState(label.toUpperCase());
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!hover) {
      setDisplay(label.toUpperCase());
      return;
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let frame = 0;
    const maxFrames = label.length + 4;

    const interval = setInterval(() => {
      frame++;

      setDisplay(
        label
          .toUpperCase()
          .split("")
          .map((ch, idx) => {
            if (ch === " ") return " ";
            if (idx < frame - 2) return ch;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (frame > maxFrames) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [hover, label]);

  return { display, setHover };
}

export default function RightRailNav() {
  const [active, setActive] = useState<string>("home");

  useEffect(() => {
    const handler = () => {
      let current = "home";
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) {
          current = section.id;
        }
      }
      setActive(current);
    };

    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 40;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <aside className="pointer-events-none fixed right-10 top-1/2 z-40 hidden -translate-y-1/2 md:flex">
      <div className="pointer-events-auto flex flex-col items-end gap-5">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-slate-400">
          Navigate
        </span>

        <div className="relative">
          {/* single vertical line */}
          <div className="absolute right-0 top-0 h-full w-px bg-slate-700/50" />

          <div className="flex flex-col items-end gap-6 pr-3">
            {sections.map((section) => {
              const isActive = active === section.id;
              const { display, setHover } = useShuffleText(section.label);

              return (
                <button
                  key={section.id}
                  type="button"
                  data-cursor="link"
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  onClick={() => scrollTo(section.id)}
                  className="group flex items-center gap-3"
                >
                  {/* text */}
                  <motion.span
                    className="text-[0.65rem] font-medium uppercase tracking-[0.2em]"
                    animate={{
                      color: isActive
                        ? "#7BAE44"
                        : "rgba(148,163,184,0.9)",
                      opacity: isActive ? 1 : 0.7,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {display}
                  </motion.span>

                  {/* dot on the line */}
                  <motion.div
                    className="relative flex items-center justify-center"
                    animate={{ scale: isActive ? 1.1 : 1 }}
                  >
                    <motion.div
                      className="flex items-center justify-center rounded-full border bg-black/85"
                      style={{ width: 16, height: 16 }}
                      animate={{
                        borderColor: isActive
                          ? "rgba(123,174,68,1)"
                          : "rgba(148,163,184,0.9)",
                        boxShadow: isActive
                          ? "0 0 22px rgba(123,174,68,0.9)"
                          : "0 0 0 rgba(0,0,0,0)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 22,
                      }}
                    >
                      <div
                        className="rounded-full"
                        style={{ width: 6, height: 6, backgroundColor: "#7BAE44" }}
                      />
                    </motion.div>
                  </motion.div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}