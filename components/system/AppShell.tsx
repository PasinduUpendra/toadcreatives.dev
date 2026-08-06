"use client";

import React from "react";
import SmoothScroll from "./SmoothScroll";
import CustomCursor from "../ui/CustomCursor";
import { TubesSystem } from "../visuals/TubesSystem";

import NavBar from "../layout/NavBar";
import Hero from "../sections/Hero";
import About from "../sections/About";
import WhatWeDo from "../sections/WhatWeDo";
import Works from "../sections/Works";
import Contact from "../sections/Contact";

/**
 * The page is an ordinary scrolling document. Every section is mounted at all
 * times, which is what puts the copy in the server-rendered HTML — previously
 * only the hero existed until you scrolled, so crawlers saw one sentence.
 */
const AppShell: React.FC = () => {
  return (
    <>
      <SmoothScroll />
      <CustomCursor />

      {/* The WebGL field stays fixed behind everything and re-tints per section. */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <TubesSystem />
      </div>

      <NavBar />

      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <WhatWeDo />
        <Works />
        <Contact />
      </main>
    </>
  );
};

export default AppShell;
