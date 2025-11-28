"use client";

import React, { useState } from "react";
import MenuOverlay from "./MenuOverlay";

const MenuButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        data-cursor="magnet"
        onClick={() => setOpen(true)}
        className="cursor-pointer group flex flex-col gap-1.5"
      >
        <span className="block h-[1.5px] w-6 bg-neutral-200 group-hover:w-8 transition-all duration-300" />
        <span className="block h-[1.5px] w-4 bg-neutral-200 group-hover:w-8 transition-all duration-300" />
      </div>

      <MenuOverlay open={open} setOpen={setOpen} />
    </>
  );
};

export default MenuButton;
