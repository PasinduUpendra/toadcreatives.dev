"use client";

import type { ReactNode } from "react";
import { ScrollProgressProvider } from "@/components/system/ScrollProgressProvider";
import TubesSystem from "@/components/visuals/TubesSystem";
import { BackgroundLayer } from "@/components/visuals/BackgroundLayer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ScrollProgressProvider>
      <div className="relative min-h-screen">
        <BackgroundLayer />
        <TubesSystem />
        <main className="relative z-[2]">{children}</main>
      </div>
    </ScrollProgressProvider>
  );
}
