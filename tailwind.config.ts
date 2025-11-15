// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "toad-green": "#7BAE44",
        "toad-mint": "#A4E884",
        carbon: "#111212",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      backgroundImage: {
        "hero-ink":
          "radial-gradient(circle at top, #1a1f16 0, #050505 45%, #020202 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
