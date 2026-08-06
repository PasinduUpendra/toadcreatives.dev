"use client";

import MenuButton from "./MenuButton";

export default function NavBar() {
  return (
    <header
      data-site-nav
      className="pointer-events-none fixed inset-x-0 top-6 z-90 flex justify-end px-8 transition-opacity duration-300"
    >
      <div className="pointer-events-auto">
        <MenuButton />
      </div>
    </header>
  );
}
