"use client";

import { useCallback, useEffect, useRef, type MouseEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type Transition,
} from "framer-motion";
import { scrollToSection, setScrollLocked } from "../system/SmoothScroll";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
}

interface MenuItem {
  label: string;
  /** Matches the section element id in the document. */
  id: string;
}

// Section ids, not step indexes — the page is a real document now.
const menuItems: MenuItem[] = [
  { label: "Intro", id: "intro" },
  { label: "About", id: "about" },
  { label: "What I do", id: "services" },
  { label: "Work", id: "work" },
  { label: "Contact", id: "contact" },
];

const panelTransition: Transition = { type: "spring", stiffness: 260, damping: 28 };

interface MagnetNavItemProps {
  item: MenuItem;
  delay: number;
  onSelect: (item: MenuItem) => void;
}

const MagnetNavItem: React.FC<MagnetNavItemProps> = ({ item, delay, onSelect }) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.4 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.25);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      data-cursor
      data-cursor-label="Go"
      onClick={() => onSelect(item)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="group relative text-left text-2xl leading-tight font-light text-neutral-200 focus-visible:outline-none sm:text-3xl lg:text-4xl"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay, duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="relative inline-block">
        <span className="inline-block opacity-80 transition-all duration-300 ease-[0.25,1,0.5,1] group-hover:-translate-y-0.5 group-hover:text-white group-hover:opacity-100 group-focus-visible:text-white group-focus-visible:opacity-100">
          {item.label}
        </span>
        <span className="pointer-events-none absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-linear-to-r from-lime-300/0 via-lime-300 to-lime-300/0 transition-transform duration-300 ease-[0.19,1,0.22,1] group-hover:scale-x-100 group-focus-visible:scale-x-100" />
      </span>
    </motion.button>
  );
};

const FOCUSABLE = 'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export default function MenuOverlay({ open, setOpen }: Props) {
  const panel = useRef<HTMLElement | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), [setOpen]);

  const handleNavigate = (item: MenuItem) => {
    close();
    // Let the panel start closing before the page moves, so the two reads as
    // one gesture rather than a jump behind a sliding sheet.
    window.setTimeout(() => scrollToSection(item.id), 180);
  };

  useEffect(() => {
    if (!open) return;

    restoreFocus.current = document.activeElement as HTMLElement | null;
    setScrollLocked(true);
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      setScrollLocked(false);
      restoreFocus.current?.focus?.();
    };
  }, [open, close]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu-overlay"
          className="fixed inset-0 z-90 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          onClick={close}
        >
          <motion.aside
            ref={panel}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="pointer-events-auto fixed top-0 right-0 flex h-full w-full flex-col border-l border-white/10 bg-black/95 px-8 pt-8 pb-10 text-white sm:w-[70vw] sm:px-10 lg:w-[35vw] lg:px-12"
            initial={{ x: "100%" }}
            animate={{ x: 0, pointerEvents: "auto" }}
            // The focus trap is torn down the instant `open` flips false, but
            // AnimatePresence keeps this panel visible and on top while it
            // slides out. Killing pointer events for that window stops the
            // departing panel from swallowing clicks meant for the page.
            exit={{ x: "100%", pointerEvents: "none" }}
            transition={panelTransition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-10 flex items-center justify-end">
              <button
                type="button"
                onClick={close}
                data-cursor
                data-cursor-label="Close"
                className="flex items-center gap-2 rounded text-xs tracking-[0.22em] text-neutral-400 uppercase transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none"
              >
                <span>Close</span>
                <span aria-hidden="true" className="block h-px w-4 bg-neutral-400" />
              </button>
            </div>

            <nav
              aria-label="Sections"
              className="flex flex-1 flex-col justify-center gap-4 sm:gap-6"
            >
              {menuItems.map((item, index) => (
                <MagnetNavItem
                  key={item.id}
                  item={item}
                  delay={0.05 + index * 0.07}
                  onSelect={handleNavigate}
                />
              ))}
            </nav>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
