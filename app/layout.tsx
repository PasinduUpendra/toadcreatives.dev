import type { Metadata } from "next";
import "./globals.css";
import { displayFont, bodyFont } from "./fonts";

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
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body className={`${bodyFont.className} antialiased`}>
        <div className="relative z-[1] min-h-screen bg-hero-ink text-slate-50">
          {children}
        </div>
      </body>
    </html>
  );
}
