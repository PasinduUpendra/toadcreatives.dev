// FILE: components/system/AppShell.tsx
"use client";

import React from "react";
import { ScrollProgressProvider } from "./ScrollProgressProvider";
import CustomCursor from "../ui/CustomCursor";
import { TubesSystem } from "../visuals/TubesSystem";

import NavBar from "../layout/NavBar";
import Hero from "../sections/Hero";
import About from "../sections/About";
import WhatWeDo from "../sections/WhatWeDo";
import Works from "../sections/Works";
import Contact from "../sections/Contact";

const AppShell: React.FC = () => {
  return (
    <ScrollProgressProvider>
      <CustomCursor />
      {/* Outer container controlling full-screen sections */}
      <div className="relative w-screen h-screen bg-black text-white overflow-hidden">

        {/* FIXED BACKGROUND WEBGL CANVAS */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <TubesSystem />
        </div>

        {/* FIXED NAVIGATION */}
        <div className="fixed top-0 inset-x-0 z-[90] pointer-events-none">
          <NavBar />
        </div>

        {/* FOREGROUND STACKED SECTIONS */}
        <div className="relative z-10 w-full h-full">
          <Hero />
          <About />
          <WhatWeDo />
          <Works />
          <Contact />
        </div>
      </div>
    </ScrollProgressProvider>
  );
};

export default AppShell;