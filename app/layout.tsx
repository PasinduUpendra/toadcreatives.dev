// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/ui/CustomCursor";
import RightRailNav from "@/components/layout/RightRailNav";

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
        <CustomCursor />
        <RightRailNav />
        <div className="relative min-h-screen overflow-hidden">{children}</div>
      </body>
    </html>
  );
}