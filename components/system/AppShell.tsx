// FILE: components/system/AppShell.tsx
"use client";

import React from "react";
import { ScrollProgressProvider } from "./ScrollProgressProvider";
import { TubesSystem } from "../visuals/TubesSystem";
import Hero from "../sections/Hero";
import About from "../sections/About";
import WhatWeDo from "../sections/WhatWeDo";
import Works from "../sections/Works";
import DebugSteps from "./DebugSteps"; // <-- ADD THIS
import Contact from "../sections/Contact";

const AppShell: React.FC = () => {
  return (
    <ScrollProgressProvider>
      <div className="relative w-screen h-screen bg-black text-white overflow-hidden">
        {/* WebGL tubes canvas, fixed behind everything */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <TubesSystem />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 w-full h-full">
          <Hero />
          <About />
          <WhatWeDo />
          <Works />
          <Contact />
          <DebugSteps /> {/* debug overlay */}
        </div>
      </div>
    </ScrollProgressProvider>
  );
};

export default AppShell;
