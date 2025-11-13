// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToadCreatives.dev – Motion-driven Web Experiences",
  description: "Portfolio of Pasindu Upendra – crafting kinetic, scroll-driven web experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="page-noise min-h-screen bg-slate-950 text-slate-50 antialiased">
        <div className="relative flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}