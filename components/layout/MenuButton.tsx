"use client";

import { useState } from "react";
import MenuOverlay from "./MenuOverlay";

export default function MenuButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Was a <div onClick>: unreachable by keyboard, invisible to assistive
          tech, and with no open/closed state. The visual treatment is unchanged. */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
        data-cursor
        data-cursor-label="Menu"
        className="group flex cursor-pointer flex-col gap-1.5 rounded p-1 focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none"
      >
        <span className="block h-[1.5px] w-6 bg-neutral-200 transition-all duration-300 group-hover:w-8" />
        <span className="block h-[1.5px] w-4 bg-neutral-200 transition-all duration-300 group-hover:w-8" />
      </button>

      <MenuOverlay open={open} setOpen={setOpen} />
    </>
  );
}
