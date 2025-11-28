"use client";

import React from "react";
import MenuButton from "./MenuButton";

const NavBar: React.FC = () => {
  return (
    <div className="pointer-events-none fixed top-6 left-0 right-0 z-[70] flex justify-end px-8">
      <div className="pointer-events-auto">
        <MenuButton />
      </div>
    </div>
  );
};

export default NavBar;
