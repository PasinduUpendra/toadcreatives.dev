"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "what-we-do", label: "What we do" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

export function RightRailNav() {
  const [activeId, setActiveId] = useState<string>("hero");

  // Scroll-spy: watch which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (SECTIONS.some((s) => s.id === id)) {
            setActiveId(id);
          }
        });
      },
      {
        root: null,
        threshold: 0.4, // ~40% of section visible
      }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: id === "hero" ? "start" : "center",
    });
  };

  return (
    <nav
      aria-label="Section navigation"
      className="pointer-events-none fixed inset-y-0 right-12 z-20 hidden lg:flex items-center"
    >
      <div className="pointer-events-auto flex flex-col items-end gap-6 text-[0.7rem] tracking-[0.3em] uppercase text-slate-500">
        <span className="mb-2 text-slate-600">Navigate</span>

        <div className="relative flex flex-col items-end gap-4">
          {/* vertical line */}
          <span
            aria-hidden="true"
            className="absolute left-3 top-[-8px] h-[220px] w-px bg-slate-700/60"
          />

          {SECTIONS.map((section) => {
            const isActive = section.id === activeId;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleClick(section.id)}
                className="group relative flex items-center gap-3"
              >
                <span
                  className={
                    "text-[0.65rem] transition-colors duration-300 " +
                    (isActive ? "text-lime-300" : "text-slate-500 group-hover:text-slate-300")
                  }
                >
                  {section.label}
                </span>

                <span
                  aria-hidden="true"
                  className={
                    "relative h-3 w-3 rounded-full border border-slate-400/60 bg-slate-900 shadow-sm transition-all duration-300 " +
                    (isActive
                      ? "border-lime-300 bg-lime-300/20 shadow-[0_0_25px_rgba(190,242,100,0.75)]"
                      : "group-hover:border-slate-200 group-hover:bg-slate-700/60")
                  }
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}