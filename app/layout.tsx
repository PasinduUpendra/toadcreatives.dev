import type { Metadata } from "next";
import "./globals.css";
import TubesCursor from "@/components/visuals/TubesCursor";

export const metadata: Metadata = {
  title: "Toad Creatives – Motion-driven web experiences",
  description: "Toad Creatives – hybrid nature x tech web experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-hero-ink text-slate-50 antialiased">
        {/* Tubes cursor background (CodePen effect) */}
        <TubesCursor />

        {/* Content above tubes */}
        <div className="relative z-[1] min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}