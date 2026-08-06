import { Plus_Jakarta_Sans, Inter_Tight } from "next/font/google";

// Omitting `weight` loads the variable font. One file instead of four static cuts,
// and it exposes the `wght` axis that the headline hover effect animates.
export const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const bodyFont = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
